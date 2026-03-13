import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { refundPolicyContent } from "@/lib/legal-content";

export default function CancellationAndRefundPolicyPage() {
  return <LegalPageShell {...refundPolicyContent} />;
}
