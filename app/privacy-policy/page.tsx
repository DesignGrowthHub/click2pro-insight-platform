import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { privacyPolicyContent } from "@/lib/legal-content";

export default function PrivacyPolicyPage() {
  return <LegalPageShell {...privacyPolicyContent} />;
}
