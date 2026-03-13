import { getAssessmentDefinitionBySlug, getAssessmentsBySlugs } from "@/lib/assessments";

import { seededCommerceState } from "./seeded-state";
import type {
  CheckoutIntent,
  CommerceState,
  ExplanationEntitlementRecord,
  OwnedBundle,
  OwnedReport,
  PurchaseRecord,
  RecentActivityItem,
  SubscriptionRecord
} from "./types";

type CheckoutCompletionResult = {
  state: CommerceState;
  intent: CheckoutIntent | null;
  purchaseRecord: PurchaseRecord | null;
  ownedReport: OwnedReport | null;
  ownedBundle: OwnedBundle | null;
  subscription: SubscriptionRecord | null;
  explanationEntitlement: ExplanationEntitlementRecord | null;
};

type CheckoutCancelResult = {
  state: CommerceState;
  intent: CheckoutIntent | null;
};

type ReportActionResult = {
  ok: boolean;
  message: string;
  state: CommerceState;
  report: OwnedReport | null;
};

export const COMMERCE_STATE_EVENT = "click2pro-insight:commerce-state-updated";
const STORAGE_KEY = "click2pro-insight:commerce-state:v3";

function isDevelopmentCommerceDemoEnabled() {
  return process.env.NODE_ENV === "development";
}

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function sortByDateDesc<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined
) {
  return [...items].sort((left, right) => {
    const leftValue = getDate(left) ?? "";
    const rightValue = getDate(right) ?? "";
    return rightValue.localeCompare(leftValue);
  });
}

function mergeById<T extends { id: string }>(base: T[], override: T[]) {
  const map = new Map<string, T>();

  for (const item of base) {
    map.set(item.id, item);
  }

  for (const item of override) {
    map.set(item.id, item);
  }

  return [...map.values()];
}

function normalizeState(state: CommerceState) {
  return {
    ...state,
    purchaseRecords: sortByDateDesc(state.purchaseRecords, (item) => item.purchasedAt),
    ownedReports: sortByDateDesc(state.ownedReports, (item) => item.purchasedAt),
    ownedBundles: sortByDateDesc(state.ownedBundles, (item) => item.purchasedAt),
    subscriptions: sortByDateDesc(state.subscriptions, (item) => item.startedAt),
    explanationEntitlements: sortByDateDesc(
      state.explanationEntitlements,
      (item) => item.grantedAt ?? item.completedAt
    ),
    checkoutIntents: sortByDateDesc(state.checkoutIntents, (item) => item.createdAt),
    recentActivity: sortByDateDesc(state.recentActivity, (item) => item.occurredAt).slice(0, 10)
  };
}

function buildEmptyCommerceState(): CommerceState {
  return normalizeState({
    account: {
      userId: "guest-checkout",
      fullName: "",
      accountEmail: ""
    },
    purchaseRecords: [],
    ownedReports: [],
    ownedBundles: [],
    subscriptions: [],
    explanationEntitlements: [],
    checkoutIntents: [],
    recentActivity: []
  });
}

function emitCommerceStateUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(COMMERCE_STATE_EVENT));
}

function mergeWithSeededState(state: CommerceState) {
  return normalizeState({
    account: state.account ?? seededCommerceState.account,
    purchaseRecords: mergeById(seededCommerceState.purchaseRecords, state.purchaseRecords ?? []),
    ownedReports: mergeById(seededCommerceState.ownedReports, state.ownedReports ?? []),
    ownedBundles: mergeById(seededCommerceState.ownedBundles, state.ownedBundles ?? []),
    subscriptions: mergeById(seededCommerceState.subscriptions, state.subscriptions ?? []),
    explanationEntitlements: mergeById(
      seededCommerceState.explanationEntitlements,
      state.explanationEntitlements ?? []
    ),
    checkoutIntents: mergeById(seededCommerceState.checkoutIntents, state.checkoutIntents ?? []),
    recentActivity: mergeById(seededCommerceState.recentActivity, state.recentActivity ?? [])
  });
}

export function getSeededCommerceState() {
  if (!isDevelopmentCommerceDemoEnabled()) {
    return buildEmptyCommerceState();
  }

  return normalizeState(seededCommerceState);
}

export function loadCommerceState() {
  if (!isDevelopmentCommerceDemoEnabled()) {
    return buildEmptyCommerceState();
  }

  if (typeof window === "undefined") {
    return getSeededCommerceState();
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return getSeededCommerceState();
  }

  try {
    return mergeWithSeededState(JSON.parse(rawValue) as CommerceState);
  } catch {
    return getSeededCommerceState();
  }
}

function stripSeededRecords<T extends { id: string }>(items: T[], seededItems: T[]) {
  const seededIds = new Set(seededItems.map((item) => item.id));
  return items.filter((item) => !seededIds.has(item.id));
}

export function loadPreviewTestingCommerceState() {
  const state = loadCommerceState();

  return normalizeState({
    ...state,
    purchaseRecords: stripSeededRecords(
      state.purchaseRecords,
      seededCommerceState.purchaseRecords
    ),
    ownedReports: stripSeededRecords(
      state.ownedReports,
      seededCommerceState.ownedReports
    ),
    ownedBundles: stripSeededRecords(
      state.ownedBundles,
      seededCommerceState.ownedBundles
    ),
    subscriptions: stripSeededRecords(
      state.subscriptions,
      seededCommerceState.subscriptions
    ),
    explanationEntitlements: stripSeededRecords(
      state.explanationEntitlements,
      seededCommerceState.explanationEntitlements
    ),
    recentActivity: stripSeededRecords(
      state.recentActivity,
      seededCommerceState.recentActivity
    )
  });
}

export function saveCommerceState(state: CommerceState) {
  if (!isDevelopmentCommerceDemoEnabled()) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  emitCommerceStateUpdated();
}

export function storeCheckoutIntent(intent: CheckoutIntent) {
  if (!isDevelopmentCommerceDemoEnabled()) {
    return intent;
  }

  const state = loadCommerceState();
  const nextState = normalizeState({
    ...state,
    checkoutIntents: mergeById(state.checkoutIntents, [intent])
  });

  saveCommerceState(nextState);

  return intent;
}

function buildPurchaseRecordFromIntent(intent: CheckoutIntent): PurchaseRecord {
  return {
    id: randomId("purchase"),
    userId: intent.userId,
    checkoutIntentId: intent.id,
    purchaseType: intent.purchaseType,
    assessmentSlug: intent.assessmentSlug,
    topic: intent.topic,
    reportId: null,
    bundleId: null,
    subscriptionId: null,
    sourceBlogUrl: intent.sourceBlogUrl,
    sourceTopic: intent.sourceTopic,
    pricePaidCents: intent.priceCents,
    currency: intent.currency,
    provider: intent.provider,
    providerSessionId: intent.providerSessionId,
    purchasedAt: intent.completedAt ?? intent.createdAt,
    paymentStatus: "paid"
  };
}

function buildOwnedReportFromIntent(
  state: CommerceState,
  intent: CheckoutIntent,
  purchaseRecordId: string,
  bundleId: string | null,
  subscriptionId: string | null
): OwnedReport {
  const existing = state.ownedReports.find(
    (report) => report.assessmentSlug === intent.assessmentSlug
  );
  const purchasedAt = intent.completedAt ?? new Date().toISOString();
  const definition = getAssessmentDefinitionBySlug(intent.assessmentSlug);

  return {
    id: existing?.id ?? randomId("owned_report"),
    userId: intent.userId,
    assessmentSlug: intent.assessmentSlug,
    reportTitle: definition?.title ?? intent.assessmentTitle,
    topic: intent.topic,
    sourceBlogUrl: intent.sourceBlogUrl,
    sourceTopic: intent.sourceTopic,
    purchasedAt,
    savedToDashboardAt: purchasedAt,
    accessSource: intent.purchaseType,
    accessStatus: "active",
    purchaseRecordId,
    bundleId,
    subscriptionId,
    generationStatus: "ready",
    generatedAt: purchasedAt,
    viewUrl: `/reports/${intent.assessmentSlug}`,
    previewUrl: `/reports/${intent.assessmentSlug}`,
    lastViewedAt: null,
    file: {
      fileType: "pdf",
      fileName: `${intent.assessmentSlug}.pdf`,
      storageKey: null,
      status: "available",
      formatVersion: "premium-report-v1",
      generatedAt: purchasedAt,
      lastRequestedAt: purchasedAt,
      downloadCount: existing?.file.downloadCount ?? 0,
      lastDownloadedAt: existing?.file.lastDownloadedAt ?? null,
      failureReason: null
    },
    delivery: {
      accountEmail: state.account.accountEmail,
      accountEmailStatus: "queued",
      accountEmailQueuedAt: purchasedAt,
      accountEmailSentAt: null,
      alternateEmail: existing?.delivery.alternateEmail ?? null,
      alternateEmailStatus: existing?.delivery.alternateEmailStatus ?? "not_sent",
      alternateEmailRequestedAt: existing?.delivery.alternateEmailRequestedAt ?? null,
      alternateEmailSentAt: existing?.delivery.alternateEmailSentAt ?? null,
      lastAttemptedAt: purchasedAt,
      lastSentAt: existing?.delivery.lastSentAt ?? null,
      resendCount: existing?.delivery.resendCount ?? 0,
      resendStatus: existing?.delivery.resendStatus ?? "available",
      failureReason: null
    },
    unlock: {
      assessmentSlug: intent.assessmentSlug,
      accessStatus:
        intent.purchaseType === "subscription"
          ? "subscription_access"
          : intent.purchaseType === "bundle"
            ? "bundle_access"
            : "owned_report",
      fullReportVisible: true,
      dashboardSaved: true,
      actionsAvailable: true,
      lockedSectionsVisible: false,
      grantedAt: purchasedAt,
      reasonLabel:
        intent.purchaseType === "subscription"
          ? "Full report access is attached to the active membership."
          : intent.purchaseType === "bundle"
            ? "Full report access is attached to the purchased bundle."
            : "Full report access is attached to this completed purchase."
    }
  };
}

function buildOwnedBundleFromIntent(
  intent: CheckoutIntent,
  purchaseRecordId: string
): OwnedBundle | null {
  if (intent.purchaseType !== "bundle") {
    return null;
  }

  const includedTitles = getAssessmentsBySlugs(intent.includedAssessmentSlugs).map(
    (assessment) => assessment.title
  );

  return {
    id: randomId("bundle"),
    userId: intent.userId,
    title: intent.offerTitle,
    description:
      includedTitles.length > 0
        ? `Includes ${includedTitles.slice(0, 3).join(", ")}.`
        : "Bundle ownership placeholder for related reports and future continuity access.",
    purchaseRecordId,
    primaryAssessmentSlug: intent.assessmentSlug,
    includedAssessmentSlugs: [
      intent.assessmentSlug,
      ...intent.includedAssessmentSlugs
    ].filter((slug, index, array) => array.indexOf(slug) === index),
    purchasedAt: intent.completedAt ?? intent.createdAt,
    pricePaidCents: intent.priceCents,
    currency: intent.currency,
    accessStatus: "active"
  };
}

function buildExplanationEntitlementFromIntent(
  intent: CheckoutIntent,
  purchaseRecordId: string,
  reportId: string
): ExplanationEntitlementRecord | null {
  if (intent.purchaseType !== "explanation_session") {
    return null;
  }

  const durationMinutes =
    intent.offerId.includes("60") || intent.offerTitle.includes("60") ? 60 : 30;
  const grantedAt = intent.completedAt ?? intent.createdAt;

  return {
    id: randomId("explanation"),
    userId: intent.userId,
    purchaseRecordId,
    reportId,
    assessmentSlug: intent.assessmentSlug,
    topic: intent.topic,
    title:
      durationMinutes === 60
        ? "Psychologist Explanation Session (60 min)"
        : "Psychologist Explanation Session (30 min)",
    durationMinutes,
    regionKey: intent.regionKey,
    currency: intent.currency,
    pricePaidCents: intent.priceCents,
    status: "ready_for_contact",
    grantedAt,
    scheduledFor: null,
    completedAt: null
  };
}

function buildSubscriptionFromIntent(
  state: CommerceState,
  intent: CheckoutIntent,
  purchaseRecordId: string
): SubscriptionRecord | null {
  if (intent.purchaseType !== "subscription") {
    return null;
  }

  return {
    id: state.subscriptions[0]?.id ?? randomId("sub"),
    userId: intent.userId,
    planCode: intent.subscriptionPlanCode ?? "membership-annual",
    planLabel: "Insight Membership",
    status: "active",
    billingInterval:
      intent.subscriptionPlanCode?.includes("monthly") ? "monthly" : "annual",
    pricePaidCents: intent.priceCents,
    currency: intent.currency,
    startedAt: intent.completedAt ?? intent.createdAt,
    renewalDate: null,
    canceledAt: null,
    reportCreditsRemaining: 0,
    unlockedAssessmentSlugs: [
      intent.assessmentSlug,
      ...intent.includedAssessmentSlugs
    ].filter((slug, index, array) => array.indexOf(slug) === index),
    upgradeSourceReportSlug: intent.assessmentSlug,
    latestPurchaseRecordId: purchaseRecordId
  };
}

function buildRecentActivityFromIntent(
  intent: CheckoutIntent,
  purchaseRecord: PurchaseRecord,
  ownedBundle: OwnedBundle | null,
  subscription: SubscriptionRecord | null,
  explanationEntitlement: ExplanationEntitlementRecord | null
): RecentActivityItem[] {
  const purchasedAt = purchaseRecord.purchasedAt;
  const items: RecentActivityItem[] = [
    {
      id: randomId("activity"),
      type: "purchase",
      title: "Purchase confirmed",
      description: `${intent.assessmentTitle} is now saved in the ownership flow and ready for dashboard access.`,
      occurredAt: purchasedAt,
      relatedSlug: intent.assessmentSlug
    },
    {
      id: randomId("activity"),
      type: "delivery",
      title: "Report delivery prepared",
      description: `${intent.assessmentTitle} is now staged for PDF ownership and account-email delivery once the file asset is ready.`,
      occurredAt: purchasedAt,
      relatedSlug: intent.assessmentSlug
    }
  ];

  if (ownedBundle) {
    items.push({
      id: randomId("activity"),
      type: "bundle",
      title: "Bundle saved to account",
      description: `${ownedBundle.title} was attached to the account for future access and cross-topic continuity.`,
      occurredAt: purchasedAt,
      relatedSlug: intent.assessmentSlug
    });
  }

  if (subscription) {
    items.push({
      id: randomId("activity"),
      type: "subscription",
      title: "Membership activated",
      description: "Membership access now appears in the dashboard and can support later report continuity features.",
      occurredAt: purchasedAt,
      relatedSlug: intent.assessmentSlug
    });
  }

  if (explanationEntitlement) {
    items.push({
      id: randomId("activity"),
      type: "explanation",
      title: "Guided explanation entitlement saved",
      description:
        "The report now includes a psychologist explanation session entitlement for a future structured walkthrough.",
      occurredAt: purchasedAt,
      relatedSlug: intent.assessmentSlug
    });
  }

  return items;
}

export function completeCheckoutIntent(intentId: string): CheckoutCompletionResult {
  const state = loadCommerceState();
  const existingIntent = state.checkoutIntents.find((intent) => intent.id === intentId);

  if (!existingIntent) {
    return {
      state,
      intent: null,
      purchaseRecord: null,
      ownedReport: null,
      ownedBundle: null,
      subscription: null,
      explanationEntitlement: null
    };
  }

  if (existingIntent.status === "paid") {
    const purchaseRecord =
      state.purchaseRecords.find((record) => record.checkoutIntentId === intentId) ?? null;
    const ownedReport =
      purchaseRecord?.reportId
        ? state.ownedReports.find((report) => report.id === purchaseRecord.reportId) ?? null
        : state.ownedReports.find(
            (report) => report.assessmentSlug === existingIntent.assessmentSlug
          ) ?? null;
    const ownedBundle =
      purchaseRecord?.bundleId
        ? state.ownedBundles.find((bundle) => bundle.id === purchaseRecord.bundleId) ?? null
        : null;
    const subscription =
      purchaseRecord?.subscriptionId
        ? state.subscriptions.find(
            (item) => item.id === purchaseRecord.subscriptionId
          ) ?? null
        : null;
    const explanationEntitlement =
      purchaseRecord?.purchaseType === "explanation_session"
        ? state.explanationEntitlements.find(
            (item) => item.purchaseRecordId === purchaseRecord.id
          ) ?? null
        : null;

    return {
      state,
      intent: existingIntent,
      purchaseRecord,
      ownedReport,
      ownedBundle,
      subscription,
      explanationEntitlement
    };
  }

  const completedIntent: CheckoutIntent = {
    ...existingIntent,
    status: "paid",
    completedAt: existingIntent.completedAt ?? new Date().toISOString()
  };
  const purchaseRecord = buildPurchaseRecordFromIntent(completedIntent);
  const ownedBundle = buildOwnedBundleFromIntent(completedIntent, purchaseRecord.id);
  const subscription = buildSubscriptionFromIntent(
    state,
    completedIntent,
    purchaseRecord.id
  );
  const ownedReport = buildOwnedReportFromIntent(
    state,
    completedIntent,
    purchaseRecord.id,
    ownedBundle?.id ?? null,
    subscription?.id ?? null
  );
  const explanationEntitlement = buildExplanationEntitlementFromIntent(
    completedIntent,
    purchaseRecord.id,
    ownedReport.id
  );

  purchaseRecord.reportId = ownedReport.id;
  purchaseRecord.bundleId = ownedBundle?.id ?? null;
  purchaseRecord.subscriptionId = subscription?.id ?? null;

  const nextState = normalizeState({
    ...state,
    checkoutIntents: mergeById(state.checkoutIntents, [completedIntent]),
    purchaseRecords: mergeById(state.purchaseRecords, [purchaseRecord]),
    ownedReports: mergeById(state.ownedReports, [ownedReport]),
    ownedBundles: ownedBundle
      ? mergeById(state.ownedBundles, [ownedBundle])
      : state.ownedBundles,
    subscriptions: subscription
      ? mergeById(state.subscriptions, [subscription])
      : state.subscriptions,
    explanationEntitlements: explanationEntitlement
      ? mergeById(state.explanationEntitlements, [explanationEntitlement])
      : state.explanationEntitlements,
    recentActivity: mergeById(state.recentActivity, [
      ...buildRecentActivityFromIntent(
        completedIntent,
        purchaseRecord,
        ownedBundle,
        subscription,
        explanationEntitlement
      )
    ])
  });

  saveCommerceState(nextState);

  return {
    state: nextState,
    intent: completedIntent,
    purchaseRecord,
    ownedReport,
    ownedBundle,
    subscription,
    explanationEntitlement
  };
}

export function cancelCheckoutIntent(intentId: string): CheckoutCancelResult {
  const state = loadCommerceState();
  const existingIntent = state.checkoutIntents.find((intent) => intent.id === intentId);

  if (!existingIntent) {
    return {
      state,
      intent: null
    };
  }

  const canceledIntent: CheckoutIntent = {
    ...existingIntent,
    status: "canceled"
  };

  const nextState = normalizeState({
    ...state,
    checkoutIntents: mergeById(state.checkoutIntents, [canceledIntent]),
    recentActivity: mergeById(state.recentActivity, [
      {
        id: randomId("activity"),
        type: "purchase",
        title: "Checkout canceled",
        description: `${existingIntent.assessmentTitle} remained in preview mode after the checkout flow was canceled.`,
        occurredAt: new Date().toISOString(),
        relatedSlug: existingIntent.assessmentSlug
      }
    ])
  });

  saveCommerceState(nextState);

  return {
    state: nextState,
    intent: canceledIntent
  };
}

function buildReportActionFailure(
  state: CommerceState,
  message: string
): ReportActionResult {
  return {
    ok: false,
    message,
    state,
    report: null
  };
}

function updateOwnedReport(
  reportId: string,
  updater: (state: CommerceState, report: OwnedReport) => {
    report: OwnedReport;
    activity?: RecentActivityItem[];
  }
): ReportActionResult {
  const state = loadCommerceState();
  const report = state.ownedReports.find((item) => item.id === reportId) ?? null;

  if (!report) {
    return buildReportActionFailure(state, "The report could not be found in the current library state.");
  }

  const update = updater(state, report);
  const nextState = normalizeState({
    ...state,
    ownedReports: mergeById(state.ownedReports, [update.report]),
    recentActivity: update.activity
      ? mergeById(state.recentActivity, update.activity)
      : state.recentActivity
  });

  saveCommerceState(nextState);

  return {
    ok: true,
    message: "Report ownership state updated.",
    state: nextState,
    report: update.report
  };
}

export function markReportViewed(reportId: string): ReportActionResult {
  return updateOwnedReport(reportId, (_state, report) => ({
    report: {
      ...report,
      lastViewedAt: new Date().toISOString()
    }
  }));
}

export function recordReportDownload(
  reportId: string,
  source: "dashboard" | "report_view" | "checkout_success" = "dashboard"
): ReportActionResult {
  const state = loadCommerceState();
  const report = state.ownedReports.find((item) => item.id === reportId) ?? null;

  if (!report) {
    return buildReportActionFailure(state, "The report could not be found in the current library.");
  }

  if (report.file.status !== "available") {
    return buildReportActionFailure(
      state,
      "The PDF is not ready yet. Download becomes available after generation completes."
    );
  }

  const occurredAt = new Date().toISOString();

  const result = updateOwnedReport(reportId, (_nextState, currentReport) => ({
    report: {
      ...currentReport,
      file: {
        ...currentReport.file,
        lastRequestedAt: occurredAt,
        downloadCount: currentReport.file.downloadCount + 1,
        lastDownloadedAt: occurredAt
      },
      lastViewedAt: source === "report_view" ? occurredAt : currentReport.lastViewedAt,
      delivery: {
        ...currentReport.delivery,
        resendStatus:
          currentReport.delivery.resendCount > 0
            ? currentReport.delivery.resendStatus
            : "available"
      }
    },
    activity: [
      {
        id: randomId("activity"),
        type: "download",
        title: "Report PDF prepared for download",
        description: `${currentReport.reportTitle} was opened through the ${source.replace(/_/g, " ")} download path.`,
        occurredAt,
        relatedSlug: currentReport.assessmentSlug
      }
    ]
  }));

  return {
    ...result,
    message: "Download activity was recorded. Live PDF file delivery can attach here later."
  };
}

function canDeliverReport(report: OwnedReport) {
  return report.generationStatus === "ready" && report.file.status === "available";
}

export function sendReportToAccountEmail(reportId: string): ReportActionResult {
  const state = loadCommerceState();
  const report = state.ownedReports.find((item) => item.id === reportId) ?? null;

  if (!report) {
    return buildReportActionFailure(state, "The report could not be found in the current library.");
  }

  if (!canDeliverReport(report)) {
    return buildReportActionFailure(
      state,
      "The report cannot be sent yet because the PDF asset is still generating or unavailable."
    );
  }

  const sentAt = new Date().toISOString();
  const isResend =
    report.delivery.accountEmailStatus === "sent" || report.delivery.resendCount > 0;

  const result = updateOwnedReport(reportId, (_nextState, currentReport) => ({
    report: {
      ...currentReport,
      delivery: {
        ...currentReport.delivery,
        accountEmailStatus: "sent",
        accountEmailQueuedAt:
          currentReport.delivery.accountEmailQueuedAt ?? currentReport.purchasedAt,
        accountEmailSentAt: sentAt,
        lastAttemptedAt: sentAt,
        lastSentAt: sentAt,
        resendCount: isResend
          ? currentReport.delivery.resendCount + 1
          : currentReport.delivery.resendCount,
        resendStatus: isResend ? "resent" : "available",
        failureReason: null
      }
    },
    activity: [
      {
        id: randomId("activity"),
        type: "delivery",
        title: isResend ? "Report resent to account email" : "Report sent to account email",
        description: `${currentReport.reportTitle} was marked for delivery to ${currentReport.delivery.accountEmail}.`,
        occurredAt: sentAt,
        relatedSlug: currentReport.assessmentSlug
      }
    ]
  }));

  return {
    ...result,
    message: isResend
      ? "The report was marked as resent to the account email."
      : "The report was marked as sent to the account email."
  };
}

function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function sendReportToAlternateEmail(
  reportId: string,
  alternateEmail: string
): ReportActionResult {
  const state = loadCommerceState();
  const report = state.ownedReports.find((item) => item.id === reportId) ?? null;

  if (!report) {
    return buildReportActionFailure(state, "The report could not be found in the current library.");
  }

  if (!isEmailAddress(alternateEmail)) {
    return buildReportActionFailure(state, "Enter a valid email address for alternate delivery.");
  }

  if (!canDeliverReport(report)) {
    return buildReportActionFailure(
      state,
      "Alternate delivery becomes available after the report PDF is ready."
    );
  }

  const sentAt = new Date().toISOString();

  const result = updateOwnedReport(reportId, (_nextState, currentReport) => ({
    report: {
      ...currentReport,
      delivery: {
        ...currentReport.delivery,
        alternateEmail,
        alternateEmailStatus: "sent",
        alternateEmailRequestedAt: sentAt,
        alternateEmailSentAt: sentAt,
        lastAttemptedAt: sentAt,
        lastSentAt: sentAt,
        resendStatus:
          currentReport.delivery.resendCount > 0
            ? "resent"
            : currentReport.delivery.resendStatus,
        failureReason: null
      }
    },
    activity: [
      {
        id: randomId("activity"),
        type: "delivery",
        title: "Report sent to alternate email",
        description: `${currentReport.reportTitle} was marked for delivery to ${alternateEmail}.`,
        occurredAt: sentAt,
        relatedSlug: currentReport.assessmentSlug
      }
    ]
  }));

  return {
    ...result,
    message: "The alternate delivery placeholder was recorded for this report."
  };
}
