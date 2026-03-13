import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type {
  CheckoutIntent as ClientCheckoutIntent,
  CommerceState,
  ExplanationEntitlementRecord,
  OwnedBundle,
  OwnedReport,
  PurchaseRecord,
  RecentActivityItem,
  SubscriptionRecord
} from "@/lib/commerce/types";
import {
  inferRegionKey,
  toClientBillingInterval,
  toClientCurrencyCode,
  toClientDeliveryStatus,
  toClientOwnedAccessStatus,
  toClientPaymentProvider,
  toClientPurchaseType,
  toClientReportGenerationStatus,
  toClientPdfStatus,
  toClientUnlockAccessStatus,
  toClientMembershipStatus
} from "@/lib/commerce/server/mappers";

async function getCommerceGraphForUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      purchases: {
        include: {
          sourceAttribution: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      reports: {
        include: {
          sourcePurchase: {
            include: {
              sourceAttribution: true
            }
          },
          sourceAttribution: true,
          emailDeliveries: {
            orderBy: {
              createdAt: "desc"
            }
          },
          downloadRecords: {
            orderBy: {
              downloadedAt: "desc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      memberships: {
        orderBy: {
          createdAt: "desc"
        }
      },
      ownedBundles: {
        include: {
          sourcePurchase: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      explanationEntitlements: {
        orderBy: {
          createdAt: "desc"
        }
      },
      checkoutIntents: {
        include: {
          sourceAttribution: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      emailDeliveryRecords: {
        orderBy: {
          createdAt: "desc"
        }
      },
      downloadRecords: {
        orderBy: {
          downloadedAt: "desc"
        }
      }
    }
  });
}

type CommerceGraph = NonNullable<Prisma.PromiseReturnType<typeof getCommerceGraphForUser>>;

function toJsonStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function serializePurchaseRecord(graph: CommerceGraph, purchase: CommerceGraph["purchases"][number]): PurchaseRecord {
  const source = purchase.sourceAttribution;

  return {
    id: purchase.id,
    userId: purchase.userId,
    checkoutIntentId: purchase.checkoutIntentId ?? purchase.id,
    purchaseType: toClientPurchaseType(purchase.purchaseType),
    assessmentSlug: purchase.assessmentSlug ?? purchase.productReference ?? "membership",
    topic: purchase.topicKey ?? source?.sourceTopic ?? "Insight",
    reportId: null,
    bundleId: null,
    subscriptionId: purchase.membershipId,
    sourceBlogUrl: source?.sourceBlogUrl ?? null,
    sourceTopic: source?.sourceTopic ?? null,
    pricePaidCents: purchase.amountCents,
    currency: toClientCurrencyCode(purchase.currency),
    provider: toClientPaymentProvider(
      purchase.paymentProvider,
      inferRegionKey({ currency: purchase.currency })
    ),
    providerSessionId: purchase.providerCheckoutSessionId ?? purchase.providerOrderId ?? null,
    purchasedAt: (purchase.purchasedAt ?? purchase.createdAt).toISOString(),
    paymentStatus:
      purchase.status === "PAID"
        ? "paid"
        : purchase.status === "PENDING"
          ? "pending"
          : "canceled"
  };
}

function serializeOwnedBundle(bundle: CommerceGraph["ownedBundles"][number]): OwnedBundle {
  return {
    id: bundle.id,
    userId: bundle.userId,
    title: bundle.title,
    description:
      bundle.description ??
      "Bundle ownership is attached to the same account library used for individual reports.",
    purchaseRecordId: bundle.sourcePurchaseId,
    primaryAssessmentSlug: bundle.primaryAssessmentSlug ?? "bundle",
    includedAssessmentSlugs: toJsonStringArray(bundle.includedAssessmentSlugs),
    purchasedAt: (bundle.purchasedAt ?? bundle.createdAt).toISOString(),
    pricePaidCents: bundle.sourcePurchase.amountCents,
    currency: toClientCurrencyCode(bundle.sourcePurchase.currency),
    accessStatus: toClientOwnedAccessStatus(bundle.accessStatus)
  };
}

function serializeSubscriptionRecord(
  membership: CommerceGraph["memberships"][number]
): SubscriptionRecord {
  return {
    id: membership.id,
    userId: membership.userId,
    planCode: membership.planCode,
    planLabel: membership.planLabel,
    status: toClientMembershipStatus(membership.status),
    billingInterval: toClientBillingInterval(membership.billingInterval),
    pricePaidCents: membership.amountCents,
    currency: toClientCurrencyCode(membership.currency),
    startedAt: membership.startedAt?.toISOString() ?? null,
    renewalDate:
      membership.renewsAt?.toISOString() ??
      membership.currentPeriodEnd?.toISOString() ??
      null,
    canceledAt: membership.canceledAt?.toISOString() ?? null,
    reportCreditsRemaining: 0,
    unlockedAssessmentSlugs: toJsonStringArray(membership.unlockedAssessmentSlugs),
    upgradeSourceReportSlug:
      typeof membership.metadata === "object" &&
      membership.metadata &&
      "upgradeSourceReportSlug" in membership.metadata
        ? String((membership.metadata as Record<string, unknown>).upgradeSourceReportSlug ?? "")
        : null,
    latestPurchaseRecordId: null
  };
}

function serializeExplanationEntitlement(
  entitlement: CommerceGraph["explanationEntitlements"][number]
): ExplanationEntitlementRecord {
  return {
    id: entitlement.id,
    userId: entitlement.userId,
    purchaseRecordId: entitlement.sourcePurchaseId,
    reportId: entitlement.reportId ?? null,
    assessmentSlug: entitlement.assessmentSlug ?? "unknown",
    topic: entitlement.topicKey ?? "Insight",
    title: entitlement.title,
    durationMinutes: entitlement.durationMinutes === 60 ? 60 : 30,
    regionKey: inferRegionKey({
      regionKey: entitlement.regionKey,
      currency: entitlement.currency
    }),
    currency: toClientCurrencyCode(entitlement.currency),
    pricePaidCents: entitlement.amountCents,
    status: entitlement.status.toLowerCase() as ExplanationEntitlementRecord["status"],
    grantedAt: entitlement.grantedAt?.toISOString() ?? null,
    scheduledFor: entitlement.scheduledFor?.toISOString() ?? null,
    completedAt: entitlement.completedAt?.toISOString() ?? null
  };
}

function serializeCheckoutIntent(
  intent: CommerceGraph["checkoutIntents"][number]
): ClientCheckoutIntent {
  const source = intent.sourceAttribution;
  const regionKey = inferRegionKey({
    regionKey: intent.regionKey,
    currency: intent.currency
  });

  return {
    id: intent.id,
    userId: intent.userId,
    assessmentSessionId: intent.assessmentSessionId ?? null,
    assessmentSlug: intent.assessmentSlug,
    assessmentTitle: intent.assessmentTitle ?? intent.assessmentSlug,
    topic: intent.topicKey ?? source?.sourceTopic ?? "Insight",
    regionKey,
    offerId: intent.offerType,
    offerTitle: intent.offerTitle,
    purchaseType: toClientPurchaseType(intent.purchaseType),
    priceCents: intent.amountCents,
    currency: toClientCurrencyCode(intent.currency),
    provider: toClientPaymentProvider(intent.paymentProvider, regionKey),
    providerSessionId: intent.providerSessionId ?? intent.providerOrderId ?? null,
    providerOrderId: intent.providerOrderId ?? null,
    checkoutMode:
      intent.checkoutMode === "subscription" ? "subscription" : "payment",
    providerPriceLookupKey: intent.providerPriceLookupKey ?? null,
    successUrl: intent.successUrl ?? `/checkout/success?intent=${intent.id}`,
    cancelUrl: intent.cancelUrl ?? `/checkout/cancel?intent=${intent.id}`,
    status:
      intent.status === "PAID"
        ? "paid"
        : intent.status === "REQUIRES_ACTION"
          ? "requires_action"
          : intent.status === "FAILED"
            ? "failed"
            : intent.status === "EXPIRED"
              ? "expired"
              : intent.status === "CANCELED"
                ? "canceled"
                : "pending",
    sourceBlogUrl: source?.sourceBlogUrl ?? null,
    sourceTopic: source?.sourceTopic ?? null,
    includedAssessmentSlugs:
      typeof intent.metadata === "object" &&
      intent.metadata &&
      Array.isArray((intent.metadata as Record<string, unknown>).includedAssessmentSlugs)
        ? toJsonStringArray(
            (intent.metadata as Record<string, unknown>).includedAssessmentSlugs
          )
        : [],
    subscriptionPlanCode:
      typeof intent.metadata === "object" &&
      intent.metadata &&
      typeof (intent.metadata as Record<string, unknown>).subscriptionPlanCode === "string"
        ? String((intent.metadata as Record<string, unknown>).subscriptionPlanCode)
        : null,
    createdAt: intent.createdAt.toISOString(),
    completedAt: intent.completedAt?.toISOString() ?? null
  };
}

function serializeOwnedReport(
  graph: CommerceGraph,
  report: CommerceGraph["reports"][number],
  bundleByPurchaseId: Map<string, OwnedBundle>
): OwnedReport {
  const purchase = report.sourcePurchase;
  const regionKey = inferRegionKey({
    currency: purchase?.currency ?? graph.currency,
    regionKey:
      typeof report.sourceAttribution?.regionHint === "string"
        ? report.sourceAttribution.regionHint
        : null
  });
  const source = report.sourceAttribution ?? purchase?.sourceAttribution ?? null;
  const accountDelivery = report.emailDeliveries.find(
    (delivery) => delivery.targetType === "ACCOUNT_EMAIL"
  );
  const alternateDelivery = report.emailDeliveries.find(
    (delivery) => delivery.targetType === "ALTERNATE_EMAIL"
  );
  const bundle = report.sourcePurchaseId
    ? bundleByPurchaseId.get(report.sourcePurchaseId) ?? null
    : null;
  const accessSource = purchase
    ? toClientPurchaseType(purchase.purchaseType)
    : report.accessStatus === "MEMBERSHIP"
      ? "subscription"
      : report.accessStatus === "BUNDLE"
        ? "bundle"
        : "single_report";

  return {
    id: report.id,
    userId: report.userId,
    assessmentSlug: report.assessmentSlug,
    reportTitle: report.title,
    topic: report.topicKey,
    sourceBlogUrl: source?.sourceBlogUrl ?? null,
    sourceTopic: source?.sourceTopic ?? null,
    purchasedAt:
      purchase?.purchasedAt?.toISOString() ??
      report.unlockedAt?.toISOString() ??
      report.createdAt.toISOString(),
    savedToDashboardAt:
      report.unlockedAt?.toISOString() ?? report.createdAt.toISOString(),
    accessSource,
    accessStatus: toClientOwnedAccessStatus(report.status),
    purchaseRecordId: report.sourcePurchaseId ?? report.id,
    bundleId: bundle?.id ?? null,
    subscriptionId: purchase?.membershipId ?? null,
    generationStatus: toClientReportGenerationStatus(report.status),
    generatedAt: report.generatedAt?.toISOString() ?? null,
    viewUrl: `/reports/${report.assessmentSlug}`,
    previewUrl: `/reports/${report.assessmentSlug}`,
    lastViewedAt: report.updatedAt.toISOString(),
    file: {
      fileType: "pdf",
      fileName: `${report.assessmentSlug}.pdf`,
      storageKey: report.pdfStorageKey ?? null,
      status: toClientPdfStatus(report.pdfStatus),
      formatVersion: "premium-report-v1",
      generatedAt: report.pdfGeneratedAt?.toISOString() ?? report.generatedAt?.toISOString() ?? null,
      lastRequestedAt: report.updatedAt.toISOString(),
      downloadCount: report.downloadCount,
      lastDownloadedAt: report.lastDownloadedAt?.toISOString() ?? null,
      failureReason:
        report.pdfFailureReason ??
        report.failureReason ??
        (report.status === "FAILED" || report.status === "REQUIRES_RETRY"
          ? "Report generation needs retry."
          : null)
    },
    delivery: {
      accountEmail: graph.email,
      accountEmailStatus: toClientDeliveryStatus(accountDelivery?.status ?? report.emailStatus),
      accountEmailQueuedAt:
        accountDelivery?.createdAt.toISOString() ??
        (report.emailStatus === "QUEUED" ? report.updatedAt.toISOString() : null),
      accountEmailSentAt: accountDelivery?.sentAt?.toISOString() ?? null,
      alternateEmail: alternateDelivery?.recipientEmail ?? null,
      alternateEmailStatus: toClientDeliveryStatus(alternateDelivery?.status),
      alternateEmailRequestedAt: alternateDelivery?.createdAt.toISOString() ?? null,
      alternateEmailSentAt: alternateDelivery?.sentAt?.toISOString() ?? null,
      lastAttemptedAt:
        accountDelivery?.lastAttemptedAt?.toISOString() ??
        alternateDelivery?.lastAttemptedAt?.toISOString() ??
        null,
      lastSentAt:
        accountDelivery?.sentAt?.toISOString() ??
        alternateDelivery?.sentAt?.toISOString() ??
        null,
      resendCount: (accountDelivery?.resendCount ?? 0) + (alternateDelivery?.resendCount ?? 0),
      resendStatus:
        (accountDelivery?.resendCount ?? 0) + (alternateDelivery?.resendCount ?? 0) > 0
          ? "resent"
          : "available",
      failureReason: accountDelivery?.failureReason ?? alternateDelivery?.failureReason ?? null
    },
    unlock: {
      assessmentSlug: report.assessmentSlug,
      accessStatus: toClientUnlockAccessStatus(report.accessStatus),
      fullReportVisible: report.accessStatus !== "PREVIEW_ONLY",
      dashboardSaved: report.accessStatus !== "PREVIEW_ONLY",
      actionsAvailable: report.accessStatus !== "PREVIEW_ONLY",
      lockedSectionsVisible: report.accessStatus === "PREVIEW_ONLY",
      grantedAt: report.unlockedAt?.toISOString() ?? null,
      reasonLabel:
        report.accessStatus === "MEMBERSHIP"
          ? "Full report access is attached to the active membership."
          : report.accessStatus === "BUNDLE"
            ? "Full report access is attached to a purchased bundle."
            : report.accessStatus === "OWNED"
              ? "Full report access is attached to a completed purchase."
              : "The report is still preview-only."
    }
  };
}

function buildRecentActivity(
  purchases: PurchaseRecord[],
  subscriptions: SubscriptionRecord[],
  bundles: OwnedBundle[],
  entitlements: ExplanationEntitlementRecord[],
  reports: OwnedReport[]
): RecentActivityItem[] {
  const purchaseItems = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    type: "purchase" as const,
    title: "Purchase confirmed",
    description: `${purchase.topic} access is now attached to the account library.`,
    occurredAt: purchase.purchasedAt,
    relatedSlug: purchase.assessmentSlug
  }));
  const subscriptionItems = subscriptions
    .filter((subscription) => subscription.startedAt)
    .map((subscription) => ({
      id: `subscription-${subscription.id}`,
      type: "subscription" as const,
      title: "Membership access active",
      description: `${subscription.planLabel} is now available in the account library.`,
      occurredAt: subscription.startedAt ?? new Date(0).toISOString(),
      relatedSlug: subscription.upgradeSourceReportSlug
    }));
  const bundleItems = bundles.map((bundle) => ({
    id: `bundle-${bundle.id}`,
    type: "bundle" as const,
    title: "Bundle saved",
    description: `${bundle.title} is now attached to the account.`,
    occurredAt: bundle.purchasedAt,
    relatedSlug: bundle.primaryAssessmentSlug
  }));
  const explanationItems = entitlements
    .filter((entitlement) => entitlement.grantedAt)
    .map((entitlement) => ({
      id: `explanation-${entitlement.id}`,
      type: "explanation" as const,
      title: "Psychologist Explanation Session saved",
      description: `${entitlement.title} is now attached to the related report for a future guided walkthrough.`,
      occurredAt: entitlement.grantedAt ?? new Date(0).toISOString(),
      relatedSlug: entitlement.assessmentSlug
    }));
  const deliveryItems = reports
    .filter((report) => report.delivery.lastSentAt)
    .map((report) => ({
      id: `delivery-${report.id}`,
      type: "delivery" as const,
      title: "Report delivery updated",
      description: `${report.reportTitle} has a recorded delivery event.`,
      occurredAt: report.delivery.lastSentAt ?? new Date(0).toISOString(),
      relatedSlug: report.assessmentSlug
    }));
  const downloadItems = reports
    .filter((report) => report.file.lastDownloadedAt)
    .map((report) => ({
      id: `download-${report.id}`,
      type: "download" as const,
      title: "Report downloaded",
      description: `${report.reportTitle} was downloaded from the owned library.`,
      occurredAt: report.file.lastDownloadedAt ?? new Date(0).toISOString(),
      relatedSlug: report.assessmentSlug
    }));

  return [
    ...purchaseItems,
    ...subscriptionItems,
    ...bundleItems,
    ...explanationItems,
    ...deliveryItems,
    ...downloadItems
  ]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 12);
}

export async function getPersistentCommerceStateForUser(userId: string): Promise<CommerceState | null> {
  const graph = await getCommerceGraphForUser(userId);

  if (!graph) {
    return null;
  }

  const bundles = graph.ownedBundles.map(serializeOwnedBundle);
  const bundleByPurchaseId = new Map(
    bundles.map((bundle) => [bundle.purchaseRecordId, bundle] as const)
  );
  const subscriptions = graph.memberships.map(serializeSubscriptionRecord);
  const explanationEntitlements = graph.explanationEntitlements.map(
    serializeExplanationEntitlement
  );
  const reports = graph.reports.map((report) =>
    serializeOwnedReport(graph, report, bundleByPurchaseId)
  );
  const reportByPurchaseId = new Map(
    reports.map((report) => [report.purchaseRecordId, report.id] as const)
  );
  const purchases = graph.purchases.map((purchase) => {
    const serialized = serializePurchaseRecord(graph, purchase);

    return {
      ...serialized,
      reportId: reportByPurchaseId.get(purchase.id) ?? null,
      bundleId: bundleByPurchaseId.get(purchase.id)?.id ?? null
    };
  });
  const purchasesByMembershipId = new Map(
    purchases
      .filter((purchase) => purchase.subscriptionId)
      .map((purchase) => [purchase.subscriptionId as string, purchase.id] as const)
  );
  const normalizedSubscriptions = subscriptions.map((subscription) => ({
    ...subscription,
    latestPurchaseRecordId:
      purchasesByMembershipId.get(subscription.id) ?? subscription.latestPurchaseRecordId
  }));
  const checkoutIntents = graph.checkoutIntents.map(serializeCheckoutIntent);

  return {
    account: {
      userId: graph.id,
      fullName: graph.fullName ?? graph.email,
      accountEmail: graph.email
    },
    purchaseRecords: purchases,
    ownedReports: reports,
    ownedBundles: bundles,
    subscriptions: normalizedSubscriptions,
    explanationEntitlements,
    checkoutIntents,
    recentActivity: buildRecentActivity(
      purchases,
      normalizedSubscriptions,
      bundles,
      explanationEntitlements,
      reports
    )
  };
}
