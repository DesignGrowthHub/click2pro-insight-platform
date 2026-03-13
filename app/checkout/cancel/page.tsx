import { Suspense } from "react";

import { CheckoutCancelShell } from "@/components/checkout/checkout-cancel-shell";
import { SectionShell } from "@/components/ui/section-shell";

export default function CheckoutCancelPage() {
  return (
    <main>
      <SectionShell
        eyebrow="Checkout Canceled"
        title="The preview remains available until the user is ready to unlock the full report"
        description="The cancel path is part of the purchase foundation so the experience remains respectful and high-trust."
        variant="panel"
        className="pb-8 pt-10 sm:pt-14"
      >
        <Suspense fallback={null}>
          <CheckoutCancelShell />
        </Suspense>
      </SectionShell>
    </main>
  );
}
