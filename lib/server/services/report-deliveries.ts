import "server-only";

import { getAppBaseUrl } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import {
  buildReportEmailHtml,
  buildReportEmailSubject,
  buildReportEmailText
} from "@/lib/email/report-email-template";
import { getConfiguredReportEmailProvider } from "@/lib/email/provider";
import { ensureOwnedReportPdfAsset } from "@/lib/server/services/report-assets";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { normalizeEmail } from "@/lib/server/utils";
import type { PremiumReport } from "@/lib/types/assessment-domain";

type ReportForDelivery = NonNullable<
  Awaited<ReturnType<typeof loadReportForDelivery>>
>;

type DeliveryTrigger = "purchase_auto" | "resend" | "alternate_send";

function parsePremiumReport(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as PremiumReport;
}

function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function loadReportForDelivery(reportId: string, userId?: string | null) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      ...(userId ? { userId } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      },
      emailDeliveries: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
}

function getLatestDeliveryAttempt(
  report: ReportForDelivery,
  targetType: "ACCOUNT_EMAIL" | "ALTERNATE_EMAIL"
) {
  return report.emailDeliveries.find((item) => item.targetType === targetType) ?? null;
}

function canReuseQueuedAttempt(input: {
  report: ReportForDelivery;
  targetType: "ACCOUNT_EMAIL" | "ALTERNATE_EMAIL";
  recipientEmail: string;
}) {
  const latestAttempt = getLatestDeliveryAttempt(input.report, input.targetType);

  if (!latestAttempt || latestAttempt.status !== "QUEUED") {
    return null;
  }

  if (latestAttempt.recipientEmail !== input.recipientEmail) {
    return null;
  }

  return latestAttempt;
}

function getViewUrl(report: ReportForDelivery) {
  const baseUrl = getAppBaseUrl("http://localhost:3000");

  return `${baseUrl.replace(/\/+$/, "")}/reports/${report.assessmentSlug}`;
}

async function createQueuedDeliveryAttempt(input: {
  report: ReportForDelivery;
  targetType: "ACCOUNT_EMAIL" | "ALTERNATE_EMAIL";
  recipientEmail: string;
  trigger: DeliveryTrigger;
}) {
  const queuedAttempt = canReuseQueuedAttempt(input);

  if (queuedAttempt) {
    return queuedAttempt;
  }

  const latestAttempt = getLatestDeliveryAttempt(input.report, input.targetType);
  const now = new Date();
  const resendCount = input.trigger === "purchase_auto" ? 0 : (latestAttempt?.resendCount ?? 0) + 1;

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.emailDeliveryRecord.create({
      data: {
        userId: input.report.userId,
        reportId: input.report.id,
        recipientEmail: input.recipientEmail,
        targetType: input.targetType,
        status: "QUEUED",
        resendCount,
        lastAttemptedAt: now,
        metadata: {
          trigger: input.trigger
        }
      }
    });

    await tx.report.update({
      where: {
        id: input.report.id
      },
      data: {
        emailStatus: "QUEUED"
      }
    });

    return attempt;
  });
}

async function updateDeliveryAttemptSuccess(input: {
  deliveryRecordId: string;
  providerName: string;
  providerMessageId: string | null;
  mode: "live" | "mock";
  reportId: string;
}) {
  const sentAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.emailDeliveryRecord.update({
      where: {
        id: input.deliveryRecordId
      },
      data: {
        status: "SENT",
        providerName: input.providerName,
        providerMessageId: input.providerMessageId,
        sentAt,
        lastAttemptedAt: sentAt,
        failureReason: null,
        metadata: {
          mode: input.mode
        }
      }
    });

    await tx.report.update({
      where: {
        id: input.reportId
      },
      data: {
        emailStatus: "SENT",
        lastEmailedAt: sentAt
      }
    });
  });
}

async function updateDeliveryAttemptFailure(input: {
  deliveryRecordId: string;
  reportId: string;
  failureReason: string;
}) {
  const attemptedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.emailDeliveryRecord.update({
      where: {
        id: input.deliveryRecordId
      },
      data: {
        status: "FAILED",
        failureReason: input.failureReason,
        lastAttemptedAt: attemptedAt
      }
    });

    await tx.report.update({
      where: {
        id: input.reportId
      },
      data: {
        emailStatus: "FAILED"
      }
    });
  });
}

async function sendDeliveryAttempt(input: {
  report: ReportForDelivery;
  deliveryRecordId: string;
  targetType: "ACCOUNT_EMAIL" | "ALTERNATE_EMAIL";
  recipientEmail: string;
}) {
  const premiumReport = parsePremiumReport(input.report.reportPayload);

  if (!premiumReport) {
    throw new Error("The saved premium report content is not ready for email delivery yet.");
  }

  const pdfAsset = await ensureOwnedReportPdfAsset(input.report.id, input.report.userId);
  const provider = getConfiguredReportEmailProvider();
  const subject = buildReportEmailSubject(input.report.title);
  const html = buildReportEmailHtml({
    recipientName: input.report.user.fullName ?? null,
    reportTitle: input.report.title,
    summaryLabel: premiumReport.summaryLabel,
    summaryNarrative: premiumReport.summaryNarrative,
    viewUrl: getViewUrl(input.report)
  });
  const text = buildReportEmailText({
    recipientName: input.report.user.fullName ?? null,
    reportTitle: input.report.title,
    summaryLabel: premiumReport.summaryLabel,
    summaryNarrative: premiumReport.summaryNarrative,
    viewUrl: getViewUrl(input.report)
  });

  return provider.send({
    reportId: input.report.id,
    deliveryRecordId: input.deliveryRecordId,
    targetType: input.targetType,
    to: input.recipientEmail,
    subject,
    html,
    text,
    attachments: [
      {
        filename: pdfAsset.fileName,
        contentType: "application/pdf",
        contentBase64: pdfAsset.buffer.toString("base64")
      }
    ]
  });
}

export async function queueAndSendOwnedReportEmail(input: {
  reportId: string;
  userId: string;
  target: "account_email" | "alternate_email";
  recipientEmail?: string | null;
  trigger: DeliveryTrigger;
}) {
  const report = await loadReportForDelivery(input.reportId, input.userId);

  if (!report) {
    throw new Error("The owned report could not be found.");
  }

  if (report.accessStatus === "PREVIEW_ONLY") {
    throw new Error("This report is still locked and cannot be delivered.");
  }

  const recipientEmail =
    input.target === "account_email"
      ? report.user.email
      : normalizeEmail(input.recipientEmail ?? "");

  if (!isEmailAddress(recipientEmail)) {
    throw new Error("Enter a valid email address for alternate delivery.");
  }

  const deliveryAttempt = await createQueuedDeliveryAttempt({
    report,
    targetType: input.target === "account_email" ? "ACCOUNT_EMAIL" : "ALTERNATE_EMAIL",
    recipientEmail,
    trigger: input.trigger
  });

  await recordOperationalEvent({
    eventType: "report_email_delivery",
    eventKey: deliveryAttempt.id,
    status: input.trigger === "purchase_auto" ? "STARTED" : "RETRIED",
    userId: report.userId,
    reportId: report.id,
    message:
      input.target === "account_email"
        ? "Report email delivery started for the account inbox."
        : "Report email delivery started for the alternate inbox.",
    metadata: {
      trigger: input.trigger,
      target: input.target,
      recipientEmail
    }
  });

  try {
    const result = await sendDeliveryAttempt({
      report,
      deliveryRecordId: deliveryAttempt.id,
      targetType:
        input.target === "account_email" ? "ACCOUNT_EMAIL" : "ALTERNATE_EMAIL",
      recipientEmail
    });

    await updateDeliveryAttemptSuccess({
      deliveryRecordId: deliveryAttempt.id,
      providerName: result.providerName,
      providerMessageId: result.providerMessageId,
      mode: result.mode,
      reportId: report.id
    });

    await recordOperationalEvent({
      eventType: "report_email_delivery",
      eventKey: deliveryAttempt.id,
      status: "SUCCEEDED",
      userId: report.userId,
      reportId: report.id,
      message:
        input.target === "account_email"
          ? "Report email delivery completed for the account inbox."
          : "Report email delivery completed for the alternate inbox.",
      metadata: {
        providerName: result.providerName,
        mode: result.mode,
        target: input.target
      }
    });

    return {
      ok: true as const,
      message:
        input.target === "account_email"
          ? input.trigger === "resend"
            ? "The report was resent to the account email."
            : "The report was sent to the account email."
          : "The report was sent to the alternate email."
    };
  } catch (error) {
    const failureReason =
      error instanceof Error
        ? error.message
        : "The report email could not be delivered.";

    await updateDeliveryAttemptFailure({
      deliveryRecordId: deliveryAttempt.id,
      reportId: report.id,
      failureReason
    });

    await recordOperationalEvent({
      eventType: "report_email_delivery",
      eventKey: deliveryAttempt.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      message: failureReason,
      metadata: {
        trigger: input.trigger,
        target: input.target
      }
    });

    throw new Error(failureReason);
  }
}

export async function processQueuedAccountEmailDelivery(reportId: string) {
  const report = await loadReportForDelivery(reportId);

  if (!report) {
    return null;
  }

  const queuedAttempt = report.emailDeliveries.find(
    (item) => item.targetType === "ACCOUNT_EMAIL" && item.status === "QUEUED"
  );

  if (!queuedAttempt) {
    return null;
  }

  try {
    const result = await sendDeliveryAttempt({
      report,
      deliveryRecordId: queuedAttempt.id,
      targetType: "ACCOUNT_EMAIL",
      recipientEmail: queuedAttempt.recipientEmail
    });

    await updateDeliveryAttemptSuccess({
      deliveryRecordId: queuedAttempt.id,
      providerName: result.providerName,
      providerMessageId: result.providerMessageId,
      mode: result.mode,
      reportId: report.id
    });

    await recordOperationalEvent({
      eventType: "report_email_delivery",
      eventKey: queuedAttempt.id,
      status: "SUCCEEDED",
      userId: report.userId,
      reportId: report.id,
      message: "Queued account-email delivery completed for the saved report.",
      metadata: {
        providerName: result.providerName,
        mode: result.mode,
        target: "account_email"
      }
    });

    return {
      ok: true as const
    };
  } catch (error) {
    const failureReason =
      error instanceof Error
        ? error.message
        : "The report email could not be delivered.";

    await updateDeliveryAttemptFailure({
      deliveryRecordId: queuedAttempt.id,
      reportId: report.id,
      failureReason
    });

    await recordOperationalEvent({
      eventType: "report_email_delivery",
      eventKey: queuedAttempt.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      message: failureReason,
      metadata: {
        target: "account_email",
        trigger: "purchase_auto"
      }
    });

    return {
      ok: false as const,
      failureReason
    };
  }
}
