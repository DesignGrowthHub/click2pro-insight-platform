import type { PurchaseType } from "@/lib/commerce/types";
import type { OwnedReport } from "@/lib/commerce/types";
import type { PremiumReport } from "@/lib/types/assessment-domain";

export type ReportAssetStatus =
  | "pending"
  | "ready"
  | "generating"
  | "failed"
  | "requires_retry";
export type ReportPdfStatus = "ready" | "processing" | "failed";
export type ReportEmailStatus = "not_sent" | "queued" | "sent" | "failed";
export type ReportResendStatus =
  | "not_requested"
  | "available"
  | "resent"
  | "failed";
export type ReportOwnershipAccessStatus =
  | "preview_only"
  | "owned"
  | "bundle_unlocked"
  | "membership_unlocked";

export interface ReportRecord {
  id: string;
  userId: string;
  assessmentSlug: string;
  topic: string;
  reportTitle: string;
  purchaseType: PurchaseType;
  generatedAt: string | null;
  accessStatus: ReportOwnershipAccessStatus;
  assetStatus: ReportAssetStatus;
  pdfStatus: ReportPdfStatus;
  emailStatus: ReportEmailStatus;
  lastDownloadedAt: string | null;
  resendStatus: ReportResendStatus;
  downloadCount: number;
  sourceBlogUrl: string | null;
}

export interface ReportContent {
  id: string;
  reportId: string;
  userId: string;
  assessmentSlug: string;
  topic: string;
  generatedAt: string | null;
  contentStatus: ReportAssetStatus;
  sectionCount: number;
  previewInsightCount: number;
  narrativeMode: string;
  storageState: "embedded_placeholder" | "storage_ready";
  summaryLabel: string;
  summaryTitle: string;
}

export interface ReportFile {
  id: string;
  reportId: string;
  userId: string;
  fileType: "pdf";
  fileName: string;
  storageKey: string | null;
  status: ReportPdfStatus;
  generatedAt: string | null;
  lastDownloadedAt: string | null;
  downloadCount: number;
  formatVersion: string;
  providerNote: string;
}

export interface ReportAccess {
  id: string;
  reportId: string;
  userId: string;
  assessmentSlug: string;
  topic: string;
  purchaseType: PurchaseType;
  accessStatus: ReportOwnershipAccessStatus;
  grantedAt: string | null;
  dashboardVisible: boolean;
  fullReportVisible: boolean;
  membershipEligible: boolean;
  lockedSectionsVisible: boolean;
  lastViewedAt: string | null;
  lastDownloadedAt: string | null;
}

export interface EmailDeliveryRecord {
  id: string;
  reportId: string;
  userId: string;
  assessmentSlug: string;
  topic: string;
  target: "account_email" | "alternate_email";
  recipientEmail: string;
  purchaseType: PurchaseType;
  emailStatus: ReportEmailStatus;
  queuedAt: string | null;
  sentAt: string | null;
  lastAttemptedAt: string | null;
  resendCount: number;
  resendStatus: ReportResendStatus;
  failureReason: string | null;
}

export interface DownloadRecord {
  id: string;
  reportId: string;
  userId: string;
  assessmentSlug: string;
  topic: string;
  fileId: string;
  downloadedAt: string | null;
  downloadSource: "dashboard" | "report_view" | "checkout_success" | "unknown";
  status: "completed" | "not_yet_downloaded";
}

export interface ReportOwnershipSnapshot {
  record: ReportRecord;
  content: ReportContent;
  file: ReportFile;
  access: ReportAccess;
  deliveries: EmailDeliveryRecord[];
  downloads: DownloadRecord[];
}

function mapAccessStatus(report: OwnedReport): ReportOwnershipAccessStatus {
  if (report.unlock.accessStatus === "subscription_access") {
    return "membership_unlocked";
  }

  if (report.unlock.accessStatus === "bundle_access") {
    return "bundle_unlocked";
  }

  if (report.unlock.accessStatus === "preview_only") {
    return "preview_only";
  }

  return "owned";
}

function mapAssetStatus(report: OwnedReport): ReportAssetStatus {
  return report.generationStatus;
}

function mapPdfStatus(report: OwnedReport): ReportPdfStatus {
  if (report.file.status === "available") {
    return "ready";
  }

  if (report.file.status === "processing") {
    return "processing";
  }

  return "failed";
}

function combineEmailStatus(report: OwnedReport): ReportEmailStatus {
  if (
    report.delivery.accountEmailStatus === "sent" ||
    report.delivery.alternateEmailStatus === "sent"
  ) {
    return "sent";
  }

  if (
    report.delivery.accountEmailStatus === "failed" ||
    report.delivery.alternateEmailStatus === "failed"
  ) {
    return "failed";
  }

  if (
    report.delivery.accountEmailStatus === "queued" ||
    report.delivery.alternateEmailStatus === "queued"
  ) {
    return "queued";
  }

  return "not_sent";
}

function buildReportContent(
  report: OwnedReport,
  premiumReport?: PremiumReport | null
): ReportContent {
  return {
    id: `${report.id}-content`,
    reportId: report.id,
    userId: report.userId,
    assessmentSlug: report.assessmentSlug,
    topic: report.topic,
    generatedAt: report.generatedAt ?? report.file.generatedAt ?? report.purchasedAt,
    contentStatus: mapAssetStatus(report),
    sectionCount: premiumReport?.sections.length ?? 7,
    previewInsightCount: premiumReport?.previewInsights.length ?? 3,
    narrativeMode: premiumReport?.assemblyMeta.narrativeMode ?? "mock",
    storageState: "storage_ready",
    summaryLabel: premiumReport?.summaryLabel ?? report.reportTitle,
    summaryTitle: premiumReport?.summaryTitle ?? report.reportTitle
  };
}

function buildReportFile(report: OwnedReport): ReportFile {
  return {
    id: `${report.id}-pdf`,
    reportId: report.id,
    userId: report.userId,
    fileType: "pdf",
    fileName: report.file.fileName,
    storageKey: report.file.storageKey,
    status: mapPdfStatus(report),
    generatedAt: report.file.generatedAt,
    lastDownloadedAt: report.file.lastDownloadedAt,
    downloadCount: report.file.downloadCount,
    formatVersion: report.file.formatVersion,
    providerNote:
      "The PDF asset is attached to the saved report record, with storage metadata and download history tied to the same owned library entry."
  };
}

function buildReportAccess(report: OwnedReport): ReportAccess {
  return {
    id: `${report.id}-access`,
    reportId: report.id,
    userId: report.userId,
    assessmentSlug: report.assessmentSlug,
    topic: report.topic,
    purchaseType: report.accessSource,
    accessStatus: mapAccessStatus(report),
    grantedAt: report.unlock.grantedAt,
    dashboardVisible: report.unlock.dashboardSaved,
    fullReportVisible: report.unlock.fullReportVisible,
    membershipEligible: report.accessSource === "subscription",
    lockedSectionsVisible: report.unlock.lockedSectionsVisible,
    lastViewedAt: report.lastViewedAt,
    lastDownloadedAt: report.file.lastDownloadedAt
  };
}

function buildDeliveryRecords(report: OwnedReport): EmailDeliveryRecord[] {
  const deliveries: EmailDeliveryRecord[] = [
    {
      id: `${report.id}-delivery-account`,
      reportId: report.id,
      userId: report.userId,
      assessmentSlug: report.assessmentSlug,
      topic: report.topic,
      target: "account_email",
      recipientEmail: report.delivery.accountEmail,
      purchaseType: report.accessSource,
      emailStatus: report.delivery.accountEmailStatus,
      queuedAt: report.delivery.accountEmailQueuedAt,
      sentAt: report.delivery.accountEmailSentAt,
      lastAttemptedAt: report.delivery.lastAttemptedAt,
      resendCount: report.delivery.resendCount,
      resendStatus: report.delivery.resendStatus,
      failureReason: report.delivery.failureReason
    }
  ];

  if (report.delivery.alternateEmail) {
    deliveries.push({
      id: `${report.id}-delivery-alternate`,
      reportId: report.id,
      userId: report.userId,
      assessmentSlug: report.assessmentSlug,
      topic: report.topic,
      target: "alternate_email",
      recipientEmail: report.delivery.alternateEmail,
      purchaseType: report.accessSource,
      emailStatus: report.delivery.alternateEmailStatus,
      queuedAt: report.delivery.alternateEmailRequestedAt,
      sentAt: report.delivery.alternateEmailSentAt,
      lastAttemptedAt: report.delivery.lastAttemptedAt,
      resendCount: report.delivery.resendCount,
      resendStatus: report.delivery.resendStatus,
      failureReason: report.delivery.failureReason
    });
  }

  return deliveries;
}

function buildDownloadRecords(report: OwnedReport): DownloadRecord[] {
  return [
    {
      id: `${report.id}-download-latest`,
      reportId: report.id,
      userId: report.userId,
      assessmentSlug: report.assessmentSlug,
      topic: report.topic,
      fileId: `${report.id}-pdf`,
      downloadedAt: report.file.lastDownloadedAt,
      downloadSource: report.file.lastDownloadedAt ? "dashboard" : "unknown",
      status: report.file.lastDownloadedAt ? "completed" : "not_yet_downloaded"
    }
  ];
}

export function buildReportOwnershipSnapshot(
  report: OwnedReport,
  premiumReport?: PremiumReport | null
): ReportOwnershipSnapshot {
  const content = buildReportContent(report, premiumReport);
  const file = buildReportFile(report);
  const access = buildReportAccess(report);
  const deliveries = buildDeliveryRecords(report);
  const downloads = buildDownloadRecords(report);

  return {
    record: {
      id: report.id,
      userId: report.userId,
      assessmentSlug: report.assessmentSlug,
      topic: report.topic,
      reportTitle: report.reportTitle,
      purchaseType: report.accessSource,
      generatedAt: content.generatedAt,
      accessStatus: access.accessStatus,
      assetStatus: mapAssetStatus(report),
      pdfStatus: file.status,
      emailStatus: combineEmailStatus(report),
      lastDownloadedAt: file.lastDownloadedAt,
      resendStatus: report.delivery.resendStatus,
      downloadCount: file.downloadCount,
      sourceBlogUrl: report.sourceBlogUrl
    },
    content,
    file,
    access,
    deliveries,
    downloads
  };
}
