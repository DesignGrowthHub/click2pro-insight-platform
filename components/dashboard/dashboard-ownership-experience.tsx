"use client";

import { MembershipSummary } from "@/components/dashboard/membership-summary";
import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { OwnedBundleCard } from "@/components/dashboard/owned-bundle-card";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { RelatedInsightsPanel } from "@/components/recommendations/related-insights-panel";
import { ReportLibraryCard } from "@/components/reports/report-library-card";
import {
  ReportLibraryEmptyState,
  ReportLibraryLoadingState
} from "@/components/reports/report-library-states";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CtaBlock } from "@/components/ui/cta-block";
import { ChartIcon, ReportIcon, SubscriptionIcon } from "@/components/ui/icons";
import { SectionShell } from "@/components/ui/section-shell";
import type { Assessment } from "@/lib/assessments";
import { getAssessmentsBySlugs } from "@/lib/assessments";
import { toLegacySubscription } from "@/lib/commerce/seeded-state";
import { useOwnedLibrary } from "@/lib/commerce/use-owned-library";
import { buildMembershipRecommendations } from "@/lib/membership/recommendations";
import { buildProfileCompletionUrl } from "@/lib/profile/completion";
import type { SafeUser } from "@/lib/server/services/users";

type DashboardOwnershipExperienceProps = {
  currentUser: SafeUser;
  recommendedInsights: Assessment[];
  membershipBenefits: string[];
};

function formatNullableDate(date: string | null) {
  if (!date) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function getDashboardDisplayName(user: Pick<SafeUser, "preferredName" | "fullName" | "email">) {
  return user.preferredName?.trim() || user.fullName?.trim() || user.email;
}

export function DashboardOwnershipExperience({
  currentUser,
  recommendedInsights,
  membershipBenefits
}: DashboardOwnershipExperienceProps) {
  const { membershipContent, pricingLabels, regionConfig } = useCommerceRegion();
  const { library, hasHydrated, dataSource, refreshLibrary } = useOwnedLibrary();
  const membershipNarrative = membershipContent.membershipNarrative;
  const primarySubscription = library.subscriptions[0] ?? null;
  const readyReports = library.ownedReports.filter(
    (report) => report.generationStatus === "ready"
  );
  const generatingReports = library.ownedReports.filter(
    (report) =>
      report.generationStatus === "pending" ||
      report.generationStatus === "generating"
  );
  const failedReports = library.ownedReports.filter(
    (report) =>
      report.generationStatus === "failed" ||
      report.generationStatus === "requires_retry"
  );
  const hasActiveMembership = Boolean(
    primarySubscription &&
      (primarySubscription.status === "active" || primarySubscription.status === "trialing")
  );
  const unlockedAssessments = primarySubscription
    ? getAssessmentsBySlugs(primarySubscription.unlockedAssessmentSlugs)
    : [];
  const membershipRecommendations = buildMembershipRecommendations(library);
  const suggestedAssessments =
    membershipRecommendations.nextInsights.length > 0
      ? membershipRecommendations.nextInsights
      : recommendedInsights;
  const suggestedDecisions =
    membershipRecommendations.insightDecisions.length > 0
      ? membershipRecommendations.insightDecisions
      : suggestedAssessments.slice(0, 3).map((assessment) => ({
          slug: assessment.slug,
          recommendationType: "adjacent" as const,
          reason:
            "Suggested because it is the next closest pattern not yet present in the current library.",
          matchStrength: "supporting" as const
        }));
  const profilePromptUrl = buildProfileCompletionUrl("/dashboard", true);
  const displayName = getDashboardDisplayName(currentUser);
  const profileStatusLabel = currentUser.profileCompleted
    ? "Completed"
    : currentUser.profileSkippedAt
      ? "Skipped for now"
      : "Not completed";

  return (
    <>
      <SectionShell className="pb-6 pt-10 sm:pt-14">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="space-y-4">
            <Badge variant="accent">Dashboard</Badge>
            <div className="space-y-3">
              <h1 className="page-title max-w-4xl">
                {currentUser.profileCompleted
                  ? `Your reports and account access, ${displayName}.`
                  : "Your reports and account access."}
              </h1>
              <p className="body-md reading-column-tight max-w-3xl">
                Open saved reports, check delivery status, and return to the next relevant topic without working through another long landing page.
              </p>
            </div>
          </div>
          <Card variant="raised" className="h-full">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">Account snapshot</Badge>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
                  <ReportIcon className="h-5 w-5" />
                </span>
              </div>
              <CardTitle className="text-[1.45rem]">
                Everything important stays in one place.
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="metric-tile">
              <p className="insight-label">Owned reports</p>
              <p className="mt-2 text-[1.6rem] font-semibold text-foreground">
                {library.ownedReports.length}
              </p>
            </div>
            <div className="metric-tile">
              <p className="insight-label">Purchased bundles</p>
              <p className="mt-2 text-[1.6rem] font-semibold text-foreground">
                {library.ownedBundles.length}
              </p>
            </div>
            <div className="metric-tile">
              <p className="insight-label">Account email</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {library.account.accountEmail}
              </p>
            </div>
            <div className="metric-tile">
              <p className="insight-label">Membership</p>
              <p className="mt-2 text-base font-semibold capitalize text-foreground">
                {primarySubscription?.status ?? "inactive"}
                </p>
              </div>
              <div className="metric-tile sm:col-span-2">
                <p className="insight-label">Profile</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-semibold text-foreground">
                    {profileStatusLabel}
                  </p>
                  {!currentUser.profileCompleted ? (
                    <LinkButton href={profilePromptUrl} variant="outline" size="sm">
                      Complete profile
                    </LinkButton>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {currentUser.primaryConcern
                    ? `Primary concern saved: ${currentUser.primaryConcern}`
                    : "Add your main concern and context to make saved reports and future recommendations feel more personal."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="My Reports"
        title="Your report library"
        description="Open the report you need, download it, or send it again."
        variant="panel"
      >
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="metric-tile">
            <p className="insight-label">Ready now</p>
            <p className="mt-2 text-[1.4rem] font-semibold text-foreground">
              {readyReports.length}
            </p>
          </div>
          <div className="metric-tile">
            <p className="insight-label">Generating</p>
            <p className="mt-2 text-[1.4rem] font-semibold text-foreground">
              {generatingReports.length}
            </p>
          </div>
          <div className="metric-tile">
            <p className="insight-label">Needs retry</p>
            <p className="mt-2 text-[1.4rem] font-semibold text-foreground">
              {failedReports.length}
            </p>
          </div>
        </div>
        <div className="grid gap-5">
          {library.ownedReports.map((report) => (
            <ReportLibraryCard
              key={report.id}
              report={report}
              accountEmail={library.account.accountEmail}
              hasActiveMembership={hasActiveMembership}
              persistenceMode={dataSource}
              onRefresh={refreshLibrary}
            />
          ))}
        </div>

        {library.ownedReports.length === 0 || !hasHydrated ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {library.ownedReports.length === 0 ? (
              <ReportLibraryEmptyState
                title="No owned reports yet"
                description="This empty state remains useful for first-time users before their first completed checkout attaches an owned report to the account."
              />
            ) : null}
            {!hasHydrated ? (
              <ReportLibraryLoadingState
                title="Syncing ownership state"
                description="Use this while saved ownership data is hydrating from the backend report library."
              />
            ) : null}
          </div>
        ) : null}
      </SectionShell>

      <SectionShell
        eyebrow="Purchased Bundles"
        title="Bundles"
        description="Related access stays grouped here."
        variant="subtle"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {library.ownedBundles.map((bundle) => (
            <OwnedBundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </SectionShell>

      {library.explanationEntitlements.length > 0 ? (
        <SectionShell
          eyebrow="Guided Report Walkthroughs"
          title="Saved explanation sessions"
          description="Walkthrough access stays attached to the same account."
          variant="subtle"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {library.explanationEntitlements.map((entitlement) => (
              <Card key={entitlement.id} className="h-full">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{entitlement.durationMinutes} min</Badge>
                    <Badge
                      variant={
                        ["completed", "scheduled"].includes(entitlement.status)
                          ? "success"
                          : entitlement.status === "contacted"
                            ? "accent"
                            : "outline"
                      }
                    >
                      {entitlement.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-[1.25rem]">{entitlement.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-7 text-muted">
                    Structured discussion of your report.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="metric-tile">
                      <p className="insight-label">Granted</p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {formatNullableDate(entitlement.grantedAt)}
                      </p>
                    </div>
                    <div className="metric-tile">
                      <p className="insight-label">Scheduled</p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {formatNullableDate(entitlement.scheduledFor)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted">
                    Related report: {entitlement.assessmentSlug ? entitlement.assessmentSlug : "Will be linked during follow-up."}
                  </p>
                  {entitlement.assessmentSlug ? (
                    <LinkButton href={`/reports/${entitlement.assessmentSlug}`} variant="outline" size="lg">
                      Open Related Report
                    </LinkButton>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell
        eyebrow={regionConfig.supportsMembership ? "Membership" : "Access and guided explanation"}
        title={
          regionConfig.supportsMembership
            ? "Membership and ongoing access"
            : "Access and guided explanation"
        }
        description={
          regionConfig.supportsMembership
            ? "Use membership when more than one topic matters."
            : "Report access stays primary. Guided explanation stays optional."
        }
        variant="panel"
      >
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">Access options</Badge>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
                    <SubscriptionIcon className="h-5 w-5" />
                  </span>
                </div>
                <CardTitle className="text-[1.4rem]">
                  {regionConfig.supportsMembership
                    ? "Start with one report. Use membership when you want broader access."
                    : "Start with the report. Add guided explanation only when it helps."}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="surface-block px-4 py-4">
                  <p className="insight-label">Core report</p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {pricingLabels.singleInsightReport}
                  </p>
                </div>
                <div className="surface-block px-4 py-4">
                  <p className="insight-label">
                    {regionConfig.supportsMembership ? "Membership" : "Guided explanation"}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {regionConfig.supportsMembership
                      ? pricingLabels.membershipAnnual
                      : pricingLabels.explanationThirtyMinutes}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">Why it stays simple</Badge>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-success/18 bg-success/10 text-success">
                    <ChartIcon className="h-5 w-5" />
                  </span>
                </div>
                <CardTitle className="text-[1.3rem]">
                  Reports, downloads, resend actions, and access all resolve from the same account layer.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LinkButton href="/pricing" variant="outline" size="lg">
                  {regionConfig.supportsMembership
                    ? "Compare Access Options"
                    : "Review Report And Walkthrough Options"}
                </LinkButton>
              </CardContent>
            </Card>
          </div>

          {primarySubscription ? (
            <MembershipSummary
              subscription={toLegacySubscription(primarySubscription)}
              benefits={membershipBenefits}
              unlockedAssessments={unlockedAssessments}
            />
          ) : null}

          {library.explanationEntitlements.length > 0 ? (
            <Card className="h-full">
              <CardHeader className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="accent">Guided walkthrough entitlements</Badge>
                  <Badge variant="outline">
                    {library.explanationEntitlements.length} saved
                  </Badge>
                </div>
                <CardTitle className="text-[1.55rem]">
                  Structured report walkthrough access now sits inside the same owned library.
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {library.explanationEntitlements.map((entitlement) => (
                  <div key={entitlement.id} className="surface-block px-4 py-4">
                    <p className="insight-label">{entitlement.title}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {entitlement.durationMinutes} minute session
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      Status: {entitlement.status}. This is framed as a guided
                      report walkthrough and structured discussion of your report,
                      not therapy or diagnosis.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <Card className="h-full">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="accent">Subscriber-specific next steps</Badge>
                <Badge variant="outline">
                    {hasActiveMembership ? membershipNarrative.annualBadge : "Prepared now"}
                  </Badge>
                </div>
                <CardTitle className="text-[1.55rem]">
                  {regionConfig.supportsMembership
                    ? "Membership becomes more valuable when connected topics stay visible together."
                    : "Connected insight suggestions become more useful when the report library stays in one place."}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {membershipRecommendations.opportunities.map((item) => (
                  <div key={item.id} className="surface-block px-4 py-4">
                    <p className="insight-label">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="space-y-5">
                <Badge variant="outline">Membership-aware recommendations</Badge>
                <CardTitle className="text-[1.55rem]">
                  These are the next insight paths most likely to add context, not just volume.
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {membershipRecommendations.nextInsights.map((assessment) => (
                  <div key={assessment.slug} className="surface-block px-4 py-4">
                    <p className="text-base font-semibold text-foreground">{assessment.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{assessment.summary}</p>
                    <LinkButton
                      href={`/assessments/${assessment.slug}`}
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      Explore This Insight
                    </LinkButton>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Recent Activity"
        title="Ownership activity and account history"
        description="Recent purchases, library updates, and delivery events now have a clear place in the account experience."
        variant="subtle"
      >
        <RecentActivityFeed items={library.recentActivity} />
      </SectionShell>

      <SectionShell
        eyebrow="Recommended Next Insights"
        title="Suggested next insights"
        description="These recommendations are based on the reports already in the library, the patterns they tend to connect to, and the related insight gaps that still remain."
        variant="panel"
      >
        <RelatedInsightsPanel
          title="Suggested next insights based on your current report library"
          description="The goal here is continuity, not volume. These recommendations are chosen because they may clarify something still missing in the pattern picture built so far."
          assessments={suggestedAssessments}
          recommendations={suggestedDecisions}
          membershipNote="Membership allows these connected insights to stay within one library, which is more useful than treating each adjacent report as a disconnected purchase."
        />
      </SectionShell>

      <SectionShell className="pt-0">
        <CtaBlock
          eyebrow="Dashboard Note"
          title="The dashboard now reflects owned reports, bundles, membership state, delivery readiness, and recent activity from one shared account layer."
          description="The owned report layer now carries backend purchase records, server-side ownership grants, PDF generation, and durable report delivery through the same library experience."
          actions={
            <>
              <LinkButton href="/reports/imposter-syndrome-deep-report" size="xl">
                Open A Saved Report
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="xl">
                Review Upgrade Path
              </LinkButton>
            </>
          }
        />
      </SectionShell>
    </>
  );
}
