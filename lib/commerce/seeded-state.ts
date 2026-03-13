import { getAssessmentsBySlugs } from "@/lib/assessments";
import { platformPricing } from "@/lib/pricing";
import type { CurrencyCode } from "@/lib/region/types";
import {
  currentSubscription,
  dashboardRecommendedInsights,
  dashboardUser,
  emailDeliveryStatuses,
  membershipBenefits,
  paymentRecords,
  purchasedReports,
  reportFiles,
  sourceAttributions
} from "@/lib/mock-platform";
import type { Subscription } from "@/lib/persistence";

import type {
  CommerceState,
  ExplanationEntitlementRecord,
  OwnedBundle,
  OwnedReport,
  PurchaseRecord,
  RecentActivityItem,
  ReportUnlockState,
  SubscriptionRecord
} from "./types";

function paymentStatusToPurchaseStatus(status: string) {
  if (status === "paid") {
    return "paid" as const;
  }

  if (status === "pending") {
    return "pending" as const;
  }

  return "canceled" as const;
}

function normalizeCurrencyCode(currency: string): CurrencyCode {
  return currency === "INR" ? "INR" : "USD";
}

function buildUnlockState(report: typeof purchasedReports[number]): ReportUnlockState {
  const canAccess = report.status === "ready";

  return {
    assessmentSlug: report.assessmentSlug,
    accessStatus: canAccess ? "owned_report" : "preview_only",
    fullReportVisible: canAccess,
    dashboardSaved: true,
    actionsAvailable: canAccess,
    lockedSectionsVisible: !canAccess,
    grantedAt: report.purchaseDate,
    reasonLabel: canAccess
      ? "Owned through a completed purchase"
      : "Preview remains visible while report generation is incomplete"
  };
}

function toOwnedReport(report: typeof purchasedReports[number]): OwnedReport {
  const file = reportFiles.find((item) => item.id === report.primaryFileId);
  const accountDelivery = emailDeliveryStatuses.find(
    (item) =>
      item.purchasedReportId === report.id && item.target === "account_email"
  );
  const alternateDelivery = emailDeliveryStatuses.find(
    (item) =>
      item.purchasedReportId === report.id && item.target === "alternate_email"
  );
  const attribution = sourceAttributions.find(
    (item) => item.id === report.sourceAttributionId
  );

  return {
    id: report.id,
    userId: report.userId,
    assessmentSlug: report.assessmentSlug,
    reportTitle: report.reportTitle,
    topic: report.topic,
    sourceBlogUrl: attribution?.sourceBlogUrl ?? null,
    sourceTopic: attribution?.sourceTopic ?? null,
    purchasedAt: report.purchaseDate,
    savedToDashboardAt: report.purchaseDate,
    accessSource: "single_report",
    accessStatus: report.status === "ready" ? "active" : "queued",
    purchaseRecordId: report.paymentRecordId,
    bundleId: null,
    subscriptionId: null,
    generationStatus: report.reportGeneratedStatus,
    generatedAt: file?.generatedAt ?? report.purchaseDate,
    viewUrl: report.viewUrl,
    previewUrl: report.previewUrl,
    lastViewedAt: report.purchaseDate,
    file: {
      fileType: "pdf",
      fileName: file?.fileName ?? `${report.assessmentSlug}.pdf`,
      storageKey: file?.storageKey ?? null,
      status: file?.availability ?? "processing",
      formatVersion: "premium-report-v1",
      generatedAt: file?.generatedAt ?? null,
      lastRequestedAt: report.purchaseDate,
      downloadCount: file?.downloadCount ?? 0,
      lastDownloadedAt: file?.lastDownloadedAt ?? null,
      failureReason: report.failureReason
    },
    delivery: {
      accountEmail: dashboardUser.defaultReportEmail,
      accountEmailStatus:
        accountDelivery?.providerStatus === "sent"
          ? "sent"
          : accountDelivery?.providerStatus === "queued"
            ? "queued"
            : accountDelivery?.providerStatus === "failed"
              ? "failed"
              : "not_sent",
      accountEmailQueuedAt:
        accountDelivery?.providerStatus === "queued" ? report.purchaseDate : null,
      accountEmailSentAt:
        accountDelivery?.providerStatus === "sent"
          ? accountDelivery?.lastSentAt
          : null,
      alternateEmail: alternateDelivery?.recipientEmail ?? null,
      alternateEmailStatus:
        alternateDelivery?.providerStatus === "sent"
          ? "sent"
          : alternateDelivery?.providerStatus === "queued"
            ? "queued"
            : alternateDelivery?.providerStatus === "failed"
              ? "failed"
              : "not_sent",
      alternateEmailRequestedAt: alternateDelivery?.firstSentAt ?? null,
      alternateEmailSentAt:
        alternateDelivery?.providerStatus === "sent"
          ? alternateDelivery?.lastSentAt
          : null,
      lastAttemptedAt:
        accountDelivery?.lastSentAt ?? alternateDelivery?.lastSentAt ?? null,
      lastSentAt: accountDelivery?.lastSentAt ?? alternateDelivery?.lastSentAt ?? null,
      resendCount:
        (accountDelivery?.resendCount ?? 0) + (alternateDelivery?.resendCount ?? 0),
      resendStatus:
        (accountDelivery?.resendCount ?? 0) + (alternateDelivery?.resendCount ?? 0) > 0
          ? "resent"
          : "available",
      failureReason: accountDelivery?.failureReason ?? alternateDelivery?.failureReason ?? null
    },
    unlock: buildUnlockState(report)
  };
}

const seededBundlePurchaseId = "purchase_bundle_001";
const seededSubscriptionPurchaseId = "purchase_subscription_001";

export const seededBundle: OwnedBundle = {
  id: "bundle_001",
  userId: dashboardUser.id,
  title: "Relationship Insight Bundle",
  description:
    "A higher-context relationship package that groups attachment intensity, boundary strain, and mixed-signal interpretation into one owned bundle.",
  purchaseRecordId: seededBundlePurchaseId,
  primaryAssessmentSlug: "relationship-infatuation-obsession-analysis",
  includedAssessmentSlugs: [
    "relationship-infatuation-obsession-analysis",
    "attachment-and-relationship-style-report",
    "toxic-pattern-and-red-flag-report"
  ],
  purchasedAt: "2026-03-07T11:05:00.000Z",
  pricePaidCents: 12900,
  currency: "USD",
  accessStatus: "active"
};

function toPurchaseRecord(payment: typeof paymentRecords[number]): PurchaseRecord {
  const ownedReport = purchasedReports.find(
    (report) => report.paymentRecordId === payment.id
  );
  const attribution = sourceAttributions.find(
    (item) => item.id === ownedReport?.sourceAttributionId
  );

  return {
    id: payment.id,
    userId: payment.userId,
    checkoutIntentId: payment.providerReference ?? payment.id,
    purchaseType: payment.productType,
    assessmentSlug: payment.productReference,
    topic: ownedReport?.topic ?? "Insight",
    reportId: ownedReport?.id ?? null,
    bundleId: null,
    subscriptionId: payment.subscriptionId,
    sourceBlogUrl: attribution?.sourceBlogUrl ?? null,
    sourceTopic: attribution?.sourceTopic ?? null,
    pricePaidCents: payment.amountCents,
    currency: normalizeCurrencyCode(payment.currency),
    provider:
      normalizeCurrencyCode(payment.currency) === "INR"
        ? "razorpay_placeholder"
        : "stripe_placeholder",
    providerSessionId: payment.providerReference,
    purchasedAt: payment.paidAt ?? payment.createdAt,
    paymentStatus: paymentStatusToPurchaseStatus(payment.status)
  };
}

export const seededSubscription: SubscriptionRecord = {
  id: currentSubscription.id,
  userId: currentSubscription.userId,
  planCode: currentSubscription.planCode,
  planLabel: currentSubscription.planLabel,
  status: currentSubscription.status,
  billingInterval: currentSubscription.billingInterval,
  pricePaidCents: platformPricing.membershipAnnualCents,
  currency: "USD",
  startedAt: currentSubscription.startedAt,
  renewalDate: currentSubscription.renewalDate,
  canceledAt: currentSubscription.canceledAt,
  reportCreditsRemaining: currentSubscription.reportCreditsRemaining,
  unlockedAssessmentSlugs: currentSubscription.unlockedAssessmentSlugs,
  upgradeSourceReportSlug: currentSubscription.upgradeSourceReportSlug,
  latestPurchaseRecordId: seededSubscriptionPurchaseId
};

export function toLegacySubscription(
  subscription: SubscriptionRecord
): Subscription {
  return {
    id: subscription.id,
    userId: subscription.userId,
    planCode: subscription.planCode,
    planLabel: subscription.planLabel,
    status: subscription.status,
    billingInterval: subscription.billingInterval,
    startedAt: subscription.startedAt,
    renewalDate: subscription.renewalDate,
    canceledAt: subscription.canceledAt,
    reportCreditsRemaining: subscription.reportCreditsRemaining,
    unlockedAssessmentSlugs: subscription.unlockedAssessmentSlugs,
    upgradeSourceReportSlug: subscription.upgradeSourceReportSlug
  };
}

export const seededPurchaseRecords: PurchaseRecord[] = [
  ...paymentRecords.map(toPurchaseRecord),
  {
    id: seededBundlePurchaseId,
    userId: dashboardUser.id,
    checkoutIntentId: "seeded_bundle_intent_001",
    purchaseType: "bundle",
    assessmentSlug: seededBundle.primaryAssessmentSlug,
    topic: "Relationships",
    reportId: null,
    bundleId: seededBundle.id,
    subscriptionId: null,
    sourceBlogUrl: "https://click2pro.com/signs-of-obsession-in-relationships/",
    sourceTopic: "Relationship intensity",
    pricePaidCents: seededBundle.pricePaidCents,
    currency: seededBundle.currency,
    provider: "stripe_placeholder",
    providerSessionId: "cs_seed_bundle_001",
    purchasedAt: seededBundle.purchasedAt,
    paymentStatus: "paid"
  },
  {
    id: seededSubscriptionPurchaseId,
    userId: dashboardUser.id,
    checkoutIntentId: "seeded_subscription_intent_001",
    purchaseType: "subscription",
    assessmentSlug: currentSubscription.upgradeSourceReportSlug ?? "membership",
    topic: "Membership",
    reportId: null,
    bundleId: null,
    subscriptionId: currentSubscription.id,
    sourceBlogUrl: "https://click2pro.com/imposter-syndrome-signs/",
    sourceTopic: "Self-doubt",
    pricePaidCents: platformPricing.membershipAnnualCents,
    currency: "USD",
    provider: "stripe_placeholder",
    providerSessionId: "cs_seed_subscription_001",
    purchasedAt: currentSubscription.startedAt ?? "2026-03-05T09:18:00.000Z",
    paymentStatus: "paid"
  }
];

export const seededOwnedReports = purchasedReports.map(toOwnedReport);

export const seededRecentActivity: RecentActivityItem[] = [
  {
    id: "activity_001",
    type: "purchase",
    title: "Report purchase completed",
    description: "Imposter Syndrome Deep Report was saved to the dashboard library.",
    occurredAt: "2026-03-03T18:24:00.000Z",
    relatedSlug: "imposter-syndrome-deep-report"
  },
  {
    id: "activity_002",
    type: "delivery",
    title: "Account email delivered",
    description: "Imposter Syndrome Deep Report was delivered to the default account email.",
    occurredAt: "2026-03-03T18:29:00.000Z",
    relatedSlug: "imposter-syndrome-deep-report"
  },
  {
    id: "activity_003",
    type: "download",
    title: "Report PDF downloaded",
    description: "Imposter Syndrome Deep Report PDF was downloaded from the report library.",
    occurredAt: "2026-03-06T10:42:00.000Z",
    relatedSlug: "imposter-syndrome-deep-report"
  },
  {
    id: "activity_004",
    type: "bundle",
    title: "Relationship bundle added",
    description: "A relationship-focused bundle was attached to the account for future report continuity.",
    occurredAt: seededBundle.purchasedAt,
    relatedSlug: seededBundle.primaryAssessmentSlug
  },
  {
    id: "activity_005",
    type: "subscription",
    title: "Annual membership started",
    description:
      "The account now has broader access for connected reports, future assessment releases, and later follow-up insight layers.",
    occurredAt: currentSubscription.startedAt ?? "2026-03-05T09:18:00.000Z",
    relatedSlug: currentSubscription.upgradeSourceReportSlug
  }
];

export const seededExplanationEntitlements: ExplanationEntitlementRecord[] = [];

export const seededCommerceState: CommerceState = {
  account: {
    userId: dashboardUser.id,
    fullName: dashboardUser.fullName,
    accountEmail: dashboardUser.defaultReportEmail
  },
  purchaseRecords: seededPurchaseRecords,
  ownedReports: seededOwnedReports,
  ownedBundles: [seededBundle],
  subscriptions: [seededSubscription],
  explanationEntitlements: seededExplanationEntitlements,
  checkoutIntents: [],
  recentActivity: seededRecentActivity
};

export const dashboardOwnershipRecommendedInsights = dashboardRecommendedInsights;
export const dashboardMembershipBenefits = membershipBenefits;
export const dashboardMembershipUnlockedAssessments = getAssessmentsBySlugs(
  currentSubscription.unlockedAssessmentSlugs
);
