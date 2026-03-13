"use client";

import { RelatedInsightsPanel } from "@/components/recommendations/related-insights-panel";
import { LockedPreviewExperience } from "@/components/results/locked-preview-experience";
import { ScoreOverview } from "@/components/results/score-overview";
import { SubscriptionUpsell } from "@/components/results/subscription-upsell";
import { ReportSectionCard } from "@/components/reports/report-section-card";
import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnlockedReportState } from "@/components/unlock/unlocked-report-state";
import { getPreviewHeadline } from "@/lib/assessment-engine/flow";
import type { Assessment as AssessmentSummary } from "@/lib/assessments";
import { useOwnedLibrary } from "@/lib/commerce/use-owned-library";
import { getReportUnlockOfferSuite } from "@/lib/offers/report-offers";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type ResultPreviewShellProps = {
  assessment: AssessmentDefinition;
  assessmentSessionId?: string | null;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport | null;
  relatedAssessments: AssessmentSummary[];
  serverCanAccessFullReport?: boolean | null;
  onReviewAnswers: () => void;
};

function buildPreviewRecognition(resultProfile: AssessmentResultProfile) {
  const dominant = resultProfile.dominantTendencies[0];
  const friction = resultProfile.frictionAreas[0];
  const protective = resultProfile.protectiveTendencies[0];

  return [
    {
      id: "pattern-forming",
      label: "Pattern forming",
      title: dominant?.label ?? resultProfile.summaryLabel,
      body: dominant?.description ?? resultProfile.summaryDescriptor
    },
    {
      id: "pressure-underneath",
      label: "Pressure underneath",
      title: friction?.label ?? "Underlying strain is starting to organize",
      body:
        friction?.description ??
        "The fuller report looks more closely at what may be quietly intensifying underneath the visible pattern."
    },
    {
      id: "easier-to-miss",
      label: "What may be easier to miss",
      title: protective?.label ?? "A steadier signal may be quieter than the pressure",
      body: protective
        ? `A stabilizing counter-signal is still present: ${protective.description}`
        : "The fuller report also looks at what gets crowded out once the stronger pattern starts shaping attention."
    }
  ];
}

export function ResultPreviewShell({
  assessment,
  assessmentSessionId = null,
  resultProfile,
  premiumReport,
  relatedAssessments,
  serverCanAccessFullReport = null,
  onReviewAnswers
}: ResultPreviewShellProps) {
  const report = premiumReport;
  const { hasHydrated, library, accessState, ownedReport, dataSource, refreshLibrary } = useOwnedLibrary(
    assessment.slug
  );
  const { regionKey } = useCommerceRegion();
  const isUnlocked =
    typeof serverCanAccessFullReport === "boolean"
      ? serverCanAccessFullReport
      : (accessState?.canAccessFullReport ?? false);
  const recognitionCards = buildPreviewRecognition(resultProfile);
  const previewHeadline = getPreviewHeadline(resultProfile);
  const hasActiveMembership = library.subscriptions.some(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing"
  );
  const offerSuite =
    report
      ? getReportUnlockOfferSuite(assessment, resultProfile, report, regionKey)
      : null;

  return isUnlocked ? (
    <div className="space-y-5 preview-reveal">
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
        <div className="space-y-5">
          <Card variant="raised" className="panel-grid overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Private insight preview</Badge>
                <Badge variant="outline">{resultProfile.completionPercent}% complete</Badge>
                <Badge variant="accent">Full report unlocked</Badge>
              </div>
              <CardTitle className="text-[2rem] leading-[1.08] sm:text-[2.35rem]">
                {previewHeadline}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="report-paper p-5 sm:p-6">
                <p className="insight-label">Opening read</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {resultProfile.summaryLabel}
                </p>
                <p className="mt-4 reading-column document-copy">
                  {resultProfile.summaryNarrative}
                </p>
                <div className="subtle-divider mt-5" />
                <p className="mt-4 reading-column text-sm leading-7 text-muted">
                  {resultProfile.summaryDescriptor}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {recognitionCards.map((item) => (
                  <div key={item.id} className="surface-block px-4 py-4 sm:px-5 sm:py-5">
                    <p className="insight-label">{item.label}</p>
                    <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2.5 text-sm leading-7 text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ScoreOverview resultProfile={resultProfile} />
        </div>

        <Card variant="raised" className="panel-grid overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Full report access available</Badge>
              {accessState?.reasonLabel ? (
                <Badge variant="outline">{accessState.reasonLabel}</Badge>
              ) : null}
            </div>
            <CardTitle className="text-[1.65rem] leading-[1.08]">
              The full report is now open and saved to your account.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              You can move straight into the full report below. Download, email, and library controls stay available later without interrupting the reading flow.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href={`/reports/${assessment.slug}#full-report`} size="lg">
                Open Full Report
              </LinkButton>
              <LinkButton href="/dashboard" variant="outline" size="lg">
                View My Reports
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {report ? (
        <div id="full-report" className="space-y-4">
          <div className="space-y-2">
            <Badge variant="success">Report sections now visible</Badge>
            <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
              The full report now moves beyond recognition into interpretation, friction areas, and stabilizing guidance.
            </h2>
            <p className="body-md max-w-3xl">
              The preview established the pattern. The full report opens the deeper sections that explain what may be driving it, where it tends to show up, and what steadier next steps may help.
            </p>
          </div>
          <div className="grid gap-5">
            {report.sections.map((section, index) => (
              <ReportSectionCard
                key={section.id}
                section={section}
                unlocked
                index={index}
              />
            ))}
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="space-y-1.5">
            <p className="insight-label">Access is open</p>
            <p className="text-sm leading-7 text-foreground">
              Your full report stays in your account for later reading, download, and delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg" onClick={onReviewAnswers}>
              Review Answers
            </Button>
            <LinkButton href={`/reports/${assessment.slug}`} size="lg">
              Open Full Report
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      {ownedReport ? (
        <UnlockedReportState
          assessment={assessment}
          ownedReport={ownedReport}
          accountEmailLabel={library.account.accountEmail}
          persistenceMode={dataSource}
          onRefresh={refreshLibrary}
        />
      ) : (
        <Card variant="raised" className="panel-grid overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Full report access available</Badge>
              <Badge variant="outline">{accessState?.reasonLabel}</Badge>
            </div>
            <CardTitle className="text-[1.6rem]">
              This report is available through your account access, even though a dedicated saved entry is not visible yet.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              The full report is already open above. Once account saving finishes, the same access path will also show a dedicated saved report entry in your library.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/dashboard" size="lg">
                Open My Reports
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="lg">
                Compare Access Options
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <RelatedInsightsPanel
          title="Related insights you may want to explore next"
          description="These suggestions stay close to the pattern already showing up here."
          assessments={relatedAssessments}
          recommendations={resultProfile.relatedRecommendations}
          membershipNote="Broader access later keeps connected insights in one library instead of as separate purchases."
          hasMembershipAccess={hasActiveMembership}
          limit={2}
          tone="subdued"
        />
        <SubscriptionUpsell
          title={resultProfile.membershipUpsell.title}
          note={resultProfile.membershipUpsell.description}
          benefits={resultProfile.membershipUpsell.benefits}
          tone="subdued"
        />
      </div>
    </div>
  ) : (
    <LockedPreviewExperience
      assessment={assessment}
      assessmentSessionId={assessmentSessionId}
      resultProfile={resultProfile}
      premiumReport={report}
      offerSuite={offerSuite}
      accountUserId={library.account.userId}
      hasHydrated={hasHydrated}
    />
  );
}
