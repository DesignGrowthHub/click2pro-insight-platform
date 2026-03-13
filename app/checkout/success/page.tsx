import { Suspense } from "react";

import { CheckoutSuccessShell } from "@/components/checkout/checkout-success-shell";
import { SectionShell } from "@/components/ui/section-shell";

export default function CheckoutSuccessPage() {
  return (
    <main>
      <SectionShell
        eyebrow="Purchase Success"
        title="Your payment is complete"
        description="We’ll guide you into the right next step so you can open the saved report without losing the payment-first flow."
        variant="panel"
        className="pb-8 pt-10 sm:pt-14"
      >
        <Suspense fallback={null}>
          <CheckoutSuccessShell />
        </Suspense>
      </SectionShell>
    </main>
  );
}
