"use client";

import { useEffect, useState } from "react";

import {
  COMMERCE_STATE_EVENT,
  completeCheckoutIntent
} from "@/lib/commerce/ownership-store";
import type {
  ExplanationEntitlementRecord,
  OwnedBundle,
  OwnedReport,
  PurchaseRecord,
  SubscriptionRecord
} from "@/lib/commerce/types";

export type CheckoutCompletionResult = {
  ownedBundle: OwnedBundle | null;
  ownedReport: OwnedReport | null;
  purchaseRecord: PurchaseRecord | null;
  subscription: SubscriptionRecord | null;
  explanationEntitlement: ExplanationEntitlementRecord | null;
  checkoutEmail: string | null;
  accessHandoff: "open_report" | "claim_account" | "sign_in";
};

export function useCheckoutCompletion(
  intentId: string | null,
  mode: string | null,
  provider: string | null = null
) {
  const [result, setResult] = useState<CheckoutCompletionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!intentId) {
      return;
    }

    let cancelled = false;

    async function finalize(attempt = 0) {
      try {
        const response = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            intentId,
            allowDemoFallback: mode === "demo"
          })
        });

        if (!response.ok) {
          const payload = (await response.json()) as {
            error?: string;
          };

          if (response.status === 409 && attempt < 6) {
            window.setTimeout(() => {
              if (!cancelled) {
                void finalize(attempt + 1);
              }
            }, Math.min(900 + attempt * 900, 4200));
            return;
          }

          throw new Error(
            payload.error ??
              (mode === "demo"
                ? "Falling back to local placeholder completion."
                : provider === "razorpay"
                  ? "Razorpay payment confirmation is still being finalized."
                  : "Payment confirmation could not be completed yet.")
          );
        }

        const payload = (await response.json()) as {
          ownedBundle: OwnedBundle | null;
          ownedReport: OwnedReport | null;
          purchaseRecord: PurchaseRecord | null;
          subscription: SubscriptionRecord | null;
          explanationEntitlement?: ExplanationEntitlementRecord | null;
          checkoutEmail?: string | null;
          accessHandoff?: "open_report" | "claim_account" | "sign_in";
        };

        if (!cancelled) {
          setResult({
            ownedBundle: payload.ownedBundle,
            ownedReport: payload.ownedReport,
            purchaseRecord: payload.purchaseRecord,
            subscription: payload.subscription,
            explanationEntitlement: payload.explanationEntitlement ?? null,
            checkoutEmail: payload.checkoutEmail ?? null,
            accessHandoff: payload.accessHandoff ?? "open_report"
          });
          window.dispatchEvent(new CustomEvent(COMMERCE_STATE_EVENT));
        }

        return;
      } catch (error) {
        if (mode !== "demo" || process.env.NODE_ENV !== "development") {
          if (!cancelled) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : provider === "razorpay"
                  ? "Razorpay payment confirmation is still being finalized."
                  : "Payment confirmation could not be completed yet."
            );
          }
          return;
        }

        const completion = completeCheckoutIntent(intentId as string);

        if (!cancelled) {
          setResult({
            ownedBundle: completion.ownedBundle,
            ownedReport: completion.ownedReport,
            purchaseRecord: completion.purchaseRecord,
            subscription: completion.subscription,
            explanationEntitlement: completion.explanationEntitlement,
            checkoutEmail: null,
            accessHandoff: "open_report"
          });
        }
      }
    }

    void finalize();

    return () => {
      cancelled = true;
    };
  }, [intentId, mode, provider]);

  return {
    result,
    errorMessage
  };
}
