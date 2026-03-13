import { Suspense } from "react";

import { CheckoutClaimShell } from "@/components/checkout/checkout-claim-shell";
import { SectionShell } from "@/components/ui/section-shell";

export default function CheckoutClaimPage() {
  return (
    <main>
      <SectionShell
        eyebrow="Secure Account Claim"
        title="Set your password and continue to the saved report"
        description="This step keeps the payment-first path intact while attaching the purchased report to a private account you can return to anytime."
        variant="panel"
        className="pb-8 pt-10 sm:pt-14"
      >
        <Suspense fallback={null}>
          <CheckoutClaimShell />
        </Suspense>
      </SectionShell>
    </main>
  );
}
