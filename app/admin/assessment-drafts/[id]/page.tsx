import { notFound } from "next/navigation";

import { AssessmentDraftEditor } from "@/components/admin/assessment-draft-editor";
import { AssessmentDraftStatusBadges } from "@/components/admin/assessment-draft-status-badges";
import { LinkButton } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";
import { formatAdminDate, formatAdminLabel } from "@/lib/admin/format";
import { getAssessmentDraftById } from "@/lib/server/services/assessment-drafts";

type AssessmentDraftDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentDraftDetailPage({
  params
}: AssessmentDraftDetailPageProps) {
  const { id } = await params;
  const draft = await getAssessmentDraftById(id);

  if (!draft) {
    notFound();
  }

  return (
    <>
      <SectionShell
        eyebrow="Draft Detail"
        title={draft.title}
        description="Review and edit the stored draft across metadata, dimensions, questions, issue-page copy, preview framing, and report blueprint logic. Nothing here is live yet."
        variant="panel"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <AssessmentDraftStatusBadges
                generationStatus={draft.generationStatus}
                reviewStatus={draft.reviewStatus}
                publishStatus={draft.publishStatus}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span>{draft.slug}</span>
              <span>{formatAdminLabel(draft.topicFamily, "No topic family")}</span>
              <span>v{draft.draftVersion}</span>
              <span>Updated {formatAdminDate(draft.updatedAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/admin/assessment-drafts" variant="outline" size="md">
              Back To Drafts
            </LinkButton>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Draft Snapshot"
        title="Current draft shape"
        description="Quick visibility into how much of the draft has already been structured before you edit the full detail sections below."
        variant="subtle"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card variant="muted">
            <CardHeader className="space-y-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Dimensions
              </p>
              <CardTitle className="text-[1.8rem]">{draft.dimensions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card variant="muted">
            <CardHeader className="space-y-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Questions
              </p>
              <CardTitle className="text-[1.8rem]">{draft.questions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card variant="muted">
            <CardHeader className="space-y-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Issue page draft
              </p>
              <CardTitle className="text-[1.05rem]">
                {draft.issuePage ? "Present" : "Not started"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card variant="muted">
            <CardHeader className="space-y-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Blueprint status
              </p>
              <CardTitle className="text-[1.05rem]">
                {draft.previewBlueprint || draft.reportBlueprint ? "In progress" : "Not started"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Editor"
        title="Manual draft editor"
        description="Use the sectioned editor below to review or update any part of the assessment draft before AI generation or later publish workflow phases exist."
        variant="panel"
      >
        <AssessmentDraftEditor
          draft={{
            ...draft,
            updatedAt: draft.updatedAt.toISOString()
          }}
        />
      </SectionShell>
    </>
  );
}
