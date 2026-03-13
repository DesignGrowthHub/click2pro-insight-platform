"use client";

import { AssessmentCard } from "@/components/assessments/assessment-card";
import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Assessment as AssessmentSummary } from "@/lib/assessments";
import type { RelatedInsightDecision } from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

type RelatedInsightsPanelProps = {
  title: string;
  description: string;
  assessments: AssessmentSummary[];
  recommendations: RelatedInsightDecision[];
  membershipNote?: string;
  hasMembershipAccess?: boolean;
  limit?: number;
  tone?: "default" | "subdued";
};

function badgeLabel(recommendation: RelatedInsightDecision) {
  if (recommendation.matchStrength === "strong") {
    return "High-fit next insight";
  }

  if (recommendation.matchStrength === "supporting") {
    return "Connected next insight";
  }

  return "Relevant next insight";
}

export function RelatedInsightsPanel({
  title,
  description,
  assessments,
  recommendations,
  membershipNote,
  hasMembershipAccess = false,
  limit = 3,
  tone = "default"
}: RelatedInsightsPanelProps) {
  const { pricingLabels } = useCommerceRegion();
  const isSubdued = tone === "subdued";
  const visibleRecommendations = recommendations
    .filter((item) => item.slug !== "membership")
    .slice(0, limit);

  return (
    <Card variant={isSubdued ? "default" : "raised"}>
      <CardHeader className="space-y-4">
        <Badge variant="outline">Related insights</Badge>
        <CardTitle className={cn("text-[1.65rem]", isSubdued && "text-[1.45rem]")}>
          {title}
        </CardTitle>
        <p
          className={cn(
            "body-md max-w-3xl",
            isSubdued && "text-sm leading-7 sm:text-[0.98rem] sm:leading-8"
          )}
        >
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={cn(
            "grid gap-5",
            isSubdued ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {visibleRecommendations.map((recommendation) => {
            const relatedAssessment = assessments.find(
              (assessment) => assessment.slug === recommendation.slug
            );

            if (!relatedAssessment) {
              return null;
            }

            return (
              isSubdued ? (
                <div
                  key={recommendation.slug}
                  className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        recommendation.matchStrength === "strong" ? "accent" : "outline"
                      }
                    >
                      {badgeLabel(recommendation)}
                    </Badge>
                    {recommendation.clusterLabel ? (
                      <Badge variant="outline">{recommendation.clusterLabel}</Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-lg font-semibold text-foreground">
                      {relatedAssessment.title}
                    </p>
                    <p className="text-sm leading-7 text-muted">
                      {recommendation.reason}
                    </p>
                    {recommendation.whyNow ? (
                      <p className="text-sm leading-7 text-foreground/88">
                        {recommendation.whyNow}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {hasMembershipAccess
                        ? "Included in your membership"
                        : `Single insight report · ${pricingLabels.singleInsightReport}`}
                    </p>
                    <LinkButton
                      href={`/assessments/${relatedAssessment.slug}`}
                      size="sm"
                      variant="outline"
                    >
                      Open Assessment
                    </LinkButton>
                  </div>
                  {recommendation.historyNote ? (
                    <p className="mt-3 text-xs leading-6 text-muted">
                      {recommendation.historyNote}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div key={recommendation.slug} className="space-y-3">
                  <AssessmentCard assessment={relatedAssessment} />
                  <div className="surface-block px-4 py-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge
                        variant={
                          recommendation.matchStrength === "strong" ? "accent" : "outline"
                        }
                      >
                        {badgeLabel(recommendation)}
                      </Badge>
                      {recommendation.clusterLabel ? (
                        <Badge variant="outline">{recommendation.clusterLabel}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-7 text-muted">{recommendation.reason}</p>
                    {recommendation.whyNow ? (
                      <p className="mt-3 text-sm leading-7 text-foreground">
                        {recommendation.whyNow}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {hasMembershipAccess
                        ? "Included in your membership"
                        : `Explore this insight report (${pricingLabels.singleInsightReport})`}
                    </p>
                    {recommendation.historyNote ? (
                      <p className="mt-3 text-xs leading-6 text-muted">
                        {recommendation.historyNote}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            );
          })}
        </div>

        {membershipNote ? (
          <div className={cn(isSubdued ? "surface-block" : "surface-block-strong", "px-5 py-5")}>
            <p className="insight-label">
              {isSubdued ? "If you want broader access" : "Membership note"}
            </p>
            <p className="mt-3 text-base leading-8 text-foreground">{membershipNote}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
