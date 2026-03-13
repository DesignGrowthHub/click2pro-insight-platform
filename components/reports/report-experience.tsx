"use client";

import { useEffect, useMemo, useState } from "react";

import { LockedPreviewExperience } from "@/components/results/locked-preview-experience";
import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { RelatedInsightsPanel } from "@/components/recommendations/related-insights-panel";
import { ScoreOverview } from "@/components/results/score-overview";
import { SubscriptionUpsell } from "@/components/results/subscription-upsell";
import { ReportSectionCard } from "@/components/reports/report-section-card";
import { ReportSummaryHeader } from "@/components/reports/report-summary-header";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwnedLibrary } from "@/lib/commerce/use-owned-library";
import { UnlockedReportState } from "@/components/unlock/unlocked-report-state";
import { loadAssessmentSession } from "@/lib/reports/report-session";
import {
  parseAssessmentResultProfile,
  parsePremiumReport
} from "@/lib/reports/report-integrity";
import type { Assessment as AssessmentSummary } from "@/lib/assessments";
import { getReportUnlockOfferSuite } from "@/lib/offers/report-offers";
import type { AssessmentResponseMap } from "@/lib/scoring/assessment-scoring";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type ReportExperienceProps = {
  assessment: AssessmentDefinition;
  relatedAssessments: AssessmentSummary[];
  fallbackResponses: AssessmentResponseMap;
  forceUnlocked?: boolean;
  serverCanAccessFullReport?: boolean | null;
  viewerProfile?: {
    displayName: string;
    primaryConcern: string | null;
    contextLine: string;
  } | null;
};

type PersistedReportExperienceResponse =
  | {
      source: "saved_session";
      sessionId: string;
      resultProfile: AssessmentResultProfile;
      premiumReport: PremiumReport;
    }
  | {
      source: "saved_report";
      reportId: string;
      sessionId: string | null;
      generationStatus:
        | "pending"
        | "generating"
        | "completed"
        | "failed"
        | "requires_retry";
      failureReason: string | null;
      generatedAt: string | null;
      resultProfile: AssessmentResultProfile | null;
      premiumReport: PremiumReport | null;
    };

type FallbackOutcome = {
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport;
};

function getChapterAnchor(sectionId: string, index: number) {
  switch (sectionId) {
    case "pattern-summary":
      return "core-pattern";
    case "what-responses-suggest":
      return "pattern-interpretation";
    case "emotional-drivers":
      return "pressure-points";
    case "daily-life-impact":
      return "performance-tendencies";
    case "blind-spots-or-tension-areas":
      return "hidden-friction";
    case "stability-suggestions":
      return "stabilizing-direction";
    default:
      return `chapter-${index + 1}`;
  }
}

function buildExecutiveSummaryCards(report: PremiumReport) {
  const summaryItems = [
    report.previewInsights[0]?.body ?? null,
    report.frictionAreas[0]?.description ?? null,
    report.protectiveTendencies[0]?.description ?? null
  ].filter(Boolean) as string[];

  return summaryItems.slice(0, 3);
}

function buildExecutiveInsightParagraphs(report: PremiumReport) {
  const paragraphs = [
    report.summaryNarrative,
    report.patternClusters[0]?.description ?? null,
    report.frictionAreas[0]?.description ?? null
  ].filter(Boolean) as string[];

  return paragraphs.slice(0, 3);
}

function buildReportChapters(report: PremiumReport) {
  return report.sections.slice(0, 5).map((section, index) => ({
    section,
    anchor: getChapterAnchor(section.id, index),
    label: section.title
  }));
}

function buildPatternCycle(assessmentSlug: string) {
  if (assessmentSlug === "imposter-syndrome-deep-report") {
    return ["Exposure", "Pressure", "Overprepare", "Relief", "Doubt returns"];
  }

  if (assessmentSlug === "relationship-infatuation-obsession-analysis") {
    return ["Signal", "Attachment", "Overfocus", "Relief", "Return"];
  }

  return ["Trigger", "Pressure", "Compensate", "Relief", "Pattern returns"];
}

function buildBehavioralTranslation(report: PremiumReport) {
  const collected = report.sections
    .flatMap((section) =>
      section.blocks
        .filter((block) => block.type === "bullet_list")
        .flatMap((block) => block.items ?? [])
    )
    .filter(Boolean);

  const uniqueItems = collected.filter(
    (item, index, array) => array.indexOf(item) === index
  );

  if (uniqueItems.length > 0) {
    return uniqueItems.slice(0, 4);
  }

  return report.previewInsights.slice(0, 4).map((item) => item.body);
}

function buildReflectionPrompt(resultProfile: AssessmentResultProfile) {
  const topSignal = resultProfile.dimensionScores
    .slice()
    .sort((left, right) => right.normalizedScore - left.normalizedScore)[0];

  return topSignal
    ? `When does ${topSignal.label.toLowerCase()} become loudest for you, and what usually happens right before you start compensating for it?`
    : "When does this pattern become most visible, and what usually happens right before it takes over your attention?";
}

function buildWhyItCosts(report: PremiumReport) {
  return (
    report.frictionAreas[0]?.description ??
    report.previewInsights[1]?.body ??
    "When the pattern stays unclear, it can keep shaping decisions, pressure, and self-reading without giving you a stable explanation for why it keeps repeating."
  );
}

function buildBehavioralTranslationIntro(report: PremiumReport) {
  return (
    report.dominantTendencies[0]?.description ??
    report.previewInsights[0]?.body ??
    "These patterns usually show up as recurring small reactions, private adjustments, and repeated compensating moves in everyday situations."
  );
}

export function ReportExperience({
  assessment,
  relatedAssessments,
  fallbackResponses,
  forceUnlocked = false,
  serverCanAccessFullReport = null,
  viewerProfile = null
}: ReportExperienceProps) {
  const [responses, setResponses] = useState<AssessmentResponseMap>(fallbackResponses);
  const [liveSession, setLiveSession] = useState(false);
  const [persistedExperience, setPersistedExperience] =
    useState<PersistedReportExperienceResponse | null>(null);
  const [persistedExperienceReady, setPersistedExperienceReady] = useState(false);
  const [fallbackOutcome, setFallbackOutcome] = useState<FallbackOutcome | null>(null);
  const [fallbackOutcomeReady, setFallbackOutcomeReady] = useState(false);
  const {
    hasHydrated,
    dataSource,
    library,
    accessState,
    ownedReport,
    refreshLibrary
  } = useOwnedLibrary(
    assessment.slug
  );
  const { regionKey } = useCommerceRegion();
  const persistedResultProfile = useMemo(
    () => parseAssessmentResultProfile(persistedExperience?.resultProfile),
    [persistedExperience?.resultProfile]
  );
  const persistedPremiumReport = useMemo(
    () => parsePremiumReport(persistedExperience?.premiumReport),
    [persistedExperience?.premiumReport]
  );
  const hasSavedReportRecord = persistedExperience?.source === "saved_report";
  const resultProfile = persistedExperience
    ? persistedResultProfile
    : fallbackOutcome?.resultProfile ?? null;
  const premiumReport = persistedExperience
    ? persistedPremiumReport
    : fallbackOutcome?.premiumReport ?? null;
  const isUnlocked =
    forceUnlocked ||
    (typeof serverCanAccessFullReport === "boolean"
      ? serverCanAccessFullReport
      : (accessState?.canAccessFullReport ?? false));
  const hasActiveMembership = library.subscriptions.some(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing"
  );
  const executiveSummaryCards = premiumReport
    ? buildExecutiveSummaryCards(premiumReport)
    : [];
  const executiveInsightParagraphs = premiumReport
    ? buildExecutiveInsightParagraphs(premiumReport)
    : [];
  const reportChapters = premiumReport ? buildReportChapters(premiumReport) : [];
  const patternCycle = buildPatternCycle(assessment.slug);
  const behavioralTranslation = premiumReport
    ? buildBehavioralTranslation(premiumReport)
    : [];
  const reflectionPrompt = resultProfile
    ? buildReflectionPrompt(resultProfile)
    : "";
  const publishedReportContext = assessment.reportBlueprint.publishedContext ?? null;
  const reflectionActionFraming =
    publishedReportContext?.reflectionActionFraming ??
    "One question to keep beside the report";
  const relatedInsightsFraming =
    publishedReportContext?.relatedInsightsLogic ??
    "These suggestions stay anchored to the same scored pattern and are best read as follow-on context rather than required next steps.";
  const reportGeneratedAt =
    persistedExperience?.source === "saved_report"
      ? persistedExperience.generatedAt
      : ownedReport?.generatedAt ?? null;
  const offerSuite =
    resultProfile && premiumReport
      ? getReportUnlockOfferSuite(assessment, resultProfile, premiumReport, regionKey)
      : null;

  useEffect(() => {
    const storedSession = loadAssessmentSession(assessment.slug);

    if (!storedSession || Object.keys(storedSession.responses).length === 0) {
      return;
    }

    setResponses(storedSession.responses);
    setLiveSession(true);
  }, [assessment.slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadPersistedExperience() {
      try {
        const response = await fetch(`/api/reports/${assessment.slug}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("No persisted report context is available yet.");
        }

        const payload = (await response.json()) as PersistedReportExperienceResponse;

        if (cancelled) {
          return;
        }

        setPersistedExperience(payload);
        setLiveSession(true);
      } catch {
        if (!cancelled) {
          setPersistedExperience(null);
        }
      } finally {
        if (!cancelled) {
          setPersistedExperienceReady(true);
        }
      }
    }

    void loadPersistedExperience();

    return () => {
      cancelled = true;
    };
  }, [assessment.slug, dataSource]);

  useEffect(() => {
    let cancelled = false;

    async function loadFallbackOutcome() {
      if (!persistedExperienceReady && dataSource === "database") {
        setFallbackOutcomeReady(false);
        return;
      }

      if (persistedExperience && persistedResultProfile && persistedPremiumReport) {
        setFallbackOutcome(null);
        setFallbackOutcomeReady(true);
        return;
      }

      if (persistedExperience?.source === "saved_report") {
        setFallbackOutcome(null);
        setFallbackOutcomeReady(true);
        return;
      }

      try {
        const { generateAssessmentOutcome } = await import(
          "@/lib/results/assessment-outcome"
        );
        const outcome = generateAssessmentOutcome(assessment, responses);

        if (!cancelled) {
          setFallbackOutcome(outcome);
        }
      } catch {
        if (!cancelled) {
          setFallbackOutcome(null);
        }
      } finally {
        if (!cancelled) {
        setFallbackOutcomeReady(true);
      }
    }
    }

    void loadFallbackOutcome();

    return () => {
      cancelled = true;
    };
  }, [
    assessment,
    dataSource,
    persistedExperience,
    persistedExperienceReady,
    persistedPremiumReport,
    persistedResultProfile,
    responses
  ]);

  useEffect(() => {
    if (
      persistedExperience?.source !== "saved_report" ||
      (persistedExperience.generationStatus !== "pending" &&
        persistedExperience.generationStatus !== "generating")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/reports/${assessment.slug}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as PersistedReportExperienceResponse;
        setPersistedExperience(payload);
      } catch {
        // Keep the current saved report state visible if background refresh fails.
      }
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [assessment.slug, persistedExperience]);

  const reportGenerationStatus =
    persistedExperience?.source === "saved_report"
      ? persistedExperience.generationStatus
      : ownedReport?.generationStatus ?? null;
  const activeAssessmentSessionId = persistedExperience?.sessionId ?? null;

  if (!persistedExperienceReady && dataSource === "database") {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <Badge variant="accent">Loading saved report</Badge>
          <CardTitle className="text-[1.8rem]">
            Loading the saved report or latest completed assessment for this topic.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            This page checks your saved account record first, so owned access and
            earlier completions can reopen cleanly before any local fallback is used.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!persistedExperience && !fallbackOutcomeReady) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <Badge variant="accent">Loading report</Badge>
          <CardTitle className="text-[1.8rem]">
            Preparing the saved report view for this assessment.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            The report is checking for saved access first and then loading the
            best available report context for this topic.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!resultProfile || !premiumReport || !offerSuite) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                reportGenerationStatus === "failed" ||
                reportGenerationStatus === "requires_retry"
                  ? "outline"
                  : "accent"
              }
            >
              {reportGenerationStatus === "failed" ||
              reportGenerationStatus === "requires_retry"
                ? "Report needs retry"
                : "Report is generating"}
            </Badge>
            <Badge variant="outline">{assessment.reportLabel}</Badge>
          </div>
          <CardTitle className="text-[1.8rem]">
            {reportGenerationStatus === "failed" ||
            reportGenerationStatus === "requires_retry"
              ? "The saved report is attached to your account, but the premium generation step needs another pass."
              : "The saved report is attached to your account and is still being prepared."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="body-sm">
            {persistedExperience?.source === "saved_report" &&
            persistedExperience.failureReason
              ? persistedExperience.failureReason
              : hasSavedReportRecord
                ? "Your purchased report record is attached to this account, but the full report payload is still being prepared. Please refresh in a moment."
                : !fallbackOutcome
                ? "Report data is still loading. Please refresh and try again."
                : "The scored report foundation has already been saved. The deeper written interpretation is still being prepared before the full report document opens here."}
          </p>
          <div className="flex flex-wrap gap-4">
            <LinkButton href="/dashboard" size="xl">
              Open My Insight Library
            </LinkButton>
            <LinkButton href={`/assessments/${assessment.slug}`} variant="outline" size="xl">
              Return To Assessment
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[1460px] space-y-10 overflow-x-hidden">
      {isUnlocked ? (
        <div className="xl:grid xl:grid-cols-[152px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3.5 py-4">
                <p className="insight-label">Report index</p>
                <div className="mt-3.5 space-y-1.5">
                  {[
                    { href: "#summary", label: "Summary" },
                    ...reportChapters.map((chapter) => ({
                      href: `#${chapter.anchor}`,
                      label: chapter.label
                    })),
                    { href: "#actions", label: "Actions" },
                    { href: "#related-insights", label: "Related Insights" },
                    { href: "#membership", label: "Guided Explanation" }
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-[14px] px-2.5 py-1.5 text-sm leading-6 text-muted transition hover:bg-white/[0.04] hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            <section id="summary" className="space-y-6">
              <ReportSummaryHeader
                report={premiumReport}
                assessmentTitle={assessment.title}
                liveSession={liveSession}
                isUnlocked={isUnlocked}
                generatedAt={reportGeneratedAt}
                viewerProfile={viewerProfile}
              />

              <div className="grid gap-7 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:items-start">
                <section className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/90">
                      Executive insight
                    </p>
                    <p className="text-[1.55rem] font-semibold leading-[1.3] tracking-[-0.03em] text-foreground sm:text-[1.85rem]">
                      {premiumReport.summaryLabel}
                    </p>
                    <div className="space-y-[14px] reading-column">
                      {executiveInsightParagraphs.map((paragraph, index) => (
                        <p
                          key={`${paragraph}-${index}`}
                          className="max-w-[68ch] text-[16px] leading-[1.78] text-foreground/93"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {executiveSummaryCards.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="surface-block min-h-[116px] px-5 py-5"
                      >
                        <p className="insight-label">{`Insight ${index + 1}`}</p>
                        <p className="mt-3 text-[15px] leading-[1.65] text-foreground/92">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="space-y-5">
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-3 pb-4">
                      <Badge variant="outline">Pattern loop</Badge>
                      <CardTitle className="text-[1.42rem]">
                        How this pattern usually sustains itself
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {patternCycle.map((step, index) => (
                          <div
                            key={step}
                            className="flex min-h-[106px] flex-col justify-center rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4 text-center"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                              {String(index + 1).padStart(2, "0")}
                            </p>
                            <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-foreground">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm leading-7 text-muted">
                        The report chapters below trace where this loop gathers force, how it shows up in real situations, and what tends to keep it stable.
                      </p>
                    </CardContent>
                  </Card>

                  <ScoreOverview resultProfile={resultProfile} />
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)]">
                <Card className="overflow-hidden">
                  <CardHeader className="space-y-3 pb-4">
                    <Badge variant="outline">Behavioral translation</Badge>
                    <CardTitle className="text-[1.42rem]">
                      How the pattern usually shows up in everyday life
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-7 text-foreground/72">
                      {buildBehavioralTranslationIntro(premiumReport)}
                    </p>
                    <div className="grid gap-[18px] md:grid-cols-2">
                      {behavioralTranslation.map((item) => (
                        <div
                          key={item}
                          className="min-h-[120px] rounded-[18px] border border-white/8 bg-white/[0.03] px-[22px] py-5 text-[15px] leading-[1.65] text-foreground/92"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-5">
                  <div className="space-y-3 rounded-[24px] border border-white/8 bg-white/[0.02] px-5 py-5 sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/90">
                      What this may be costing
                    </p>
                    <h3 className="text-[1.18rem] font-semibold leading-7 text-foreground">
                      Where the pattern quietly drains confidence
                    </h3>
                    <p className="text-[15px] leading-[1.8] text-foreground/78">
                      {buildWhyItCosts(premiumReport)}
                    </p>
                  </div>
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-3 pb-4">
                      <Badge variant="outline">Reflection prompt</Badge>
                      <CardTitle className="text-[1.38rem]">
                        {reflectionActionFraming}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-8 text-foreground/92">
                        {reflectionPrompt}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section id="full-report" className="space-y-6 border-t border-white/8 pt-8">
              <div className="space-y-2">
                <Badge variant="success">Report chapters</Badge>
                <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
                  Five chapters explain the pattern from mechanism to steadier direction.
                </h2>
                <p className="max-w-4xl text-[15px] leading-7 text-foreground/72">
                  The reading path below moves from the core pattern into the points of pressure around it, the response style it creates, what may keep it repeating, and the calmer signals worth noticing.
                </p>
              </div>

              <div className="space-y-10">
                {reportChapters.map(({ section, anchor, label }, index) => (
                  <section key={section.id} id={anchor} className="scroll-mt-24">
                    <ReportSectionCard
                      section={section}
                      unlocked
                      index={index}
                      chapterLabel={label}
                    />
                  </section>
                ))}
              </div>
            </section>

            {isUnlocked && ownedReport ? (
              <section id="actions" className="scroll-mt-24 space-y-4 border-t border-white/8 pt-10">
                <div className="space-y-2">
                  <Badge variant="outline">Actions</Badge>
                  <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-foreground">
                    Keep the report accessible wherever you want to revisit it.
                  </h2>
                </div>
                <UnlockedReportState
                  assessment={assessment}
                  ownedReport={ownedReport}
                  accountEmailLabel={library.account.accountEmail}
                  premiumReport={premiumReport}
                  persistenceMode={dataSource}
                  onRefresh={refreshLibrary}
                  showPrimaryReportLink={false}
                />
              </section>
            ) : null}

            <section className="space-y-5 border-t border-white/8 pt-10">
              <div className="space-y-2">
                <Badge variant="outline">After this report</Badge>
                <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-foreground">
                  Continue only if the main report already feels clear and complete.
                </h2>
              </div>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                <section id="related-insights" className="scroll-mt-24">
                  <RelatedInsightsPanel
                    title="If this report feels accurate, these are the next connected patterns worth understanding."
                    description={relatedInsightsFraming}
                    assessments={relatedAssessments}
                    recommendations={premiumReport.relatedRecommendations}
                    membershipNote="If several connected themes matter, membership keeps them in one private library instead of splitting them into isolated purchases."
                    hasMembershipAccess={hasActiveMembership}
                    tone="subdued"
                  />
                </section>

                <section id="membership" className="scroll-mt-24">
                  <SubscriptionUpsell
                    title={premiumReport.membershipUpsell.title}
                    note={premiumReport.membershipUpsell.description}
                    benefits={premiumReport.membershipUpsell.benefits}
                    tone="subdued"
                  />
                </section>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <LockedPreviewExperience
          assessment={assessment}
          assessmentSessionId={activeAssessmentSessionId}
          resultProfile={resultProfile}
          premiumReport={premiumReport}
          offerSuite={offerSuite}
          accountUserId={library.account.userId}
          hasHydrated={hasHydrated}
        />
      )}
    </div>
  );
}
