import "server-only";

import { randomUUID } from "node:crypto";

import type { CheckoutSessionDescriptor, CheckoutSessionRequest } from "@/lib/commerce/types";
import { buildCheckoutSessionDescriptor } from "@/lib/commerce/stripe";
import { toPrismaPaymentProvider, toPrismaPurchaseType } from "@/lib/commerce/server/mappers";
import {
  getRazorpayConfig,
  getStripeConfig,
  resolveAppBaseUrl
} from "@/lib/payments/config";
import { createLivePaymentCheckout } from "@/lib/payments/service";
import { createCheckoutIntentRecord, updateCheckoutIntentById } from "@/lib/server/services/checkout-intents";
import type { SafeUser } from "@/lib/server/services/users";

function resolveSafeReturnUrl(returnToPath: string | null | undefined, baseUrl: string) {
  if (!returnToPath || typeof returnToPath !== "string") {
    return null;
  }

  try {
    const candidate = new URL(returnToPath, baseUrl);
    const appUrl = new URL(baseUrl);

    if (candidate.origin !== appUrl.origin) {
      return null;
    }

    return candidate.toString();
  } catch {
    return null;
  }
}

function toClientIntent(
  user: SafeUser,
  payload: CheckoutSessionRequest,
  intentId: string,
  descriptor: Awaited<ReturnType<typeof createLivePaymentCheckout>>,
  successUrl: string,
  cancelUrl: string
): CheckoutSessionDescriptor["intent"] {
  if (!descriptor) {
    throw new Error("A live payment descriptor is required to build the client checkout intent.");
  }

  return {
    id: intentId,
    userId: user.id,
    assessmentSessionId: payload.assessmentSessionId ?? null,
    assessmentSlug: payload.assessmentSlug,
    assessmentTitle: payload.assessmentTitle,
    topic: payload.topic,
    regionKey: payload.regionKey,
    offerId: payload.offerId,
    offerTitle: payload.offerTitle,
    purchaseType: payload.purchaseType,
    priceCents: payload.priceCents,
    currency: payload.currency,
    provider: payload.paymentProvider,
    providerSessionId: descriptor.providerSessionId,
    providerOrderId: descriptor.providerOrderId,
    checkoutMode: payload.purchaseType === "subscription" ? "subscription" : "payment",
    providerPriceLookupKey: descriptor.providerPriceLookupKey,
    successUrl,
    cancelUrl,
    status:
      descriptor.providerStatus === "REQUIRES_ACTION"
        ? "requires_action"
        : descriptor.providerStatus === "PAID"
          ? "paid"
          : descriptor.providerStatus === "FAILED"
            ? "failed"
            : descriptor.providerStatus === "EXPIRED"
              ? "expired"
              : descriptor.providerStatus === "CANCELED"
                ? "canceled"
                : "pending",
    sourceBlogUrl: payload.sourceBlogUrl,
    sourceTopic: payload.sourceTopic,
    includedAssessmentSlugs: payload.includedAssessmentSlugs,
    subscriptionPlanCode: payload.subscriptionPlanCode,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

export async function createPersistentCheckoutSessionDescriptor(
  user: SafeUser,
  payload: CheckoutSessionRequest,
  origin: string,
  options?: {
    checkoutEmail?: string | null;
    checkoutUserOrigin?: "authenticated" | "existing" | "provisional" | null;
  }
): Promise<CheckoutSessionDescriptor> {
  const intentId = randomUUID();
  const baseUrl = resolveAppBaseUrl(origin);
  const successUrl = `${baseUrl}/checkout/success?intent=${intentId}`;
  const cancelUrl =
    resolveSafeReturnUrl(payload.returnToPath, baseUrl) ??
    `${baseUrl}/checkout/cancel?intent=${intentId}`;
  const stripeConfig = getStripeConfig();
  const razorpayConfig = getRazorpayConfig();

  await createCheckoutIntentRecord({
    id: intentId,
    userId: user.id,
    assessmentSessionId: payload.assessmentSessionId ?? null,
    assessmentSlug: payload.assessmentSlug,
    assessmentTitle: payload.assessmentTitle,
    topicKey: payload.topic,
    regionKey: payload.regionKey,
    currency: payload.currency,
    paymentProvider: toPrismaPaymentProvider(payload.paymentProvider),
    offerType: payload.offerId,
    offerTitle: payload.offerTitle,
    purchaseType: toPrismaPurchaseType(payload.purchaseType),
    amountCents: payload.priceCents,
    checkoutMode: payload.purchaseType === "subscription" ? "subscription" : "payment",
    successUrl,
    cancelUrl,
    status: "PENDING",
    metadata: {
      sourceBlogUrl: payload.sourceBlogUrl,
      sourceTopic: payload.sourceTopic,
      includedAssessmentSlugs: payload.includedAssessmentSlugs,
      subscriptionPlanCode: payload.subscriptionPlanCode,
      livePaymentProvider: payload.paymentProvider,
      checkoutEmail: options?.checkoutEmail ?? null,
      checkoutUserOrigin: options?.checkoutUserOrigin ?? "authenticated",
      requiresAccountClaim: options?.checkoutUserOrigin === "provisional"
    }
  });

  let liveDescriptor: Awaited<ReturnType<typeof createLivePaymentCheckout>> = null;
  const providerConfigured =
    payload.paymentProvider === "stripe"
      ? Boolean(stripeConfig.secretKey)
      : Boolean(razorpayConfig.keyId && razorpayConfig.secretKey);

  try {
    liveDescriptor = await createLivePaymentCheckout({
      intentId,
      user,
      assessmentSlug: payload.assessmentSlug,
      assessmentTitle: payload.assessmentTitle,
      topic: payload.topic,
      regionKey: payload.regionKey,
      offerId: payload.offerId,
      offerTitle: payload.offerTitle,
      purchaseType: payload.purchaseType,
      checkoutMode: payload.purchaseType === "subscription" ? "subscription" : "payment",
      amountCents: payload.priceCents,
      currency: payload.currency,
      paymentProvider: payload.paymentProvider,
      successUrl,
      cancelUrl,
      sourceBlogUrl: payload.sourceBlogUrl,
      sourceTopic: payload.sourceTopic,
      includedAssessmentSlugs: payload.includedAssessmentSlugs,
      subscriptionPlanCode: payload.subscriptionPlanCode
    });
  } catch (error) {
    await updateCheckoutIntentById(intentId, {
      status: "FAILED",
      failureReason: error instanceof Error ? error.message : "Payment provider handoff failed."
    });
    throw error;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[checkout-persistent]", {
      intentId,
      provider: payload.paymentProvider,
      providerConfigured,
      providerReady: Boolean(liveDescriptor?.providerReady),
      decision: liveDescriptor?.providerReady
        ? "live_checkout"
        : providerConfigured
          ? "live_handoff_failed"
          : "demo_fallback_missing_keys"
    });
  }

  if (!liveDescriptor?.providerReady) {
    if (providerConfigured) {
      await updateCheckoutIntentById(intentId, {
        status: "FAILED",
        failureReason: "Live payment provider handoff could not be created."
      });

      throw new Error("Secure checkout could not be started with the configured payment provider.");
    }

    if (process.env.NODE_ENV !== "development") {
      await updateCheckoutIntentById(intentId, {
        status: "FAILED",
        failureReason: "Live payment provider is not configured in this environment."
      });

      throw new Error("Secure checkout is not available in this environment.");
    }

    await updateCheckoutIntentById(intentId, {
      status: "FAILED",
      failureReason: "Live payment provider is not configured in this environment."
    });

    return buildCheckoutSessionDescriptor(payload, origin, {
      intentId,
      userId: user.id,
      successUrl,
      cancelUrl
    });
  }

  await updateCheckoutIntentById(intentId, {
    status: liveDescriptor.providerStatus,
    providerSessionId: liveDescriptor.providerSessionId,
    providerOrderId: liveDescriptor.providerOrderId,
    providerPriceLookupKey: liveDescriptor.providerPriceLookupKey,
    lastPaymentEventAt: new Date(),
    failureReason: null
  });

  return {
    providerReady: liveDescriptor.providerReady,
    redirectUrl: liveDescriptor.redirectUrl,
    cancelUrl: liveDescriptor.cancelUrl,
    persistenceMode: "database",
    checkoutMethod: liveDescriptor.checkoutMethod,
    providerPayload: liveDescriptor.providerPayload,
    intent: toClientIntent(user, payload, intentId, liveDescriptor, successUrl, cancelUrl),
    notes: liveDescriptor.notes
  };
}
