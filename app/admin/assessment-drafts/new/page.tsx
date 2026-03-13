import { AssessmentDraftCreateForm } from "@/components/admin/assessment-draft-create-form";
import { LinkButton } from "@/components/ui/button";
import { SectionShell } from "@/components/ui/section-shell";

export default function NewAssessmentDraftPage() {
  return (
    <>
      <SectionShell
        eyebrow="New Draft"
        title="Create an assessment draft shell"
        description="Start with a clean draft record for manual editorial work, generation planning, and later review. This does not publish anything to the live product."
        variant="panel"
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/admin/assessment-drafts" variant="outline" size="md">
            Back To Drafts
          </LinkButton>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Draft Setup"
        title="Capture the initial framing before writing questions or report logic"
        description="These fields establish the draft shell only. Detailed dimensions, questions, issue-page copy, and blueprint structure can be edited immediately after creation."
        variant="subtle"
      >
        <AssessmentDraftCreateForm />
      </SectionShell>
    </>
  );
}
