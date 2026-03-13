"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { storeCheckoutIntent } from "@/lib/commerce/ownership-store";
import type { CheckoutSessionDescriptor, PurchaseType } from "@/lib/commerce/types";
import { loadRazorpayCheckoutScript, openRazorpayCheckout } from "@/lib/payments/razorpay-client";
import type { CurrencyCode, RegionKey } from "@/lib/region/types";

type PricingCheckoutAssessmentContext = {
  slug: string;
  title: string;
  topic: string;
};

type PricingCheckoutConfig = {
  offerId: string;
  offerTitle: string;
  purchaseType: PurchaseType;
  priceCents: number;
  currency: CurrencyCode;
  paymentProvider: "stripe" | "razorpay";
  regionKey: RegionKey;
  subscriptionPlanCode?: string | null;
};

type PricingCheckoutButtonProps = {
  label: string;
  loadingLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  className?: string;
  assessmentContext: PricingCheckoutAssessmentContext;
  checkoutConfig: PricingCheckoutConfig;
  callbackUrl?: string;
};

function isExternalUrl(url: string) {
  return /^https?:\/\//.test(url);
}

export type { PricingCheckoutAssessmentContext, PricingCheckoutConfig };

export function PricingCheckoutButton({
  label,
  loadingLabel = "Preparing secure checkout...",
  size = "lg",
  variant = "outline",
  className,
  assessmentContext,
  checkoutConfig,
  callbackUrl = "/pricing"
}: PricingCheckoutButtonProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function navigateTo(url: string) {
    if (isExternalUrl(url)) {
      window.location.assign(url);
      return;
    }

    router.push(url);
  }

  async function createCheckoutSession() {
    const response = await fetch("/api/checkout/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "pricing-page-checkout",
        assessmentSessionId: null,
        assessmentSlug: assessmentContext.slug,
        assessmentTitle: assessmentContext.title,
        topic: assessmentContext.topic,
        regionKey: checkoutConfig.regionKey,
        offerId: checkoutConfig.offerId,
        offerTitle: checkoutConfig.offerTitle,
        purchaseType: checkoutConfig.purchaseType,
        priceCents: checkoutConfig.priceCents,
        currency: checkoutConfig.currency,
        paymentProvider: checkoutConfig.paymentProvider,
        sourceBlogUrl: null,
        sourceTopic: assessmentContext.topic,
        includedAssessmentSlugs: [],
        subscriptionPlanCode: checkoutConfig.subscriptionPlanCode ?? null,
        returnToPath: callbackUrl
      })
    });

    if (response.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return null;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Unable to create the checkout session.");
    }

    const descriptor = (await response.json()) as CheckoutSessionDescriptor;

    if (
      process.env.NODE_ENV === "development" &&
      descriptor.persistenceMode === "local_demo"
    ) {
      storeCheckoutIntent(descriptor.intent);
    }

    return descriptor;
  }

  async function launchRazorpayCheckout(descriptor: CheckoutSessionDescriptor) {
    if (!descriptor.providerPayload || descriptor.providerPayload.provider !== "razorpay") {
      throw new Error("Razorpay checkout data is missing.");
    }

    const loaded = await loadRazorpayCheckoutScript();

    if (!loaded) {
      throw new Error("Razorpay checkout could not be loaded.");
    }

    const instance = openRazorpayCheckout({
      key: descriptor.providerPayload.keyId,
      amount: descriptor.providerPayload.amount,
      currency: descriptor.providerPayload.currency,
      name: descriptor.providerPayload.name,
      description: descriptor.providerPayload.description,
      order_id: descriptor.providerPayload.orderId,
      prefill: descriptor.providerPayload.prefill,
      theme: {
        color: descriptor.providerPayload.themeColor
      },
      modal: {
        ondismiss: () => {
          setIsRedirecting(false);
          navigateTo(descriptor.cancelUrl);
        }
      },
      handler: async (response) => {
        try {
          const verificationResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              intentId: descriptor.intent.id,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          const payload = (await verificationResponse.json()) as {
            ok?: boolean;
            error?: string;
            successUrl?: string;
          };

          if (!verificationResponse.ok || !payload.ok || !payload.successUrl) {
            throw new Error(
              payload.error ?? "Razorpay payment verification could not be completed."
            );
          }

          navigateTo(payload.successUrl);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Razorpay payment verification could not be completed."
          );
          setIsRedirecting(false);
        }
      }
    });

    instance.on("payment.failed", () => {
      setErrorMessage(
        "The payment did not complete. You can try the checkout again."
      );
      setIsRedirecting(false);
    });
  }

  async function handleCheckout() {
    try {
      setIsRedirecting(true);
      setErrorMessage(null);
      const descriptor = await createCheckoutSession();

      if (!descriptor) {
        setIsRedirecting(false);
        return;
      }

      if (descriptor.checkoutMethod === "razorpay_modal") {
        await launchRazorpayCheckout(descriptor);
        return;
      }

      navigateTo(descriptor.redirectUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start the checkout flow."
      );
      setIsRedirecting(false);
    }
  }

  return (
    <div className="w-full space-y-3">
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={() => {
          void handleCheckout();
        }}
        disabled={isRedirecting}
      >
        {isRedirecting ? loadingLabel : label}
      </Button>
      {errorMessage ? (
        <p className="text-sm leading-7 text-muted">{errorMessage}</p>
      ) : null}
    </div>
  );
}
