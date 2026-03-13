import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { supportContent } from "@/lib/legal-content";

export default function SupportPage() {
  return <LegalPageShell {...supportContent} />;
}
