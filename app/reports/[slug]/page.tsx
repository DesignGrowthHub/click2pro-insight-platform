import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { resolvePersistentAccessStateForAssessment } from "@/lib/commerce/server/access";
import { ReportExperience } from "@/components/reports/report-experience";
import { ReportBlueprintPreview } from "@/components/reports/report-blueprint-preview";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "@/components/ui/section-shell";
import {
  assessments,
  getAssessmentDefinitionBySlug,
  getAssessmentsBySlugs
} from "@/lib/assessments";
import {
  buildProfileCompletionUrl,
  formatProfileContextLine
} from "@/lib/profile/completion";
import { buildDemoAssessmentResponses } from "@/lib/scoring/demo-scenarios";
import {
  getUserDisplayName,
  profileNeedsCompletion
} from "@/lib/server/services/users";

type ReportPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    devPreview?: string;
  }>;
};

export async function generateStaticParams() {
  return assessments.map((assessment) => ({
    slug: assessment.slug
  }));
}

export default async function ReportPreviewPage({
  params,
  searchParams
}: ReportPreviewPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const assessmentDefinition = getAssessmentDefinitionBySlug(slug);
  const forceUnlockedPreview =
    process.env.NODE_ENV === "development" && resolvedSearchParams.devPreview === "1";
  const currentUser = forceUnlockedPreview ? null : await getCurrentUser();
  const persistentAccessState =
    currentUser && assessmentDefinition
      ? await resolvePersistentAccessStateForAssessment(currentUser.id, assessmentDefinition.slug)
      : null;
  const serverCanAccessFullReport =
    forceUnlockedPreview || persistentAccessState?.canAccessFullReport === true;

  if (
    assessmentDefinition &&
    currentUser &&
    serverCanAccessFullReport &&
    !forceUnlockedPreview &&
    !currentUser.profileCompleted
  ) {
    redirect(buildProfileCompletionUrl(`/reports/${assessmentDefinition.slug}`, true));
  }

  if (!assessmentDefinition) {
    return (
      <main>
        <SectionShell className="pt-10 sm:pt-14">
          <div className="text-center text-neutral-400">
            Report data is still loading. Please refresh.
          </div>
        </SectionShell>
      </main>
    );
  }

  const relatedAssessments = getAssessmentsBySlugs(
    assessments
      .map((assessment) => assessment.slug)
      .filter((assessmentSlug) => assessmentSlug !== assessmentDefinition.slug)
  );

  if (
    assessmentDefinition.buildStatus !== "deep_seeded" ||
    assessmentDefinition.questions.length === 0
  ) {
    return (
      <main>
        <SectionShell className="pb-8 pt-10 sm:pt-14">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">Report structure ready</Badge>
              <Badge variant="outline">{assessmentDefinition.reportLabel}</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="page-title max-w-4xl">
                {assessmentDefinition.reportBlueprint.title}
              </h1>
              <p className="body-md max-w-3xl">
                This report already has its premium section structure, preview
                boundary, and deeper interpretation plan, but it is still waiting on
                the full question set needed for a live saved report.
              </p>
            </div>
          </div>
        </SectionShell>

        <SectionShell className="pt-0">
          <ReportBlueprintPreview blueprint={assessmentDefinition.reportBlueprint} />
        </SectionShell>
      </main>
    );
  }

  const fallbackResponses = buildDemoAssessmentResponses(assessmentDefinition);
  const viewerProfile =
    currentUser && serverCanAccessFullReport
      ? {
          displayName: getUserDisplayName(currentUser),
          primaryConcern: currentUser.primaryConcern,
          contextLine: formatProfileContextLine(currentUser)
        }
      : null;

  return (
    <main>
      {!serverCanAccessFullReport ? (
        <SectionShell className="pb-2 pt-3 sm:pb-3 sm:pt-4 lg:pb-3 lg:pt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Premium report preview</Badge>
              <Badge variant="outline">{assessmentDefinition.reportLabel}</Badge>
            </div>
            <div className="space-y-2">
              <h1 className="page-title max-w-4xl">
                {assessmentDefinition.reportBlueprint.title}
              </h1>
              <p className="max-w-3xl text-[15px] leading-7 text-muted">
                Open the saved report, review the visible insight sections, and unlock or reopen the deeper document from the same page.
              </p>
            </div>
          </div>
        </SectionShell>
      ) : null}

      <SectionShell
        className={
          serverCanAccessFullReport
            ? "pb-2 pt-2 sm:pb-3 sm:pt-3 lg:pb-4 lg:pt-3"
            : "py-0 sm:py-0 lg:py-0"
        }
        contentClassName="max-w-[1480px] px-3 sm:px-5 lg:px-6 xl:px-7"
      >
        {assessmentDefinition ? (
          <ReportExperience
            assessment={assessmentDefinition}
            relatedAssessments={relatedAssessments}
            fallbackResponses={fallbackResponses}
            forceUnlocked={forceUnlockedPreview}
            serverCanAccessFullReport={serverCanAccessFullReport}
            viewerProfile={viewerProfile}
          />
        ) : (
          <div className="text-center text-neutral-400">
            Report data is still loading. Please refresh.
          </div>
        )}
      </SectionShell>

      {!assessmentDefinition.questions.length ? (
        <SectionShell className="pt-0">
          <ReportBlueprintPreview blueprint={assessmentDefinition.reportBlueprint} />
        </SectionShell>
      ) : null}
    </main>
  );
}
