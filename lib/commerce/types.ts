import type { BillingInterval, SubscriptionStatus } from "@/lib/persistence";
import type {
  CheckoutPaymentProvider,
  CurrencyCode,
  RegionKey
} from "@/lib/region/types";

export type PurchaseType =
  | "single_report"
  | "premium_report"
  | "bundle"
  | "subscription"
  | "explanation_session";
export type PurchaseProvider = CheckoutPaymentProvider;
export type CheckoutIntentStatus =
  | "pending"
  | "requires_action"
  | "paid"
  | "failed"
  | "canceled"
  | "expired";
export type CommercePersistenceMode = "database" | "local_demo";
export type ReportAccessStatus =
  | "preview_only"
  | "owned_report"
  | "bundle_access"
  | "subscription_access";
export type OwnedAccessStatus = "active" | "queued" | "inactive";
export type ReportDeliveryStatus = "not_sent" | "queued" | "sent" | "failed";
export type ReportDownloadStatus = "available" | "processing" | "failed";
export type ReportGenerationStatus =
  | "pending"
  | "ready"
  | "generating"
  | "failed"
  | "requires_retry";
export type ReportResendStatus =
  | "not_requested"
  | "available"
  | "resent"
  | "failed";

export interface CheckoutIntent {
  id: string;
  userId: string;
  assessmentSessionId: string | null;
  assessmentSlug: string;
  assessmentTitle: string;
  topic: string;
  regionKey: RegionKey;
  offerId: string;
  offerTitle: string;
  purchaseType: PurchaseType;
  priceCents: number;
  currency: CurrencyCode;
  provider: PurchaseProvider;
  providerSessionId: string | null;
  providerOrderId: string | null;
  checkoutMode: "payment" | "subscription";
  providerPriceLookupKey: string | null;
  successUrl: string;
  cancelUrl: string;
  status: CheckoutIntentStatus;
  sourceBlogUrl: string | null;
  sourceTopic: string | null;
  includedAssessmentSlugs: string[];
  subscriptionPlanCode: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ExplanationEntitlementRecord {
  id: string;
  userId: string;
  purchaseRecordId: string;
  reportId: string | null;
  assessmentSlug: string;
  topic: string;
  title: string;
  durationMinutes: 30 | 60;
  regionKey: RegionKey;
  currency: CurrencyCode;
  pricePaidCents: number;
  status:
    | "pending"
    | "granted"
    | "ready_for_contact"
    | "contacted"
    | "scheduled"
    | "completed"
    | "canceled"
    | "expired";
  grantedAt: string | null;
  scheduledFor: string | null;
  completedAt: string | null;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  checkoutIntentId: string;
  purchaseType: PurchaseType;
  assessmentSlug: string;
  topic: string;
  reportId: string | null;
  bundleId: string | null;
  subscriptionId: string | null;
  sourceBlogUrl: string | null;
  sourceTopic: string | null;
  pricePaidCents: number;
  currency: CurrencyCode;
  provider: PurchaseProvider;
  providerSessionId: string | null;
  purchasedAt: string;
  paymentStatus: "paid" | "pending" | "canceled";
}

export interface ReportFileState {
  fileType: "pdf";
  fileName: string;
  storageKey: string | null;
  status: ReportDownloadStatus;
  formatVersion: "premium-report-v1";
  generatedAt: string | null;
  lastRequestedAt: string | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  failureReason: string | null;
}

export interface ReportDeliveryState {
  accountEmail: string;
  accountEmailStatus: ReportDeliveryStatus;
  accountEmailQueuedAt: string | null;
  accountEmailSentAt: string | null;
  alternateEmail: string | null;
  alternateEmailStatus: ReportDeliveryStatus;
  alternateEmailRequestedAt: string | null;
  alternateEmailSentAt: string | null;
  lastAttemptedAt: string | null;
  lastSentAt: string | null;
  resendCount: number;
  resendStatus: ReportResendStatus;
  failureReason: string | null;
}

export interface ReportUnlockState {
  assessmentSlug: string;
  accessStatus: ReportAccessStatus;
  fullReportVisible: boolean;
  dashboardSaved: boolean;
  actionsAvailable: boolean;
  lockedSectionsVisible: boolean;
  grantedAt: string | null;
  reasonLabel: string;
}

export interface OwnedReport {
  id: string;
  userId: string;
  assessmentSlug: string;
  reportTitle: string;
  topic: string;
  sourceBlogUrl: string | null;
  sourceTopic: string | null;
  purchasedAt: string;
  savedToDashboardAt: string;
  accessSource: PurchaseType;
  accessStatus: OwnedAccessStatus;
  purchaseRecordId: string;
  bundleId: string | null;
  subscriptionId: string | null;
  generationStatus: ReportGenerationStatus;
  generatedAt: string | null;
  viewUrl: string;
  previewUrl: string;
  lastViewedAt: string | null;
  file: ReportFileState;
  delivery: ReportDeliveryState;
  unlock: ReportUnlockState;
}

export interface OwnedBundle {
  id: string;
  userId: string;
  title: string;
  description: string;
  purchaseRecordId: string;
  primaryAssessmentSlug: string;
  includedAssessmentSlugs: string[];
  purchasedAt: string;
  pricePaidCents: number;
  currency: CurrencyCode;
  accessStatus: OwnedAccessStatus;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planCode: string;
  planLabel: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  pricePaidCents: number;
  currency: CurrencyCode;
  startedAt: string | null;
  renewalDate: string | null;
  canceledAt: string | null;
  reportCreditsRemaining: number;
  unlockedAssessmentSlugs: string[];
  upgradeSourceReportSlug: string | null;
  latestPurchaseRecordId: string | null;
}

export interface AccessState {
  assessmentSlug: string;
  status: ReportAccessStatus;
  canAccessFullReport: boolean;
  previewOnly: boolean;
  hasOwnedReport: boolean;
  unlockedByBundle: boolean;
  unlockedBySubscription: boolean;
  hasExplanationEntitlement: boolean;
  explanationSessionDurations: Array<30 | 60>;
  shouldShowLockedSections: boolean;
  reasonLabel: string;
}

export interface RecentActivityItem {
  id: string;
  type:
    | "purchase"
    | "delivery"
    | "download"
    | "bundle"
    | "subscription"
    | "explanation";
  title: string;
  description: string;
  occurredAt: string;
  relatedSlug: string | null;
}

export interface CommerceAccount {
  userId: string;
  fullName: string;
  accountEmail: string;
}

export interface CommerceState {
  account: CommerceAccount;
  purchaseRecords: PurchaseRecord[];
  ownedReports: OwnedReport[];
  ownedBundles: OwnedBundle[];
  subscriptions: SubscriptionRecord[];
  explanationEntitlements: ExplanationEntitlementRecord[];
  checkoutIntents: CheckoutIntent[];
  recentActivity: RecentActivityItem[];
}

export interface CheckoutSessionRequest {
  userId: string;
  assessmentSessionId?: string | null;
  assessmentSlug: string;
  assessmentTitle: string;
  topic: string;
  regionKey: RegionKey;
  offerId: string;
  offerTitle: string;
  purchaseType: PurchaseType;
  priceCents: number;
  currency: CurrencyCode;
  paymentProvider: CheckoutPaymentProvider;
  sourceBlogUrl: string | null;
  sourceTopic: string | null;
  includedAssessmentSlugs: string[];
  subscriptionPlanCode: string | null;
  checkoutEmail?: string | null;
  returnToPath?: string | null;
}

export interface CheckoutSessionDescriptor {
  providerReady: boolean;
  redirectUrl: string;
  cancelUrl: string;
  persistenceMode: CommercePersistenceMode;
  checkoutMethod: "redirect" | "razorpay_modal";
  intent: CheckoutIntent;
  providerPayload:
    | null
      | {
        provider: "razorpay";
        keyId: string;
        orderId: string;
        amount: number;
        currency: CurrencyCode;
        name: string;
        description: string;
        prefill?: {
          email?: string;
          name?: string;
        };
        themeColor: string;
      };
  notes: string[];
}
