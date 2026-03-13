"use client";

import { ScoreOverview } from "@/components/results/score-overview";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseFlowShell } from "@/components/unlock/purchase-flow-shell";
import { getPreviewHeadline } from "@/lib/assessment-engine/flow";
import type { ReportUnlockOfferSuite } from "@/lib/offers/report-offers";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type LockedPreviewExperienceProps = {
  assessment: AssessmentDefinition;
  assessmentSessionId?: string | null;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport | null;
  offerSuite: ReportUnlockOfferSuite | null;
  accountUserId: string;
  hasHydrated?: boolean;
};

function buildCostNarrative(resultProfile: AssessmentResultProfile) {
  const friction = resultProfile.frictionAreas[0];
  const previewInsight = resultProfile.previewInsights[1] ?? resultProfile.previewInsights[0];

  return (
    friction?.description ??
    previewInsight?.body ??
    "When this pattern stays unclear, it usually keeps draining confidence, attention, or emotional steadiness in the situations that already feel most charged."
  );
}

function buildLockedThemes(report: PremiumReport | null) {
  if (!report) {
    return [
      "Emotional pressure points",
      "Response tendencies under strain",
      "What may be reinforcing the loop",
      "Stabilizing insight directions",
      "Private downloadable report"
    ];
  }

  return [
    ...report.lockedSections.slice(0, 4).map((section) => section.title),
    "Private downloadable report"
  ];
}

function buildCoherencePoints(resultProfile: AssessmentResultProfile) {
  const topDimensions = [...resultProfile.dimensionScores]
    .sort((left, right) => right.normalizedScore - left.normalizedScore)
    .slice(0, 3);

  return topDimensions.map((dimension, index) => {
    const xPositions = [28, 108, 188];
    const y = 112 - dimension.normalizedScore * 0.82;

    return {
      key: dimension.key,
      label: dimension.shortLabel,
      score: dimension.normalizedScore,
      x: xPositions[index] ?? 28 + index * 80,
      y
    };
  });
}

export function LockedPreviewExperience({
  assessment,
  assessmentSessionId = null,
  resultProfile,
  premiumReport,
  offerSuite,
  accountUserId,
  hasHydrated = true
}: LockedPreviewExperienceProps) {
  const previewHeadline = getPreviewHeadline(resultProfile);
  const costNarrative = buildCostNarrative(resultProfile);
  const lockedThemes = buildLockedThemes(premiumReport);
  const coherencePoints = buildCoherencePoints(resultProfile);
  const coherencePath = coherencePoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="mx-auto max-w-6xl space-y-6 preview-reveal">
      <Card variant="raised" className="panel-grid overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Private insight preview</Badge>
            <Badge variant="outline">{resultProfile.answeredCount} responses scored</Badge>
          </div>
          <CardTitle className="text-[2rem] leading-[1.08] sm:text-[2.35rem]">
            {previewHeadline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="report-paper p-6 sm:p-7">
            <p className="insight-label">Opening read</p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {resultProfile.summaryLabel}
            </p>
            <p className="mt-4 reading-column document-copy">
              {resultProfile.summaryNarrative}
            </p>
            <p className="mt-5 text-sm leading-7 text-muted">
              Pattern coherence detected across the strongest scored signals in your responses.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-6 text-muted">
                Single-report purchase. Private, saved to your account, and readable anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="#unlock-path" size="xl">
                Unlock Full Report
              </LinkButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <ScoreOverview resultProfile={resultProfile} variant="preview" />

        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <Badge variant="outline">Measured proof</Badge>
            <CardTitle className="text-[1.45rem]">
              The strongest signals are moving in the same direction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="surface-block-strong p-5 sm:p-6">
              <svg
                viewBox="0 0 216 120"
                className="h-[148px] w-full"
                aria-hidden="true"
              >
                <line x1="28" y1="108" x2="188" y2="108" stroke="rgba(255,255,255,0.08)" />
                <line x1="28" y1="76" x2="188" y2="76" stroke="rgba(255,255,255,0.06)" />
                <line x1="28" y1="44" x2="188" y2="44" stroke="rgba(255,255,255,0.04)" />
                <polyline
                  fill="none"
                  stroke="rgba(96,165,250,0.95)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={coherencePath}
                />
                {coherencePoints.map((point) => (
                  <g key={point.key}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="5.5"
                      fill="rgba(96,165,250,0.95)"
                    />
                    <text
                      x={point.x}
                      y="118"
                      textAnchor="middle"
                      fontSize="10"
                      fill="rgba(229,231,235,0.8)"
                    >
                      {point.label}
                    </text>
                  </g>
                ))}
              </svg>
              <p className="mt-4 text-sm leading-7 text-muted">
                This preview is not showing a single isolated score. It is showing a pattern that stays visible across multiple response dimensions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <Badge variant="outline">Why this may matter</Badge>
          <CardTitle className="text-[1.45rem]">
            What this pattern may already be costing you
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-sm leading-7 text-muted">{costNarrative}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <Badge variant="outline">What opens in the full report</Badge>
          <CardTitle className="text-[1.45rem]">
            The deeper report moves from recognition into interpretation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          {lockedThemes.map((item) => (
            <div
              key={item}
              className="surface-block px-4 py-4 sm:px-5 sm:py-5"
            >
              <p className="text-sm font-semibold leading-7 text-foreground">
                {item}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {premiumReport && offerSuite ? (
        <PurchaseFlowShell
          assessment={assessment}
          assessmentSessionId={assessmentSessionId}
          offerSuite={offerSuite}
          accountUserId={accountUserId}
          hasHydrated={hasHydrated}
          compact
        />
      ) : null}

      {offerSuite ? (
        <div className="pt-1">
          <p className="text-sm leading-7 text-muted">
            The deeper report stays private, saved to your account, and available to read again after purchase.
          </p>
        </div>
      ) : null}
    </div>
  );
}
