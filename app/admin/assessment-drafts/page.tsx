import Link from "next/link";
import type {
  AssessmentDraftGenerationStatus,
  AssessmentDraftPublishStatus,
  AssessmentDraftReviewStatus
} from "@prisma/client";

import { AssessmentDraftStatusBadges } from "@/components/admin/assessment-draft-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { SectionShell } from "@/components/ui/section-shell";
import {
  formatAdminDate,
  formatAdminLabel,
  formatAdminNumber
} from "@/lib/admin/format";
import { listAssessmentDrafts } from "@/lib/server/services/assessment-drafts";

const generationStatusOptions = [
  "",
  "EMPTY",
  "GENERATING",
  "GENERATED",
  "FAILED"
] as const satisfies readonly ("" | AssessmentDraftGenerationStatus)[];

const reviewStatusOptions = [
  "",
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "NEEDS_REVISION"
] as const satisfies readonly ("" | AssessmentDraftReviewStatus)[];

const publishStatusOptions = [
  "",
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED"
] as const satisfies readonly ("" | AssessmentDraftPublishStatus)[];

type AssessmentDraftsPageProps = {
  searchParams?: Promise<{
    q?: string;
    generationStatus?: string;
    reviewStatus?: string;
    publishStatus?: string;
  }>;
};

function isGenerationStatus(
  value: string | undefined
): value is AssessmentDraftGenerationStatus {
  return (
    value === "EMPTY" ||
    value === "GENERATING" ||
    value === "GENERATED" ||
    value === "FAILED"
  );
}

function isReviewStatus(value: string | undefined): value is AssessmentDraftReviewStatus {
  return (
    value === "DRAFT" ||
    value === "UNDER_REVIEW" ||
    value === "APPROVED" ||
    value === "NEEDS_REVISION"
  );
}

function isPublishStatus(value: string | undefined): value is AssessmentDraftPublishStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

export default async function AssessmentDraftsPage({
  searchParams
}: AssessmentDraftsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const generationStatus = isGenerationStatus(resolvedSearchParams.generationStatus)
    ? resolvedSearchParams.generationStatus
    : undefined;
  const reviewStatus = isReviewStatus(resolvedSearchParams.reviewStatus)
    ? resolvedSearchParams.reviewStatus
    : undefined;
  const publishStatus = isPublishStatus(resolvedSearchParams.publishStatus)
    ? resolvedSearchParams.publishStatus
    : undefined;

  const drafts = await listAssessmentDrafts({
    query,
    generationStatus,
    reviewStatus,
    publishStatus
  });

  return (
    <>
      <SectionShell
        eyebrow="Assessment Drafts"
        title="Manage draft assessments before AI generation or publication"
        description="Create shells, review draft metadata, and edit dimensions, questions, issue-page copy, preview framing, and report blueprint logic without touching live assessments."
        variant="panel"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="muted" className="min-w-[180px]">
              <CardHeader className="space-y-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Drafts
                </p>
                <CardTitle className="text-[1.8rem]">
                  {formatAdminNumber(drafts.length)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card variant="muted" className="min-w-[180px]">
              <CardHeader className="space-y-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Generated
                </p>
                <CardTitle className="text-[1.8rem]">
                  {formatAdminNumber(
                    drafts.filter((draft) => draft.generationStatus === "GENERATED").length
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card variant="muted" className="min-w-[180px]">
              <CardHeader className="space-y-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Under Review
                </p>
                <CardTitle className="text-[1.8rem]">
                  {formatAdminNumber(
                    drafts.filter((draft) => draft.reviewStatus === "UNDER_REVIEW").length
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/assessment-drafts/new">Create New Draft</Link>
          </Button>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Search & Filter"
        title="Find the right draft quickly"
        description="Search by title, slug, or topic family. Filter by generation, review, or publish state without leaving the page."
        variant="subtle"
      >
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-[1.3rem]">Draft filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,180px))_auto]"
              action="/admin/assessment-drafts"
            >
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search title, slug, or topic family"
              />
              <SelectField name="generationStatus" defaultValue={generationStatus ?? ""}>
                {generationStatusOptions.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? status.replace(/_/g, " ") : "All generation states"}
                  </option>
                ))}
              </SelectField>
              <SelectField name="reviewStatus" defaultValue={reviewStatus ?? ""}>
                {reviewStatusOptions.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? status.replace(/_/g, " ") : "All review states"}
                  </option>
                ))}
              </SelectField>
              <SelectField name="publishStatus" defaultValue={publishStatus ?? ""}>
                {publishStatusOptions.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? status.replace(/_/g, " ") : "All publish states"}
                  </option>
                ))}
              </SelectField>
              <div className="flex gap-3">
                <Button type="submit" size="md">
                  Apply
                </Button>
                {(query || generationStatus || reviewStatus || publishStatus) && (
                  <Link
                    href="/admin/assessment-drafts"
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 px-5 text-[0.98rem] font-semibold text-foreground transition hover:border-primary/45 hover:bg-white/[0.06]"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell
        eyebrow="Draft Library"
        title="Manual editorial drafts and generation-ready shells"
        description="This table shows only real draft records stored in the database. Nothing here is published live yet."
        variant="panel"
      >
        <div className="grid gap-4">
          {drafts.length === 0 ? (
            <Card variant="muted">
              <CardHeader className="space-y-3">
                <CardTitle className="text-[1.3rem]">No drafts match this filter</CardTitle>
                <p className="body-md max-w-3xl">
                  Create the first draft shell or widen the current filters to see more stored
                  assessment drafts.
                </p>
              </CardHeader>
            </Card>
          ) : (
            drafts.map((draft) => (
              <Card key={draft.id} hoverable>
                <CardContent className="py-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <AssessmentDraftStatusBadges
                            generationStatus={draft.generationStatus}
                            reviewStatus={draft.reviewStatus}
                            publishStatus={draft.publishStatus}
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-[1.35rem] font-semibold tracking-tight text-foreground">
                            {draft.title}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                            <span>{draft.slug}</span>
                            <span>{formatAdminLabel(draft.topicFamily, "No topic family")}</span>
                            <span>v{draft.draftVersion}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="surface-block px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            Target audience
                          </p>
                          <p className="mt-2 text-sm leading-6 text-foreground">
                            {formatAdminLabel(draft.targetAudience, "Not set")}
                          </p>
                        </div>
                        <div className="surface-block px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            Questions
                          </p>
                          <p className="mt-2 text-sm leading-6 text-foreground">
                            {formatAdminNumber(draft._count.questions)} stored
                          </p>
                        </div>
                        <div className="surface-block px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            Dimensions
                          </p>
                          <p className="mt-2 text-sm leading-6 text-foreground">
                            {formatAdminNumber(draft._count.dimensions)} stored
                          </p>
                        </div>
                        <div className="surface-block px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            Updated
                          </p>
                          <p className="mt-2 text-sm leading-6 text-foreground">
                            {formatAdminDate(draft.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:justify-end">
                      <Button asChild size="md">
                        <Link href={`/admin/assessment-drafts/${draft.id}`}>Open Draft</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SectionShell>
    </>
  );
}
