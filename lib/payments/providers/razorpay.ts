import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import Razorpay from "razorpay";

import { warnIfEnvironmentMissing } from "@/lib/config/env";
import { getRazorpayConfig } from "@/lib/payments/config";
import type {
  ConfirmedPaymentDetails,
  PaymentCheckoutDescriptor,
  PaymentCheckoutInput,
  PaymentVerificationResult
} from "@/lib/payments/types";

let razorpayClient: Razorpay | null = null;

function isGuestCheckoutPlaceholderEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@checkout.local"));
}

function buildNotes(input: PaymentCheckoutInput) {
  return {
    checkoutIntentId: input.intentId,
    userId: input.user.id,
    assessmentSlug: input.assessmentSlug,
    assessmentTitle: input.assessmentTitle,
    topic: input.topic,
    regionKey: input.regionKey,
    offerId: input.offerId,
    purchaseType: input.purchaseType,
    sourceTopic: input.sourceTopic ?? ""
  };
}

function secureCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function getRazorpayServerClient() {
  if (razorpayClient) {
    return razorpayClient;
  }

  const { keyId, secretKey } = getRazorpayConfig();

  if (!keyId || !secretKey) {
    warnIfEnvironmentMissing(
      "razorpay",
      "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing, so live Razorpay checkout cannot be created in this environment."
    );
    return null;
  }

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: secretKey
  });

  return razorpayClient;
}

export async function createRazorpayOrder(
  input: PaymentCheckoutInput
): Promise<PaymentCheckoutDescriptor> {
  const razorpay = getRazorpayServerClient();
  const { keyId } = getRazorpayConfig();

  if (!razorpay || !keyId) {
    return {
      providerReady: false,
      redirectUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      notes: [
        "Razorpay is not configured in this environment, so the live payment order could not be created."
      ],
      checkoutMethod: "redirect",
      providerPayload: null,
      providerStatus: "PENDING",
      providerSessionId: null,
      providerOrderId: null,
      providerPriceLookupKey: null
    };
  }

  const prefill = isGuestCheckoutPlaceholderEmail(input.user.email)
    ? undefined
    : {
        email: input.user.email,
        name: input.user.fullName ?? input.user.email
      };

  const order = await razorpay.orders.create({
    amount: input.amountCents,
    currency: input.currency,
    receipt: `intent_${input.intentId}`.slice(0, 40),
    notes: buildNotes(input)
  });

  return {
    providerReady: true,
    redirectUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    notes: [
      "Razorpay order created successfully.",
      "Payment confirmation should only be granted after server-side signature verification."
    ],
    checkoutMethod: "razorpay_modal",
    providerPayload: {
      provider: "razorpay",
      keyId,
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency === "INR" ? "INR" : "USD",
      name: "Click2Pro Insight Platform",
      description: input.offerTitle,
      prefill,
      themeColor: "#3B82F6"
    },
    providerStatus: "REQUIRES_ACTION",
    providerSessionId: null,
    providerOrderId: order.id,
    providerPriceLookupKey: null
  };
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { secretKey } = getRazorpayConfig();

  if (!secretKey) {
    warnIfEnvironmentMissing(
      "razorpay",
      "RAZORPAY_KEY_SECRET is missing, so signed Razorpay payment verification cannot run in this environment."
    );
    return false;
  }

  const expectedSignature = createHmac("sha256", secretKey)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  return secureCompare(expectedSignature, input.signature);
}

export function buildRazorpayVerificationResult(input: {
  orderId: string;
  paymentId: string;
  amountCents: number;
  currency: "USD" | "INR";
  checkoutEmail?: string | null;
  checkoutFullName?: string | null;
  checkoutContact?: string | null;
}): PaymentVerificationResult {
  const confirmation: ConfirmedPaymentDetails = {
    provider: "razorpay",
    providerOrderId: input.orderId,
    providerPaymentId: input.paymentId,
    amountCents: input.amountCents,
    currency: input.currency,
    paidAt: new Date(),
    metadata: {
      ...(input.checkoutEmail
        ? {
            checkoutEmail: input.checkoutEmail
          }
        : {}),
      ...(input.checkoutFullName
        ? {
            checkoutFullName: input.checkoutFullName
          }
        : {}),
      ...(input.checkoutContact
        ? {
            checkoutContact: input.checkoutContact
          }
        : {})
    }
  };

  return {
    ok: true,
    confirmation
  };
}

export async function fetchRazorpayPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayServerClient();

  if (!razorpay) {
    return null;
  }

  return razorpay.payments.fetch(paymentId);
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const { webhookSecret } = getRazorpayConfig();

  if (!webhookSecret) {
    warnIfEnvironmentMissing(
      "razorpay",
      "RAZORPAY_WEBHOOK_SECRET is missing, so Razorpay webhook verification cannot run in this environment."
    );
    return false;
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return secureCompare(expectedSignature, signature);
}
