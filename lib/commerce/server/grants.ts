import "server-only";

import { assessments, getAssessmentDefinitionBySlug } from "@/lib/assessments";
import { getPersistentCommerceStateForUser } from "@/lib/commerce/server/library";
import { toPrismaPaymentProvider } from "@/lib/commerce/server/mappers";
import { prisma } from "@/lib/db/prisma";
import type { ConfirmedPaymentDetails } from "@/lib/payments/types";
import { generateAndPersistPremiumReport } from "@/lib/server/services/report-pipeline";
import {
  getCheckoutIntentById,
  getCheckoutIntentForUser
} from "@/lib/server/services/checkout-intents";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { resolvePaidCheckoutUser } from "@/lib/server/services/users";
import { normalizeEmail, normalizeNullableString } from "@/lib/server/utils";

type CheckoutIntentRecord = NonNullable<Awaited<ReturnType<typeof getCheckoutIntentById>>>;

function parseIntentMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return {
      includedAssessmentSlugs: [] as string[],
      subscriptionPlanCode: null as string | null,
      sourceBlogUrl: null as string | null,
      sourceTopic: null as string | null,
      checkoutEmail: null as string | null,
      checkoutUserOrigin: null as "authenticated" | "existing" | "provisional" | null,
      requiresAccountClaim: false
    };
  }

  const record = metadata as Record<string, unknown>;
  const checkoutUserOrigin =
    record.checkoutUserOrigin === "authenticated" ||
    record.checkoutUserOrigin === "existing" ||
    record.checkoutUserOrigin === "provisional"
      ? record.checkoutUserOrigin
      : null;

  return {
    includedAssessmentSlugs: Array.isArray(record.includedAssessmentSlugs)
      ? record.includedAssessmentSlugs.filter(
          (item): item is string => typeof item === "string"
        )
      : [],
    subscriptionPlanCode:
      typeof record.subscriptionPlanCode === "string"
        ? record.subscriptionPlanCode
        : null,
    sourceBlogUrl:
      typeof record.sourceBlogUrl === "string" ? record.sourceBlogUrl : null,
    sourceTopic:
      typeof record.sourceTopic === "string" ? record.sourceTopic : null,
    checkoutEmail:
      typeof record.checkoutEmail === "string" ? record.checkoutEmail : null,
    checkoutUserOrigin,
    requiresAccountClaim:
      record.requiresAccountClaim === true || checkoutUserOrigin === "provisional"
  };
}

function parseConfirmationIdentity(confirmation?: ConfirmedPaymentDetails | null) {
  if (!confirmation?.metadata || typeof confirmation.metadata !== "object") {
    return {
      checkoutEmail: null as string | null,
      checkoutFullName: null as string | null
    };
  }

  const record = confirmation.metadata as Record<string, unknown>;

  return {
    checkoutEmail:
      typeof record.checkoutEmail === "string"
        ? normalizeEmail(record.checkoutEmail)
        : null,
    checkoutFullName: normalizeNullableString(
      typeof record.checkoutFullName === "string" ? record.checkoutFullName : null
    )
  };
}

function getExplanationDuration(offerType: string) {
  return offerType.includes("60") ? 60 : 30;
}

function resolvePaymentProvider(
  intent: CheckoutIntentRecord,
  confirmation?: ConfirmedPaymentDetails | null
) {
  return (
    (confirmation
      ? toPrismaPaymentProvider(confirmation.provider)
      : null) ??
    intent.paymentProvider ??
    toPrismaPaymentProvider(intent.regionKey === "india" ? "razorpay" : "stripe")
  );
}

async function reconcileCheckoutIntentUser(
  intent: CheckoutIntentRecord,
  confirmation?: ConfirmedPaymentDetails | null
) {
  const metadata = parseIntentMetadata(intent.metadata);
  const confirmationIdentity = parseConfirmationIdentity(confirmation);

  if (!confirmationIdentity.checkoutEmail || metadata.checkoutUserOrigin !== "provisional") {
    return intent;
  }

  const resolvedCheckoutUser = await resolvePaidCheckoutUser({
    userId: intent.userId,
    email: confirmationIdentity.checkoutEmail,
    fullName: confirmationIdentity.checkoutFullName
  });

  if (!resolvedCheckoutUser) {
    return intent;
  }

  await prisma.checkoutIntent.update({
    where: {
      id: intent.id
    },
    data: {
      userId: resolvedCheckoutUser.user.id,
      metadata: {
        ...(typeof intent.metadata === "object" && intent.metadata ? intent.metadata : {}),
        checkoutEmail: resolvedCheckoutUser.user.email,
        checkoutUserOrigin: resolvedCheckoutUser.origin,
        requiresAccountClaim: resolvedCheckoutUser.origin === "provisional"
      }
    }
  });

  return (await getCheckoutIntentById(intent.id)) ?? intent;
}

async function buildPersistentGrantResult(
  userId: string,
  intentId: string,
  purchaseId?: string | null
) {
  const state = await getPersistentCommerceStateForUser(userId);

  if (!state) {
    return null;
  }

  const purchaseRecord =
    state.purchaseRecords.find((purchase) => purchase.checkoutIntentId === intentId) ??
    (purchaseId
      ? state.purchaseRecords.find((purchase) => purchase.id === purchaseId) ?? null
      : null);

  return {
    state,
    intentId,
    purchaseRecord,
    ownedReport: state.ownedReports.find(
      (report) => report.purchaseRecordId === purchaseRecord?.id
    ) ?? null,
    ownedBundle: state.ownedBundles.find(
      (bundle) => bundle.purchaseRecordId === purchaseRecord?.id
    ) ?? null,
    subscription: state.subscriptions.find(
      (subscription) => subscription.id === purchaseRecord?.subscriptionId
    ) ?? null,
    explanationEntitlement: state.explanationEntitlements.find(
      (entitlement) => entitlement.purchaseRecordId === purchaseRecord?.id
    ) ?? null
  };
}

async function materializeConfirmedCheckoutIntent(
  intent: CheckoutIntentRecord,
  confirmation?: ConfirmedPaymentDetails | null,
  allowUnverified = false
) {
  const resolvedIntent =
    confirmation && !allowUnverified
      ? await reconcileCheckoutIntentUser(intent, confirmation)
      : intent;

  if (resolvedIntent.purchase) {
    const existingReportId = resolvedIntent.purchase.reports[0]?.id ?? null;

    if (existingReportId) {
      try {
        await generateAndPersistPremiumReport(existingReportId);
      } catch {
        // Ownership already exists. Report regeneration should not block access finalization.
      }
    }

    return buildPersistentGrantResult(
      resolvedIntent.userId,
      resolvedIntent.id,
      resolvedIntent.purchase.id
    );
  }

  if (!confirmation && !allowUnverified) {
    return null;
  }

  const metadata = parseIntentMetadata(resolvedIntent.metadata);
  const purchasedAt = confirmation?.paidAt ?? new Date();
  const assessmentDefinition = getAssessmentDefinitionBySlug(resolvedIntent.assessmentSlug);
  const paymentProvider = resolvePaymentProvider(resolvedIntent, confirmation);
  let createdReportId: string | null = null;
  let createdPurchaseId: string | null = null;
  let createdExplanationEntitlementId: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      let membershipId: string | null = null;

      if (resolvedIntent.purchaseType === "MEMBERSHIP") {
        const unlockedAssessmentSlugs = assessments.map((assessment) => assessment.slug);
        const currentMembership = await tx.membership.findFirst({
          where: {
            userId: resolvedIntent.userId,
            status: {
              in: ["ACTIVE", "TRIALING"]
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        if (currentMembership) {
          const updatedMembership = await tx.membership.update({
            where: {
              id: currentMembership.id
            },
            data: {
              status: "ACTIVE",
              paymentProvider,
              currency: confirmation?.currency ?? resolvedIntent.currency,
              amountCents: confirmation?.amountCents ?? resolvedIntent.amountCents,
              providerSubscriptionId:
                confirmation?.providerSubscriptionId ??
                currentMembership.providerSubscriptionId,
              providerCustomerId:
                confirmation?.providerCustomerId ?? currentMembership.providerCustomerId,
              unlockedAssessmentSlugs,
              benefitSnapshot: {
                source: allowUnverified ? "local_placeholder_checkout_grant" : "verified_payment_grant"
              },
              metadata: {
                subscriptionPlanCode: metadata.subscriptionPlanCode,
                upgradeSourceReportSlug: resolvedIntent.assessmentSlug
              },
              startedAt: currentMembership.startedAt ?? purchasedAt,
              currentPeriodStart: purchasedAt,
              currentPeriodEnd: null,
              renewsAt: null
            }
          });

          membershipId = updatedMembership.id;
        } else {
          const createdMembership = await tx.membership.create({
            data: {
              userId: resolvedIntent.userId,
              planCode: metadata.subscriptionPlanCode ?? "membership-annual",
              planLabel: "Insight Membership",
              status: "ACTIVE",
              billingInterval:
                metadata.subscriptionPlanCode?.includes("monthly") ? "MONTHLY" : "ANNUAL",
              paymentProvider,
              currency: confirmation?.currency ?? resolvedIntent.currency,
              amountCents: confirmation?.amountCents ?? resolvedIntent.amountCents,
              providerSubscriptionId: confirmation?.providerSubscriptionId ?? null,
              providerCustomerId: confirmation?.providerCustomerId ?? null,
              unlockedAssessmentSlugs,
              benefitSnapshot: {
                source: allowUnverified ? "local_placeholder_checkout_grant" : "verified_payment_grant"
              },
              metadata: {
                subscriptionPlanCode: metadata.subscriptionPlanCode,
                upgradeSourceReportSlug: resolvedIntent.assessmentSlug
              },
              startedAt: purchasedAt,
              currentPeriodStart: purchasedAt
            }
          });

          membershipId = createdMembership.id;
        }
      }

      const purchase = await tx.purchase.create({
        data: {
          userId: resolvedIntent.userId,
          checkoutIntentId: resolvedIntent.id,
          membershipId,
          sourceAttributionId: resolvedIntent.sourceAttributionId,
          purchaseType: resolvedIntent.purchaseType,
          status: "PAID",
          paymentProvider,
          providerCheckoutSessionId:
            confirmation?.providerSessionId ?? resolvedIntent.providerSessionId,
          providerOrderId:
            confirmation?.providerOrderId ?? resolvedIntent.providerOrderId,
          providerPaymentId: confirmation?.providerPaymentId ?? null,
          providerCustomerId: confirmation?.providerCustomerId ?? null,
          providerSubscriptionId: confirmation?.providerSubscriptionId ?? null,
          assessmentSlug: resolvedIntent.assessmentSlug,
          topicKey: resolvedIntent.topicKey,
          productReference: resolvedIntent.offerType,
          title: resolvedIntent.offerTitle,
          currency: confirmation?.currency ?? resolvedIntent.currency,
          amountCents: confirmation?.amountCents ?? resolvedIntent.amountCents,
          priceSnapshot: {
            regionKey: resolvedIntent.regionKey,
            offerType: resolvedIntent.offerType
          },
          metadata: {
            ...(typeof resolvedIntent.metadata === "object" && resolvedIntent.metadata
              ? resolvedIntent.metadata
              : {}),
            paymentConfirmationSource: allowUnverified
              ? "local_placeholder"
              : confirmation?.provider ?? "unknown"
          },
          purchasedAt
        }
      });
      createdPurchaseId = purchase.id;

      const report = await tx.report.create({
        data: {
          userId: resolvedIntent.userId,
          assessmentSessionId: resolvedIntent.assessmentSessionId,
          sourcePurchaseId: purchase.id,
          sourceAttributionId: resolvedIntent.sourceAttributionId,
          assessmentSlug: resolvedIntent.assessmentSlug,
          topicKey:
            resolvedIntent.topicKey ??
            assessmentDefinition?.category ??
            resolvedIntent.assessmentSlug,
          title:
            assessmentDefinition?.title ??
            resolvedIntent.assessmentTitle ??
            resolvedIntent.assessmentSlug,
          subtitle: assessmentDefinition?.subtitle ?? null,
          tier:
            resolvedIntent.purchaseType === "PREMIUM_REPORT" ? "PREMIUM" : "STANDARD",
          status: "QUEUED",
          accessStatus:
            resolvedIntent.purchaseType === "MEMBERSHIP"
              ? "MEMBERSHIP"
              : resolvedIntent.purchaseType === "BUNDLE"
                ? "BUNDLE"
                : "OWNED",
          pdfStatus: "PENDING",
          emailStatus: "QUEUED",
          unlockedAt: purchasedAt
        }
      });
      createdReportId = report.id;

      const user = await tx.user.findUniqueOrThrow({
        where: {
          id: resolvedIntent.userId
        },
        select: {
          email: true
        }
      });

      await tx.emailDeliveryRecord.create({
        data: {
          userId: resolvedIntent.userId,
          reportId: report.id,
          recipientEmail: user.email,
          targetType: "ACCOUNT_EMAIL",
          status: "QUEUED",
          lastAttemptedAt: purchasedAt
        }
      });

      if (resolvedIntent.purchaseType === "BUNDLE") {
        const includedAssessmentSlugs = [
          resolvedIntent.assessmentSlug,
          ...metadata.includedAssessmentSlugs
        ].filter((slug, index, slugs) => slugs.indexOf(slug) === index);

        await tx.ownedBundle.create({
          data: {
            userId: resolvedIntent.userId,
            sourcePurchaseId: purchase.id,
            primaryAssessmentSlug: resolvedIntent.assessmentSlug,
            title: resolvedIntent.offerTitle,
            description:
              "Bundle ownership is attached to the same private report library as individual purchases.",
            includedAssessmentSlugs,
            accessStatus: "ACTIVE",
            purchasedAt
          }
        });
      }

      if (resolvedIntent.purchaseType === "EXPLANATION_SESSION") {
        const entitlement = await tx.explanationEntitlement.create({
          data: {
            userId: resolvedIntent.userId,
            sourcePurchaseId: purchase.id,
            reportId: report.id,
            assessmentSlug: resolvedIntent.assessmentSlug,
            topicKey:
              resolvedIntent.topicKey ??
              assessmentDefinition?.category ??
              resolvedIntent.assessmentSlug,
            title:
              getExplanationDuration(resolvedIntent.offerType) === 60
                ? "Psychologist Explanation Session (60 min)"
                : "Psychologist Explanation Session (30 min)",
            durationMinutes: getExplanationDuration(resolvedIntent.offerType),
            regionKey: resolvedIntent.regionKey,
            currency: confirmation?.currency ?? resolvedIntent.currency,
            amountCents: confirmation?.amountCents ?? resolvedIntent.amountCents,
            status: "READY_FOR_CONTACT",
            notes: {
              framing:
                "Structured discussion of your report. Not therapy or diagnosis.",
              operationalState:
                "Awaiting manual outreach or future scheduling integration."
            },
            grantedAt: purchasedAt
          }
        });
        createdExplanationEntitlementId = entitlement.id;
      }

      if (resolvedIntent.assessmentSessionId) {
        await tx.assessmentSession.update({
          where: {
            id: resolvedIntent.assessmentSessionId
          },
          data: {
            status: "PAID",
            paidAt: purchasedAt
          }
        });
      }

      await tx.checkoutIntent.update({
        where: {
          id: resolvedIntent.id
        },
        data: {
          status: "PAID",
          providerSessionId:
            confirmation?.providerSessionId ?? resolvedIntent.providerSessionId,
          providerOrderId:
            confirmation?.providerOrderId ?? resolvedIntent.providerOrderId,
          paymentConfirmedAt: purchasedAt,
          lastPaymentEventAt: purchasedAt,
          failureReason: null,
          completedAt: purchasedAt
        }
      });
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const latestIntent = await getCheckoutIntentById(intent.id);

      if (latestIntent?.purchase?.reports[0]?.id) {
        try {
          await generateAndPersistPremiumReport(latestIntent.purchase.reports[0].id);
        } catch {
          // Another process already granted ownership. Keep the existing persistent record usable.
        }
      }

      return buildPersistentGrantResult(
        latestIntent?.userId ?? resolvedIntent.userId,
        resolvedIntent.id,
        latestIntent?.purchase?.id
      );
    }

    throw error;
  }

  if (createdReportId) {
    try {
      await generateAndPersistPremiumReport(createdReportId);
    } catch {
      // Purchase and ownership are already persisted. Report generation can retry separately.
    }
  }

  await recordOperationalEvent({
    eventType: "payment_confirmation",
    eventKey: resolvedIntent.id,
    status: "SUCCEEDED",
    userId: resolvedIntent.userId,
    purchaseId: createdPurchaseId,
    checkoutIntentId: resolvedIntent.id,
    message: "Payment confirmation was persisted and ownership grant processing completed.",
    metadata: {
      provider: confirmation?.provider ?? resolvedIntent.paymentProvider ?? "unknown",
      purchaseType: resolvedIntent.purchaseType,
      amountCents: confirmation?.amountCents ?? resolvedIntent.amountCents,
      currency: confirmation?.currency ?? resolvedIntent.currency
    }
  });

  await recordOperationalEvent({
    eventType: "ownership_grant",
    eventKey: resolvedIntent.id,
    status: "SUCCEEDED",
    userId: resolvedIntent.userId,
    reportId: createdReportId,
    purchaseId: createdPurchaseId,
    checkoutIntentId: resolvedIntent.id,
    message: "Persistent ownership was granted for the confirmed checkout intent.",
    metadata: {
      purchaseType: resolvedIntent.purchaseType,
      assessmentSlug: resolvedIntent.assessmentSlug
    }
  });

  if (createdExplanationEntitlementId) {
    await recordOperationalEvent({
      eventType: "explanation_entitlement",
      eventKey: createdExplanationEntitlementId,
      status: "SUCCEEDED",
      userId: resolvedIntent.userId,
      reportId: createdReportId,
      purchaseId: createdPurchaseId,
      checkoutIntentId: resolvedIntent.id,
      message: "A psychologist explanation entitlement was created and marked ready for contact.",
      metadata: {
        durationMinutes: getExplanationDuration(resolvedIntent.offerType),
        assessmentSlug: resolvedIntent.assessmentSlug
      }
    });
  }

  return buildPersistentGrantResult(resolvedIntent.userId, resolvedIntent.id);
}

export async function finalizePersistentCheckoutIntent(
  userId: string,
  intentId: string,
  options?: {
    allowUnverified?: boolean;
    confirmation?: ConfirmedPaymentDetails | null;
  }
) {
  const existingIntent = await getCheckoutIntentForUser(userId, intentId);

  if (!existingIntent) {
    return null;
  }

  return materializeConfirmedCheckoutIntent(
    existingIntent,
    options?.confirmation,
    options?.allowUnverified ?? false
  );
}

export async function finalizePersistentCheckoutIntentById(
  intentId: string,
  options?: {
    allowUnverified?: boolean;
    confirmation?: ConfirmedPaymentDetails | null;
  }
) {
  const existingIntent = await getCheckoutIntentById(intentId);

  if (!existingIntent) {
    return null;
  }

  return materializeConfirmedCheckoutIntent(
    existingIntent,
    options?.confirmation,
    options?.allowUnverified ?? false
  );
}

export async function confirmPersistentCheckoutIntentPayment(
  intentId: string,
  confirmation: ConfirmedPaymentDetails
) {
  const existingIntent = await getCheckoutIntentById(intentId);

  if (!existingIntent) {
    return null;
  }

  return materializeConfirmedCheckoutIntent(existingIntent, confirmation, false);
}

export async function cancelPersistentCheckoutIntent(userId: string, intentId: string) {
  const existingIntent = await getCheckoutIntentForUser(userId, intentId);

  if (!existingIntent) {
    return null;
  }

  if (existingIntent.purchase) {
    return {
      intentId,
      status: "paid" as const,
      assessmentSlug: existingIntent.assessmentSlug,
      assessmentTitle: existingIntent.assessmentTitle ?? existingIntent.assessmentSlug,
      regionKey: existingIntent.regionKey,
      returnUrl: existingIntent.cancelUrl ?? null
    };
  }

  await prisma.checkoutIntent.update({
    where: {
      id: existingIntent.id
    },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      lastPaymentEventAt: new Date()
    }
  });

  return {
    intentId,
    status: "canceled" as const,
    assessmentSlug: existingIntent.assessmentSlug,
    assessmentTitle: existingIntent.assessmentTitle ?? existingIntent.assessmentSlug,
    regionKey: existingIntent.regionKey,
    returnUrl: existingIntent.cancelUrl ?? null
  };
}

export async function cancelPersistentCheckoutIntentById(intentId: string) {
  const existingIntent = await getCheckoutIntentById(intentId);

  if (!existingIntent) {
    return null;
  }

  if (existingIntent.purchase) {
    return {
      intentId,
      status: "paid" as const,
      assessmentSlug: existingIntent.assessmentSlug,
      assessmentTitle: existingIntent.assessmentTitle ?? existingIntent.assessmentSlug,
      regionKey: existingIntent.regionKey,
      returnUrl: existingIntent.cancelUrl ?? null
    };
  }

  await prisma.checkoutIntent.update({
    where: {
      id: existingIntent.id
    },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      lastPaymentEventAt: new Date()
    }
  });

  return {
    intentId,
    status: "canceled" as const,
    assessmentSlug: existingIntent.assessmentSlug,
    assessmentTitle: existingIntent.assessmentTitle ?? existingIntent.assessmentSlug,
    regionKey: existingIntent.regionKey,
    returnUrl: existingIntent.cancelUrl ?? null
  };
}
