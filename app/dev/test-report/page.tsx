import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DevTestReportPreview } from "@/components/dev/dev-test-report-preview";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { getAssessmentDefinitionBySlug, getAssessmentsBySlugs } from "@/lib/assessments";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildAnonymousVisitorCookieValue,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { persistCompletedAssessment } from "@/lib/server/services/report-pipeline";
import { buildDemoAssessmentResponses } from "@/lib/scoring/demo-scenarios";

const DEFAULT_TEST_ASSESSMENT_SLUG = "imposter-syndrome-deep-report";

type DevTestReportPageProps = {
  searchParams?: Promise<{
    slug?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DevTestReportPage({
  searchParams
}: DevTestReportPageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const params = (await searchParams) ?? {};
  const requestedSlug = params.slug ?? DEFAULT_TEST_ASSESSMENT_SLUG;
  const assessment =
    getAssessmentDefinitionBySlug(requestedSlug) ??
    getAssessmentDefinitionBySlug(DEFAULT_TEST_ASSESSMENT_SLUG);

  if (!assessment) {
    notFound();
  }

  const currentUser = await getCurrentUser();
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

  const relatedAssessments = getAssessmentsBySlugs(assessment.relatedAssessments.map((item) => item.slug));

  return (
    <main className="pb-14 pt-6 sm:pb-18 sm:pt-8">
      <Container className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Development only</Badge>
            <Badge variant="outline">Simulated completed result</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-muted">
            This route creates a completed demo session for preview and checkout testing.
            Sign in if you want checkout, ownership, and saved report logic to use your real account.
          </p>
        </div>

        <DevTestReportPreview
          assessment={assessment}
          assessmentSessionId={savedOutcome.sessionId}
          resultProfile={savedOutcome.resultProfile}
          premiumReport={savedOutcome.premiumReport}
          relatedAssessments={relatedAssessments}
        />
      </Container>
    </main>
  );
}
