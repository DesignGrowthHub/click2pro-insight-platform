import type {
  EmailDeliveryStatus,
  PurchasedReport,
  ReportFile,
  SourceAttribution
} from "@/lib/persistence";

import type { OwnedReport } from "./types";

export function toPurchasedReportModel(report: OwnedReport): PurchasedReport {
  return {
    id: report.id,
    userId: report.userId,
    assessmentSlug: report.assessmentSlug,
    reportTitle: report.reportTitle,
    topic: report.topic,
    purchaseDate: report.purchasedAt,
    sessionId: `owned-${report.assessmentSlug}`,
    sourceAttributionId: null,
    paymentRecordId: report.purchaseRecordId,
    status:
      report.generationStatus === "ready"
        ? "ready"
        : report.generationStatus === "pending" ||
            report.generationStatus === "generating"
          ? "generating"
        : "failed",
    reportGeneratedStatus: report.generationStatus,
    pdfAvailability: report.file.status,
    primaryFileId: `${report.id}-file`,
    emailDeliveryIds: [`${report.id}-account-email`, `${report.id}-alternate-email`],
    viewUrl: report.viewUrl,
    previewUrl: report.previewUrl,
    accountEmailSent: report.delivery.accountEmailStatus === "sent",
    alternateEmailSent: report.delivery.alternateEmailStatus === "sent",
    lastResendAt: report.delivery.lastSentAt,
    failureReason: report.file.failureReason ?? report.delivery.failureReason
  };
}

export function toReportFileModel(report: OwnedReport): ReportFile {
  return {
    id: `${report.id}-file`,
    purchasedReportId: report.id,
    fileType: "pdf",
    fileName: report.file.fileName,
    storageKey: report.file.storageKey ?? `reports/${report.userId}/${report.id}/report.pdf`,
    availability: report.file.status,
    generatedAt: report.file.generatedAt,
    downloadCount: report.file.downloadCount,
    lastDownloadedAt: report.file.lastDownloadedAt
  };
}

export function toDeliveryModels(report: OwnedReport): EmailDeliveryStatus[] {
  const deliveries: EmailDeliveryStatus[] = [
    {
      id: `${report.id}-account-email`,
      purchasedReportId: report.id,
      target: "account_email",
      recipientEmail: report.delivery.accountEmail,
      providerStatus:
        report.delivery.accountEmailStatus === "not_sent"
          ? "queued"
          : report.delivery.accountEmailStatus,
      firstSentAt: report.delivery.lastSentAt,
      lastSentAt: report.delivery.lastSentAt,
      resendCount: report.delivery.resendCount,
      failureReason: report.delivery.failureReason
    }
  ];

  if (report.delivery.alternateEmail || report.delivery.alternateEmailStatus !== "not_sent") {
    deliveries.push({
      id: `${report.id}-alternate-email`,
      purchasedReportId: report.id,
      target: "alternate_email",
      recipientEmail: report.delivery.alternateEmail ?? "",
      providerStatus:
        report.delivery.alternateEmailStatus === "not_sent"
          ? "queued"
          : report.delivery.alternateEmailStatus,
      firstSentAt: report.delivery.lastSentAt,
      lastSentAt: report.delivery.lastSentAt,
      resendCount: 0,
      failureReason: report.delivery.failureReason
    });
  }

  return deliveries;
}

export function toSourceAttributionModel(report: OwnedReport): SourceAttribution | null {
  if (!report.sourceBlogUrl) {
    return null;
  }

  return {
    id: `${report.id}-source`,
    sourceBlogUrl: report.sourceBlogUrl,
    sourceBlogSlug: report.sourceBlogUrl.split("/").filter(Boolean).at(-1) ?? report.assessmentSlug,
    sourceTopic: report.sourceTopic ?? report.topic,
    referralMedium: "popup",
    landingPath: `/assessments/${report.assessmentSlug}`,
    assessmentSlug: report.assessmentSlug,
    topic: report.topic,
    firstTouchedAt: report.purchasedAt
  };
}
