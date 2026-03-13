"use client";

import { ReactNode } from "react";

import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon, ReportIcon, ShieldIcon } from "@/components/ui/icons";
import type { AssessmentDefinition } from "@/lib/types/assessment-domain";

type AssessmentIntroPanelProps = {
  assessment: AssessmentDefinition;
  startHref?: string;
  ctaLabel?: string;
  action?: ReactNode;
};

export function AssessmentIntroPanel({
  assessment,
  startHref,
  ctaLabel = "Begin Insight Assessment",
  action
}: AssessmentIntroPanelProps) {
  const { pricingLabels, regionKey } = useCommerceRegion();
  const clarifiesItems = [
    ...assessment.outcomeHighlights,
    ...assessment.introBullets
  ].slice(0, 3);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
      <Card variant="raised" className="panel-grid overflow-hidden">
        <CardHeader className="space-y-3.5">
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">{assessment.category}</Badge>
            <Badge variant="outline">{assessment.estimatedTimeLabel}</Badge>
          </div>
          <div className="space-y-2.5">
            <CardTitle className="text-[1.95rem] leading-[1.02] sm:text-[2.45rem]">
              {assessment.title}
            </CardTitle>
            <p className="body-md reading-column-tight max-w-[40rem]">
              {assessment.subtitle}
            </p>
            <p className="max-w-[38rem] text-[0.97rem] leading-7 text-muted">
              {assessment.targetPainPoint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="report-paper p-5 sm:p-6">
            <p className="insight-label">Before you begin</p>
            <p className="mt-3 max-w-[38rem] text-[1rem] leading-8 text-foreground">
              A short guided read on whether this pattern is genuinely active,
              followed by a private preview before anything deeper opens.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {action ? (
                action
              ) : startHref ? (
                <LinkButton href={startHref} size="xl" className="w-full sm:w-auto">
                  {ctaLabel}
                </LinkButton>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="h-full">
          <CardHeader className="space-y-3.5">
            <Badge variant="outline">What to expect</Badge>
            <CardTitle className="text-[1.22rem] sm:text-[1.34rem]">
              Quick structure, clear privacy, and a preview-first path.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-block px-4 py-3.5">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ClockIcon className="h-4 w-4 text-primary" />
                  Estimated time
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.estimatedTimeLabel}
                </p>
              </div>
              <div className="surface-block px-4 py-3.5">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ReportIcon className="h-4 w-4 text-primary" />
                  Question count
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.questionCount} questions
                </p>
              </div>
              <div className="surface-block px-4 py-3.5">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ShieldIcon className="h-4 w-4 text-success" />
                  Privacy
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.privacyNote}
                </p>
              </div>
              <div className="surface-block px-4 py-3.5">
                <p className="insight-label">Flow</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  Preview first, deeper report optional
                </p>
              </div>
              <div className="surface-block px-4 py-3.5">
                <p className="insight-label">Questions</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.questionCount} prompts
                </p>
              </div>
            </div>

            <div className="surface-block px-5 py-5">
              <p className="insight-label">Full report</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Full report available for {pricingLabels.singleInsightReport}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">
                Premium Deep Insight Report available for {pricingLabels.premiumDeepInsightReport}.
                {regionKey === "india" &&
                pricingLabels.explanationThirtyMinutes &&
                pricingLabels.explanationSixtyMinutes
                  ? ` Guided Psychologist Explanation Sessions are also available at ${pricingLabels.explanationThirtyMinutes} and ${pricingLabels.explanationSixtyMinutes}.`
                  : ""}
              </p>
            </div>
            <div className="space-y-3">
              <p className="insight-label">What this helps clarify</p>
              <div className="grid gap-3">
                {clarifiesItems.map((item) => (
                  <div
                    key={item}
                    className="surface-block px-4 py-4 text-sm leading-7 text-foreground/90"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
