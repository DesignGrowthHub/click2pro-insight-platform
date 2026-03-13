import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ensureOwnedReportPdfAsset } from "@/lib/server/services/report-assets";
import { queueAndSendOwnedReportEmail } from "@/lib/server/services/report-deliveries";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { generateAndPersistPremiumReport } from "@/lib/server/services/report-pipeline";
import { updateReportById } from "@/lib/server/services/reports";

async function loadRecoverableReport(reportId: string, userId?: string | null) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      ...(userId ? { userId } : {})
    },
    select: {
      id: true,
      userId: true,
      title: true,
      assessmentSlug: true,
      status: true,
      accessStatus: true,
      reportPayload: true,
      pdfStatus: true,
      emailStatus: true
    }
  });
}

export async function retryReportGeneration(input: {
  reportId: string;
  userId?: string | null;
  actorId?: string | null;
}) {
  const report = await loadRecoverableReport(input.reportId, input.userId);

  if (!report) {
    throw new Error("The saved report could not be found for retry.");
  }

  if (report.status === "GENERATING") {
    return {
      outcome: "already_generating" as const,
      message: "The premium report is already being regenerated."
    };
  }

  if (report.status === "READY" && report.reportPayload) {
    return {
      outcome: "already_ready" as const,
      message: "The premium report is already available."
    };
  }

  await updateReportById(report.id, {
    status: "QUEUED",
    failureReason: null
  });

  await recordOperationalEvent({
    eventType: "report_generation",
    eventKey: report.id,
    status: "RETRIED",
    userId: report.userId,
    reportId: report.id,
    message: "Report generation was manually retried.",
    metadata: {
      actorId: input.actorId ?? input.userId ?? null
    }
  });

  const next = await generateAndPersistPremiumReport(report.id);

  return {
    outcome:
      next?.generationStatus === "completed"
        ? "completed"
        : next?.generationStatus === "failed" || next?.generationStatus === "requires_retry"
          ? "failed"
          : "queued",
    message:
      next?.generationStatus === "completed"
        ? "The report was regenerated successfully."
        : next?.generationStatus === "failed" || next?.generationStatus === "requires_retry"
          ? next.failureReason ?? "The report still needs another retry."
          : "The report retry has been queued and is still in progress."
  };
}

export async function retryReportPdfGeneration(input: {
  reportId: string;
  userId?: string | null;
  actorId?: string | null;
}) {
  const report = await loadRecoverableReport(input.reportId, input.userId);

  if (!report) {
    throw new Error("The saved report could not be found for PDF retry.");
  }

  if (report.status !== "READY") {
    throw new Error("The premium report must finish generating before a PDF can be retried.");
  }

  if (report.pdfStatus === "GENERATING") {
    return {
      outcome: "already_generating" as const,
      message: "The report PDF is already being regenerated."
    };
  }

  await recordOperationalEvent({
    eventType: "report_pdf_generation",
    eventKey: report.id,
    status: "RETRIED",
    userId: report.userId,
    reportId: report.id,
    message: "PDF generation was manually retried.",
    metadata: {
      actorId: input.actorId ?? input.userId ?? null
    }
  });

  await ensureOwnedReportPdfAsset(report.id, input.userId ?? null, {
    forceRegenerate: true
  });

  return {
    outcome: "ready" as const,
    message: "The report PDF was regenerated successfully."
  };
}

export async function retryReportAccountEmailDelivery(input: {
  reportId: string;
  userId?: string | null;
  actorId?: string | null;
}) {
  const report = await loadRecoverableReport(input.reportId, input.userId);

  if (!report) {
    throw new Error("The saved report could not be found for email retry.");
  }

  if (report.accessStatus === "PREVIEW_ONLY") {
    throw new Error("The full report is not unlocked for delivery yet.");
  }

  await recordOperationalEvent({
    eventType: "report_email_delivery",
    eventKey: report.id,
    status: "RETRIED",
    userId: report.userId,
    reportId: report.id,
    message: "Account-email delivery was manually retried.",
    metadata: {
      actorId: input.actorId ?? input.userId ?? null
    }
  });

  await queueAndSendOwnedReportEmail({
    reportId: report.id,
    userId: report.userId,
    target: "account_email",
    trigger: "resend"
  });

  return {
    outcome: "sent" as const,
    message: "The report was resent to the account email."
  };
}
