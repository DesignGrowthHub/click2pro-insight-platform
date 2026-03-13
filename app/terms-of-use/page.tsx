import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { termsOfUseContent } from "@/lib/legal-content";

export default function TermsOfUsePage() {
  return <LegalPageShell {...termsOfUseContent} />;
}
