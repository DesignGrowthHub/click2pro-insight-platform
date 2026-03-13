import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { AssessmentFlowShell } from "@/components/assessment-flow/assessment-flow-shell";
import { Container } from "@/components/ui/container";
import {
  assessmentDefinitions,
  getAssessmentDefinitionBySlug,
  getAssessmentsBySlugs
} from "@/lib/assessments";
import { getCurrentUser } from "@/lib/auth/session";
import { resolvePersistentAccessStateForAssessment } from "@/lib/commerce/server/access";
import { getPublishedAssessmentDefinitionBySlug, getPublishedAssessmentsBySlugs } from "@/lib/server/services/published-assessments";
import {
  buildAnonymousVisitorCookieValue,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { persistCompletedAssessment } from "@/lib/server/services/report-pipeline";
import { buildDemoAssessmentResponses } from "@/lib/scoring/demo-scenarios";
import type {
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type AssessmentTakePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    devPreview?: string;
  }>;
};

type DevPreviewState = {
  sessionId: string | null;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport;
};

export async function generateStaticParams() {
  return assessmentDefinitions.map((assessment) => ({
    slug: assessment.slug
  }));
}

export default async function AssessmentTakePage({
  params,
  searchParams
}: AssessmentTakePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const assessment =
    (await getPublishedAssessmentDefinitionBySlug(slug)) ??
    getAssessmentDefinitionBySlug(slug);

  if (!assessment) {
    notFound();
  }

  const seededRelatedSlugs = assessment.relatedAssessments
    .map((item) => item.slug)
    .filter((assessmentSlug) => assessmentSlug !== "membership" && assessmentSlug !== assessment.slug);
  const relatedAssessments = seededRelatedSlugs.length
    ? await getPublishedAssessmentsBySlugs(seededRelatedSlugs).then((items) => {
        const publishedBySlug = new Map(items.map((item) => [item.slug, item] as const));
        return seededRelatedSlugs
          .map((assessmentSlug) => publishedBySlug.get(assessmentSlug) ?? getAssessmentsBySlugs([assessmentSlug])[0])
          .filter((item): item is NonNullable<typeof item> => Boolean(item));
      })
    : getAssessmentsBySlugs(
        assessmentDefinitions
          .map((item) => item.slug)
          .filter((assessmentSlug) => assessmentSlug !== assessment.slug)
      );
  const currentUser = await getCurrentUser();
  const persistentAccessState = currentUser
    ? await resolvePersistentAccessStateForAssessment(currentUser.id, assessment.slug)
    : null;
  const serverCanAccessFullReport =
    persistentAccessState?.canAccessFullReport === true;
  let devPreviewState: DevPreviewState | null = null;

  if (
    process.env.NODE_ENV === "development" &&
    resolvedSearchParams.devPreview === "1"
  ) {
    const cookieStore = await cookies();
    const anonymousVisitorId =
      cookieStore.get(INSIGHT_ANONYMOUS_VISITOR_COOKIE)?.value ??
      buildAnonymousVisitorCookieValue();
    const demoAnswers = buildDemoAssessmentResponses(assessment);
    const savedOutcome = await persistCompletedAssessment({
      assessment,
      answers: demoAnswers,
      userId: currentUser?.id ?? null,
      anonymousVisitorId: currentUser ? null : anonymousVisitorId
    });

    devPreviewState = {
      sessionId: savedOutcome.sessionId,
      resultProfile: savedOutcome.resultProfile,
      premiumReport: savedOutcome.premiumReport
    };
  }

  return (
    <main className="assessment-session-page pb-10 pt-2 sm:pb-14 sm:pt-3">
      <Container className="assessment-session-layout">
        <div className="mx-auto max-w-[1040px]">
          <AssessmentFlowShell
            assessment={assessment}
            relatedAssessments={relatedAssessments}
            devPreviewState={devPreviewState}
            serverCanAccessFullReport={serverCanAccessFullReport}
          />
        </div>
      </Container>
    </main>
  );
}
