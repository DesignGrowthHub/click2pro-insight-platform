import "server-only";

import Stripe from "stripe";

import { warnIfEnvironmentMissing } from "@/lib/config/env";
import { getStripeConfig } from "@/lib/payments/config";
import type {
  ConfirmedPaymentDetails,
  PaymentCheckoutDescriptor,
  PaymentCheckoutInput,
  PaymentVerificationResult
} from "@/lib/payments/types";

let stripeClient: Stripe | null = null;

function isGuestCheckoutPlaceholderEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@checkout.local"));
}

function toStripeInterval(planCode: string | null) {
  return planCode?.includes("monthly") ? "month" : "year";
}

function buildMetadata(input: PaymentCheckoutInput) {
  return {
    checkoutIntentId: input.intentId,
    userId: input.user.id,
    assessmentSlug: input.assessmentSlug,
    assessmentTitle: input.assessmentTitle,
    topic: input.topic,
    regionKey: input.regionKey,
    offerId: input.offerId,
    offerTitle: input.offerTitle,
    purchaseType: input.purchaseType,
    currency: input.currency,
    sourceBlogUrl: input.sourceBlogUrl ?? "",
    sourceTopic: input.sourceTopic ?? "",
    includedAssessmentSlugs: JSON.stringify(input.includedAssessmentSlugs),
    subscriptionPlanCode: input.subscriptionPlanCode ?? ""
  };
}

export function getStripeServerClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const { secretKey } = getStripeConfig();

  if (!secretKey) {
    warnIfEnvironmentMissing(
      "stripe",
      "STRIPE_SECRET_KEY is missing, so live Stripe checkout cannot be created in this environment."
    );
    return null;
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export async function createStripeCheckoutSession(
  input: PaymentCheckoutInput
): Promise<PaymentCheckoutDescriptor> {
  const stripe = getStripeServerClient();

  if (!stripe) {
    return {
      providerReady: false,
      redirectUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      notes: [
        "Stripe is not configured in this environment, so the live checkout session could not be created."
      ],
      checkoutMethod: "redirect",
      providerPayload: null,
      providerStatus: "PENDING",
      providerSessionId: null,
      providerOrderId: null,
      providerPriceLookupKey: null
    };
  }

  const metadata = buildMetadata(input);
  const customerEmail = isGuestCheckoutPlaceholderEmail(input.user.email)
    ? undefined
    : input.user.email;
  const session = await stripe.checkout.sessions.create({
    mode: input.checkoutMode,
    success_url: `${input.successUrl}&provider=stripe`,
    cancel_url: `${input.cancelUrl}&provider=stripe`,
    client_reference_id: input.intentId,
    customer_email: customerEmail,
    billing_address_collection: "auto",
    customer_creation: input.checkoutMode === "payment" ? "if_required" : undefined,
    metadata,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountCents,
          recurring:
            input.checkoutMode === "subscription"
              ? {
                  interval: toStripeInterval(input.subscriptionPlanCode)
                }
              : undefined,
          product_data: {
            name: input.offerTitle,
            description:
              input.purchaseType === "subscription"
                ? "Private ongoing access to the Click2Pro Insight Platform library."
                : `Private access for ${input.assessmentTitle} on Click2Pro Insight Platform.`
          }
        }
      }
    ],
    subscription_data:
      input.checkoutMode === "subscription"
        ? {
            metadata
          }
        : undefined
  });

  return {
    providerReady: true,
    redirectUrl: session.url ?? input.successUrl,
    cancelUrl: input.cancelUrl,
    notes: [
      "Stripe Checkout session created successfully.",
      "Payment confirmation should be finalized by webhook first, with the success route acting as a safe verification fallback."
    ],
    checkoutMethod: "redirect",
    providerPayload: null,
    providerStatus: "REQUIRES_ACTION",
    providerSessionId: session.id,
    providerOrderId: null,
    providerPriceLookupKey: null
  };
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeServerClient();

  if (!stripe) {
    return null;
  }

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"]
  });
}

export function buildStripeVerificationResult(
  session: Stripe.Checkout.Session
): PaymentVerificationResult {
  if (session.status === "expired") {
    return {
      ok: false,
      status: "expired",
      message: "The Stripe Checkout session expired before payment was completed."
    };
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return {
      ok: false,
      status: session.status === "open" ? "pending" : "failed",
      message: "Stripe has not marked this checkout session as paid yet."
    };
  }

  const confirmation: ConfirmedPaymentDetails = {
    provider: "stripe",
    providerSessionId: session.id,
    providerPaymentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    providerCustomerId:
      typeof session.customer === "string" ? session.customer : null,
    providerSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    amountCents: session.amount_total ?? 0,
    currency: session.currency?.toUpperCase() === "INR" ? "INR" : "USD",
    paidAt: new Date(),
    metadata: {
      ...(session.metadata && Object.keys(session.metadata).length > 0
        ? session.metadata
        : {}),
      ...(session.customer_details?.email || session.customer_email
        ? {
            checkoutEmail:
              session.customer_details?.email ?? session.customer_email ?? null
          }
        : {}),
      ...(session.customer_details?.name
        ? {
            checkoutFullName: session.customer_details.name
          }
        : {})
    }
  };

  return {
    ok: true,
    confirmation
  };
}

export function constructStripeWebhookEvent(payload: string, signature: string) {
  const stripe = getStripeServerClient();
  const { webhookSecret } = getStripeConfig();

  if (!stripe || !webhookSecret) {
    warnIfEnvironmentMissing(
      "stripe",
      "STRIPE_WEBHOOK_SECRET is missing, so Stripe webhook confirmation cannot run in this environment."
    );
    return null;
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
