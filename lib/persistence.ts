export type TimestampISO = string;

export type AssessmentLifecycleStatus =
  | "landed"
  | "started"
  | "completed"
  | "paid";

export type ReportGenerationStatus =
  | "pending"
  | "ready"
  | "generating"
  | "failed"
  | "requires_retry";
export type ReportLibraryStatus = ReportGenerationStatus;
export type PdfAvailabilityStatus = "available" | "processing" | "failed";
export type EmailDeliveryProviderStatus =
  | "queued"
  | "sent"
  | "failed"
  | "bounced";
export type EmailDeliveryTarget = "account_email" | "alternate_email";
export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";
export type BillingInterval = "monthly" | "annual";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PurchaseProductType =
  | "single_report"
  | "premium_report"
  | "bundle"
  | "subscription"
  | "explanation_session";
export type UserAccountStatus = "active" | "paused" | "invited";

// These interfaces are intentionally serialization-friendly so future API and DB
// layers can share the same shape without rewriting the front-end contracts.
export interface User {
  id: string;
  fullName: string;
  email: string;
  defaultReportEmail: string;
  createdAt: TimestampISO;
  accountStatus: UserAccountStatus;
  activeSubscriptionId: string | null;
  purchasedReportIds: string[];
  lifetimeValueCents: number;
}

export interface SourceAttribution {
  id: string;
  sourceBlogUrl: string;
  sourceBlogSlug: string;
  sourceTopic: string;
  referralMedium: "organic_blog" | "popup" | "direct" | "email";
  landingPath: string;
  assessmentSlug: string;
  topic: string;
  firstTouchedAt: TimestampISO;
}

export interface AssessmentSession {
  id: string;
  userId: string | null;
  assessmentSlug: string;
  topic: string;
  sourceAttributionId: string | null;
  sourceBlogUrl: string | null;
  startedStatus: boolean;
  completedStatus: boolean;
  paidStatus: boolean;
  sessionStatus: AssessmentLifecycleStatus;
  progressPercent: number;
  startedAt: TimestampISO | null;
  completedAt: TimestampISO | null;
  previewViewedAt: TimestampISO | null;
  unlockClickedAt: TimestampISO | null;
  paidAt: TimestampISO | null;
  reportGeneratedStatus: ReportGenerationStatus;
}

export interface ReportFile {
  id: string;
  purchasedReportId: string;
  fileType: "pdf" | "html";
  fileName: string;
  storageKey: string;
  availability: PdfAvailabilityStatus;
  generatedAt: TimestampISO | null;
  downloadCount: number;
  lastDownloadedAt: TimestampISO | null;
}

export interface EmailDeliveryStatus {
  id: string;
  purchasedReportId: string;
  target: EmailDeliveryTarget;
  recipientEmail: string;
  providerStatus: EmailDeliveryProviderStatus;
  firstSentAt: TimestampISO | null;
  lastSentAt: TimestampISO | null;
  resendCount: number;
  failureReason: string | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  purchasedReportId: string | null;
  subscriptionId: string | null;
  productType: PurchaseProductType;
  productReference: string;
  currency: string;
  amountCents: number;
  status: PaymentStatus;
  provider: "placeholder";
  providerReference: string | null;
  createdAt: TimestampISO;
  paidAt: TimestampISO | null;
}

export interface Subscription {
  id: string;
  userId: string;
  planCode: string;
  planLabel: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  startedAt: TimestampISO | null;
  renewalDate: TimestampISO | null;
  canceledAt: TimestampISO | null;
  reportCreditsRemaining: number;
  unlockedAssessmentSlugs: string[];
  upgradeSourceReportSlug: string | null;
}

export interface PurchasedReport {
  id: string;
  userId: string;
  assessmentSlug: string;
  reportTitle: string;
  topic: string;
  purchaseDate: TimestampISO;
  sessionId: string;
  sourceAttributionId: string | null;
  paymentRecordId: string;
  status: ReportLibraryStatus;
  reportGeneratedStatus: ReportGenerationStatus;
  pdfAvailability: PdfAvailabilityStatus;
  primaryFileId: string | null;
  emailDeliveryIds: string[];
  viewUrl: string;
  previewUrl: string;
  accountEmailSent: boolean;
  alternateEmailSent: boolean;
  lastResendAt: TimestampISO | null;
  failureReason: string | null;
}
