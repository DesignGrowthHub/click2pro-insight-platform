import type {
  CheckoutIntent,
  CheckoutSessionDescriptor,
  CheckoutSessionRequest
} from "@/lib/commerce/types";
import { getAppBaseUrl } from "@/lib/config/env";

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

type CheckoutIntentOverrides = {
  intentId?: string;
  userId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export function buildCheckoutIntent(
  payload: CheckoutSessionRequest,
  origin: string,
  overrides: CheckoutIntentOverrides = {}
): CheckoutIntent {
  const intentId = overrides.intentId ?? randomId("intent");
  const baseUrl = getAppBaseUrl(origin);
  const isIndia = payload.paymentProvider === "razorpay";
  const successUrl = overrides.successUrl ?? `${baseUrl}/checkout/success?intent=${intentId}&mode=demo`;
  const cancelUrl = overrides.cancelUrl ?? `${baseUrl}/checkout/cancel?intent=${intentId}&mode=demo`;

  return {
    id: intentId,
    userId: overrides.userId ?? payload.userId,
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
    provider: isIndia ? "razorpay_placeholder" : "stripe_placeholder",
    providerSessionId: isIndia ? null : randomId("cs_demo"),
    providerOrderId: isIndia ? randomId("order_demo") : null,
    checkoutMode: payload.purchaseType === "subscription" ? "subscription" : "payment",
    providerPriceLookupKey: null,
    successUrl,
    cancelUrl,
    status: "pending",
    sourceBlogUrl: payload.sourceBlogUrl,
    sourceTopic: payload.sourceTopic,
    includedAssessmentSlugs: payload.includedAssessmentSlugs,
    subscriptionPlanCode: payload.subscriptionPlanCode,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

export function buildCheckoutSessionDescriptor(
  payload: CheckoutSessionRequest,
  origin: string,
  overrides: CheckoutIntentOverrides = {}
): CheckoutSessionDescriptor {
  const intent = buildCheckoutIntent(payload, origin, overrides);

  return {
    providerReady: false,
    redirectUrl: intent.successUrl,
    cancelUrl: intent.cancelUrl,
    persistenceMode: "local_demo",
    checkoutMethod: "redirect",
    providerPayload: null,
    intent,
    notes: [
      "This environment is using the isolated local checkout demo flow.",
      "Live Stripe and Razorpay handoff only happens once provider configuration and authenticated ownership are available."
    ]
  };
}
