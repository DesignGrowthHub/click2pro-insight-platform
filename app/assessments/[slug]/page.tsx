import { notFound } from "next/navigation";

import { AssessmentCard } from "@/components/assessments/assessment-card";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CtaBlock } from "@/components/ui/cta-block";
import { SectionShell } from "@/components/ui/section-shell";
import {
  assessments,
  getAssessmentBySlug,
  getAssessmentDefinitionBySlug,
  getAssessmentsBySlugs
} from "@/lib/assessments";
import { getPricingLabels } from "@/lib/pricing";
import { getServerCommerceRegionContext } from "@/lib/region/server";

type AssessmentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return assessments.map((assessment) => ({
    slug: assessment.slug
  }));
}

export default async function AssessmentDetailPage({
  params
}: AssessmentDetailPageProps) {
  const regionContext = await getServerCommerceRegionContext();
  const pricingLabels = getPricingLabels(regionContext.regionKey);
  const { slug } = await params;
  const assessment = getAssessmentBySlug(slug);
  const assessmentDefinition = getAssessmentDefinitionBySlug(slug);

  if (!assessment || !assessmentDefinition) {
    notFound();
  }

  const relatedAssessments = getAssessmentsBySlugs(assessment.recommendedSlugs);
  const clarifiesItems = [
    ...assessment.outcomes,
    ...assessment.focusPoints
  ].slice(0, 4);

  return (
    <main>
      <SectionShell className="pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">{assessment.category}</Badge>
              <Badge variant="outline">{assessment.timeEstimate}</Badge>
              <Badge variant="outline">{assessment.privacy}</Badge>
            </div>
            <div className="space-y-3.5">
              <h1 className="page-title max-w-4xl">{assessment.title}</h1>
              <p className="body-lg max-w-3xl">{assessment.descriptor}</p>
              <p className="body-sm max-w-2xl leading-7 text-muted">
                {assessment.targetPainPoint}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {assessmentDefinition.buildStatus === "deep_seeded" ? (
                <LinkButton
                  href={`/assessments/${assessment.slug}/take`}
                  size="xl"
                >
                  Begin Insight Assessment
                </LinkButton>
              ) : (
                <Button size="xl" disabled>
                  Assessment In Development
                </Button>
              )}
              <LinkButton
                href={`/reports/${assessment.slug}`}
                variant="outline"
                size="xl"
              >
                Review Report Preview
              </LinkButton>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted">
              A short private assessment first, then a preview. The deeper report
              only matters if the opening read already feels accurate.
            </p>
          </div>

          <Card variant="raised" className="h-full">
            <CardHeader className="space-y-4">
              <Badge variant="success">Before you begin</Badge>
              <CardTitle className="text-[1.55rem] sm:text-[1.7rem]">
                A fast, structured read on whether this pattern is really active.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-block px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Estimated time
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {assessment.timeEstimate}
                  </p>
                </div>
                <div className="surface-block px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Privacy
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {assessment.privacy}
                  </p>
                </div>
                <div className="surface-block px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Question count
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {assessment.questionCount}
                  </p>
                </div>
                <div className="surface-block px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Full report
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {pricingLabels.singleInsightReport}
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-primary/18 bg-primary/8 p-5">
                <p className="insight-label">What you get</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {assessment.reportLabel}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {assessmentDefinition.buildStatus === "deep_seeded"
                    ? "A guided question flow, an insight preview, and a deeper report path if the topic already feels relevant."
                    : "This topic already has the assessment framework and report structure in place, with the full question set still being completed."}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Full report available for {pricingLabels.singleInsightReport}. Premium report available for {pricingLabels.premiumDeepInsightReport}.
                  {regionContext.supportsPsychologistExplanation &&
                  pricingLabels.explanationThirtyMinutes &&
                  pricingLabels.explanationSixtyMinutes
                    ? ` Guided Psychologist Explanation Sessions are also available at ${pricingLabels.explanationThirtyMinutes} and ${pricingLabels.explanationSixtyMinutes}.`
                    : ""}
                </p>
              </div>
              <div className="space-y-2">
                <p className="insight-label">Best for</p>
                <p className="text-sm leading-7 text-muted">
                  People who already recognize the pattern, want a clearer read on
                  what may be repeating, and would rather start with one exact
                  assessment than browse broadly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="What this helps clarify"
        title="A more exact read on what may be happening underneath the surface."
        description="The page is meant to help you decide quickly whether this is the right assessment to start."
        variant="subtle"
      >
        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <Card variant="raised" className="panel-grid overflow-hidden">
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
              {clarifiesItems.map((item) => (
                <div
                  key={item}
                  className="surface-block px-4 py-4 text-sm leading-7 text-foreground/90"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="space-y-4">
              <Badge variant="outline">How to read it</Badge>
              <CardTitle className="text-[1.35rem] sm:text-[1.45rem]">
                Structured reflection first, deeper interpretation after that.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted">
                The assessment is designed to surface whether the pattern is really
                active, then turn that into a readable preview before the full
                report expands the interpretation.
              </p>
              <p className="text-sm leading-7 text-muted">
                {assessment.previewPromise}
              </p>
              <div className="surface-block px-4 py-4">
                <p className="insight-label">Scope</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  The report is for insight, pattern recognition, and reflection. It
                  does not act as a diagnosis or fixed verdict.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <CtaBlock
          eyebrow="Ready to start"
          title="If this is the pattern you want to understand, begin now."
          description="The assessment is short by design so you can move from uncertainty to a clearer read without a long lead-in."
          actions={
            <>
              {assessmentDefinition.buildStatus === "deep_seeded" ? (
                <LinkButton href={`/assessments/${assessment.slug}/take`} size="xl">
                  Begin Insight Assessment
                </LinkButton>
              ) : (
                <Button size="xl" disabled>
                  Assessment In Development
                </Button>
              )}
              <LinkButton href={`/reports/${assessment.slug}`} variant="outline" size="xl">
                Review Report Preview
              </LinkButton>
            </>
          }
          aside={
            assessmentDefinition.buildStatus === "deep_seeded"
              ? "Start with the assessment, review the preview, then go deeper only if it feels accurate enough to matter."
              : "The framework and report structure exist already. The full question flow is still being completed."
          }
        />
      </SectionShell>

      {relatedAssessments.length > 0 ? (
        <SectionShell
          eyebrow="Related topics"
          title="If another adjacent pattern feels closer, start there instead."
          description="These related assessments stay here as alternatives, not as competing next steps."
          variant="subtle"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {relatedAssessments.map((item) => (
              <AssessmentCard key={item.slug} assessment={item} />
            ))}
          </div>
        </SectionShell>
      ) : null}
    </main>
  );
}
