import type { CheckoutIntentStatus } from "@prisma/client";

import type { CheckoutSessionDescriptor } from "@/lib/commerce/types";
import type { SafeUser } from "@/lib/server/services/users";
import type { CheckoutPaymentProvider, CurrencyCode, RegionKey } from "@/lib/region/types";

export type PaymentCheckoutMode = "payment" | "subscription";

export type PaymentCheckoutInput = {
  intentId: string;
  user: SafeUser;
  assessmentSlug: string;
  assessmentTitle: string;
  topic: string;
  regionKey: RegionKey;
  offerId: string;
  offerTitle: string;
  purchaseType:
    | "single_report"
    | "premium_report"
    | "bundle"
    | "subscription"
    | "explanation_session";
  checkoutMode: PaymentCheckoutMode;
  amountCents: number;
  currency: CurrencyCode;
  paymentProvider: CheckoutPaymentProvider;
  successUrl: string;
  cancelUrl: string;
  sourceBlogUrl: string | null;
  sourceTopic: string | null;
  includedAssessmentSlugs: string[];
  subscriptionPlanCode: string | null;
};

export type PaymentCheckoutDescriptor = Pick<
  CheckoutSessionDescriptor,
  "providerReady" | "redirectUrl" | "cancelUrl" | "notes" | "checkoutMethod" | "providerPayload"
> & {
  providerStatus: CheckoutIntentStatus;
  providerSessionId: string | null;
  providerOrderId: string | null;
  providerPriceLookupKey: string | null;
};

export type ConfirmedPaymentDetails = {
  provider: "stripe" | "razorpay";
  providerSessionId?: string | null;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  amountCents: number;
  currency: CurrencyCode;
  paidAt: Date;
  metadata?: Record<string, unknown>;
};

export type PaymentVerificationResult =
  | {
      ok: true;
      confirmation: ConfirmedPaymentDetails;
    }
  | {
      ok: false;
      status: "pending" | "failed" | "canceled" | "expired";
      message: string;
    };

export type RazorpayVerificationPayload = {
  intentId: string;
  orderId: string;
  paymentId: string;
  signature: string;
};
