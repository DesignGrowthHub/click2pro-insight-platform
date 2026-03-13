import type {
  EmailDeliveryRecord,
  ReportFile,
  ReportRecord
} from "@/lib/reports/report-ownership";

export interface ReportEmailRequest {
  id: string;
  reportId: string;
  userId: string;
  recipientEmail: string;
  target: "account_email" | "alternate_email";
  trigger: "purchase_auto" | "resend" | "alternate_send";
  deliveryStatus: EmailDeliveryRecord["emailStatus"];
  pdfRequired: boolean;
  queuedAt: string | null;
  provider: "configured_email_provider";
}

export interface ReportEmailPlan {
  automaticAfterPurchase: boolean;
  accountDeliveryEnabled: boolean;
  alternateDeliveryEnabled: boolean;
  resendEnabled: boolean;
  note: string;
}

export function buildAccountEmailRequest(
  reportRecord: ReportRecord,
  delivery: EmailDeliveryRecord
): ReportEmailRequest {
  return {
    id: `${delivery.id}-request`,
    reportId: reportRecord.id,
    userId: reportRecord.userId,
    recipientEmail: delivery.recipientEmail,
    target: "account_email",
    trigger: delivery.resendCount > 0 ? "resend" : "purchase_auto",
    deliveryStatus: delivery.emailStatus,
    pdfRequired: true,
    queuedAt: delivery.queuedAt,
    provider: "configured_email_provider"
  };
}

export function buildAlternateEmailRequest(
  reportRecord: ReportRecord,
  recipientEmail: string
): ReportEmailRequest {
  return {
    id: `${reportRecord.id}-alternate-request`,
    reportId: reportRecord.id,
    userId: reportRecord.userId,
    recipientEmail,
    target: "alternate_email",
    trigger: "alternate_send",
    deliveryStatus: "queued",
    pdfRequired: true,
    queuedAt: new Date().toISOString(),
    provider: "configured_email_provider"
  };
}

export function buildReportEmailPlan(
  reportRecord: ReportRecord,
  file: ReportFile,
  deliveries: EmailDeliveryRecord[]
): ReportEmailPlan {
  const accountDelivery = deliveries.find((item) => item.target === "account_email");

  return {
    automaticAfterPurchase: true,
    accountDeliveryEnabled: file.status === "ready",
    alternateDeliveryEnabled: file.status === "ready",
    resendEnabled: Boolean(accountDelivery) && file.status === "ready",
    note:
      file.status === "ready"
        ? "The saved report can send to the account email automatically, then support resend and alternate delivery from the owned library."
        : "Delivery stays visible, but sending should wait until the PDF asset is ready."
  };
}

export function getEmailDeliveryStatusNote(delivery: EmailDeliveryRecord) {
  if (delivery.emailStatus === "sent") {
    return "A delivery attempt was completed for this report asset.";
  }

  if (delivery.emailStatus === "queued") {
    return "Queued for delivery as soon as the report asset is ready.";
  }

  if (delivery.emailStatus === "failed") {
    return delivery.failureReason ?? "Delivery needs retry handling.";
  }

  return "No delivery has been triggered yet.";
}
