import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { AnalyticsTable } from "@/components/admin/analytics-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentIcon, ChartIcon, InsightIcon, TrendUpIcon } from "@/components/ui/icons";
import { SectionShell } from "@/components/ui/section-shell";
import {
  formatAdminDate,
  formatAdminLabel,
  formatAdminNumber,
  formatAdminPercent,
  formatCurrencyBreakdown
} from "@/lib/admin/format";
import { getAdminAnalyticsPageData } from "@/lib/server/services/admin-dashboard";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsPageData();

  return (
    <>
      <SectionShell
        eyebrow="Analytics"
        title="Truthful funnel, assessment, source, and provider analytics from current stored data"
        description="This page intentionally omits visitor traffic and assessment-start metrics that are not currently persisted in the app."
        variant="panel"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <AnalyticsMetricCard
            label="Source records"
            value={formatAdminNumber(analytics.funnelSnapshot.sourceAttributionRecords)}
            note="Stored SourceAttribution records currently in the database."
            badge="Source"
            icon={<InsightIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Attributed sessions"
            value={formatAdminNumber(analytics.funnelSnapshot.attributedAssessmentSessions)}
            note="Assessment sessions linked to a SourceAttribution record."
            badge="Funnel"
            icon={<AssessmentIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Attributed paid purchases"
            value={formatAdminNumber(analytics.funnelSnapshot.attributedPaidPurchases)}
            note="Paid purchases carrying source attribution today."
            badge="Funnel"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Completed assessments"
            value={formatAdminNumber(analytics.funnelSnapshot.completedAssessmentSessions)}
            note="Assessment sessions with a real completed timestamp."
            badge="Assessments"
            icon={<AssessmentIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Paid from completed"
            value={formatAdminPercent(analytics.funnelSnapshot.paidFromCompletedRate)}
            note="Paid assessment sessions divided by completed sessions. This is the strongest truthful conversion rate currently available."
            badge="Conversion"
            icon={<ChartIcon className="h-4 w-4" />}
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Tracking Limits"
        title="Metrics intentionally withheld until the event model supports them"
        description="These are omitted by design so the admin does not imply accuracy the current schema cannot support."
        variant="subtle"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {analytics.availabilityNotes.map((note) => (
            <Card key={note}>
              <CardHeader className="space-y-3">
                <Badge variant="outline">Unavailable</Badge>
                <CardTitle className="text-[1.15rem]">Not tracked truthfully yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Assessment Analytics"
        title="Which assessments are being completed and purchased"
        description="This table uses saved assessment sessions plus paid purchase records. It does not label “starts” because starts are not currently persisted separately."
        variant="panel"
      >
        <AnalyticsTable
          title="Assessment performance"
          description="Tracked session count reflects saved preview/completion sessions rather than first-question starts."
          columns={[
            { key: "assessment", label: "Assessment" },
            { key: "tracked", label: "Tracked Sessions" },
            { key: "completed", label: "Completed" },
            { key: "paid", label: "Paid Purchases" },
            { key: "rate", label: "Paid From Completed" },
            { key: "revenue", label: "Revenue" }
          ]}
          rows={analytics.assessmentAnalytics.map((item) => ({
            assessment: item.assessmentTitle,
            tracked: formatAdminNumber(item.trackedSessions),
            completed: formatAdminNumber(item.completedSessions),
            paid: formatAdminNumber(item.paidPurchases),
            rate: formatAdminPercent(item.paidFromCompletedRate),
            revenue: formatCurrencyBreakdown(item.revenueByCurrency)
          }))}
          minWidthClassName="min-w-[1180px]"
        />
      </SectionShell>

      <SectionShell
        eyebrow="Source Analytics"
        title="Attributed source pages and topics"
        description="These rows only reflect SourceAttribution records that actually exist. They are not visitor counts and should be read as attributed sessions, checkouts, and purchases."
        variant="subtle"
      >
        {analytics.sourceAnalytics.length ? (
          <AnalyticsTable
            title="Source attribution"
            description="Top attributed sources ranked by paid purchases, then attributed sessions."
            columns={[
              { key: "source", label: "Source" },
              { key: "topic", label: "Topic" },
              { key: "assessment", label: "Linked Assessment" },
              { key: "sessions", label: "Attributed Sessions" },
              { key: "checkouts", label: "Attributed Checkouts" },
              { key: "purchases", label: "Attributed Paid Purchases" },
              { key: "revenue", label: "Revenue" },
              { key: "latest", label: "Latest Touch" }
            ]}
            rows={analytics.sourceAnalytics.map((item) => ({
              source: item.sourceLabel,
              topic: formatAdminLabel(item.sourceTopic, "Unavailable"),
              assessment: formatAdminLabel(item.linkedAssessmentSlug, "Unavailable"),
              sessions: formatAdminNumber(item.attributedSessions),
              checkouts: formatAdminNumber(item.attributedCheckouts),
              purchases: formatAdminNumber(item.attributedPaidPurchases),
              revenue: formatCurrencyBreakdown(item.paidRevenueByCurrency),
              latest: formatAdminDate(item.latestTouchAt)
            }))}
            minWidthClassName="min-w-[1460px]"
          />
        ) : (
          <Card>
            <CardHeader className="space-y-4">
              <Badge variant="outline">Source attribution</Badge>
              <CardTitle className="text-[1.4rem]">
                No usable source analytics are stored yet.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">
                The schema supports SourceAttribution, but the current codebase does not automatically create pageview or landing source records. If this table stays empty in production, the missing piece is event capture rather than UI.
              </p>
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        eyebrow="Commerce Split"
        title="Provider, region, and currency split from confirmed paid records"
        description="These tables are built from paid purchase records and paid checkout intents only."
        variant="panel"
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <AnalyticsTable
            title="By provider"
            description="Confirmed paid purchases grouped by stored payment provider."
            columns={[
              { key: "provider", label: "Provider" },
              { key: "purchases", label: "Paid Purchases" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={analytics.providerSplit.map((item) => ({
              provider: item.provider ?? "UNKNOWN",
              purchases: formatAdminNumber(item.purchaseCount),
              revenue: formatCurrencyBreakdown(item.revenueByCurrency)
            }))}
            minWidthClassName="min-w-[560px]"
          />
          <AnalyticsTable
            title="By region"
            description="Confirmed paid checkout intents grouped by resolved region key."
            columns={[
              { key: "region", label: "Region" },
              { key: "purchases", label: "Paid Purchases" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={analytics.regionSplit.map((item) => ({
              region: item.regionKey,
              purchases: formatAdminNumber(item.purchaseCount),
              revenue: formatCurrencyBreakdown(item.revenueByCurrency)
            }))}
            minWidthClassName="min-w-[560px]"
          />
          <AnalyticsTable
            title="By currency"
            description="Revenue totals grouped by stored purchase currency."
            columns={[
              { key: "currency", label: "Currency" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={analytics.currencySplit.map((item) => ({
              currency: item.currency,
              revenue: formatCurrencyBreakdown([item])
            }))}
            minWidthClassName="min-w-[420px]"
          />
        </div>
      </SectionShell>
    </>
  );
}
