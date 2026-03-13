import { LiveReportOperations } from "@/components/admin/live-report-operations";
import { OperationalRecovery } from "@/components/admin/operational-recovery";
import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { AnalyticsTable } from "@/components/admin/analytics-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AssessmentIcon,
  LibraryIcon,
  ReportIcon,
  TrendUpIcon
} from "@/components/ui/icons";
import { SectionShell } from "@/components/ui/section-shell";
import {
  formatAdminDate,
  formatAdminDateTime,
  formatAdminLabel,
  formatAdminNumber,
  formatCurrencyBreakdown
} from "@/lib/admin/format";
import { getAdminOverviewData } from "@/lib/server/services/admin-dashboard";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverviewData();

  const headlineMetrics = [
    {
      label: "Total users",
      value: formatAdminNumber(overview.headlineMetrics.totalUsers),
      note: "Real account records currently in the platform database.",
      badge: "Users",
      icon: <LibraryIcon className="h-4 w-4" />
    },
    {
      label: "New users (7 days)",
      value: formatAdminNumber(overview.headlineMetrics.newUsersLast7Days),
      note: "Accounts created in the last week.",
      badge: "Users",
      icon: <TrendUpIcon className="h-4 w-4" />
    },
    {
      label: "Paid purchases",
      value: formatAdminNumber(overview.headlineMetrics.totalPaidPurchases),
      note: "Purchases with confirmed paid status.",
      badge: "Commerce",
      icon: <TrendUpIcon className="h-4 w-4" />
    },
    {
      label: "Paid purchases (7 days)",
      value: formatAdminNumber(overview.headlineMetrics.paidPurchasesLast7Days),
      note: "Confirmed purchases in the last 7 days.",
      badge: "Commerce",
      icon: <TrendUpIcon className="h-4 w-4" />
    },
    {
      label: "Paid purchases (30 days)",
      value: formatAdminNumber(overview.headlineMetrics.paidPurchasesLast30Days),
      note: "Confirmed purchases in the last 30 days.",
      badge: "Commerce",
      icon: <TrendUpIcon className="h-4 w-4" />
    },
    {
      label: "Tracked assessment sessions",
      value: formatAdminNumber(overview.headlineMetrics.trackedAssessmentSessions),
      note: "Current schema stores assessment sessions once the user reaches the saved preview/completion stage.",
      badge: "Assessments",
      icon: <AssessmentIcon className="h-4 w-4" />
    },
    {
      label: "Completed assessments",
      value: formatAdminNumber(overview.headlineMetrics.completedAssessmentSessions),
      note: "Assessment sessions with a completed timestamp.",
      badge: "Assessments",
      icon: <AssessmentIcon className="h-4 w-4" />
    },
    {
      label: "Reports ready",
      value: formatAdminNumber(overview.headlineMetrics.readyReports),
      note: "Saved reports with generation status READY.",
      badge: "Reports",
      icon: <ReportIcon className="h-4 w-4" />
    },
    {
      label: "Unlocked reports",
      value: formatAdminNumber(overview.headlineMetrics.unlockedReports),
      note: "Reports available through ownership, bundle, or membership access.",
      badge: "Reports",
      icon: <ReportIcon className="h-4 w-4" />
    }
  ];

  return (
    <>
      <SectionShell
        eyebrow="Overview"
        title="The founder view from real purchases, report records, and saved assessment activity"
        description="These top-line numbers come directly from the current database. Visitor traffic and true assessment-start counts are not yet tracked separately, so they are not shown here as estimates."
        variant="panel"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {headlineMetrics.map((metric) => (
            <AnalyticsMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              badge={metric.badge}
              icon={metric.icon}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Revenue"
        title="Paid revenue stays separated by recorded currency"
        description="Revenue is shown by actual stored currency so the dashboard does not collapse USD and INR into one misleading total."
        variant="subtle"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <AnalyticsMetricCard
            label="Lifetime revenue"
            value={formatCurrencyBreakdown(overview.revenueByCurrency.lifetime)}
            note="Confirmed paid purchase revenue across all stored purchase records."
            badge="Revenue"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Revenue (7 days)"
            value={formatCurrencyBreakdown(overview.revenueByCurrency.last7Days)}
            note="Confirmed paid revenue in the last 7 days."
            badge="Revenue"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Revenue (30 days)"
            value={formatCurrencyBreakdown(overview.revenueByCurrency.last30Days)}
            note="Confirmed paid revenue in the last 30 days."
            badge="Revenue"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Recent Activity"
        title="Latest signups and paid purchases"
        description="These lists come from current user and purchase tables, without placeholder ordering or synthetic activity."
        variant="panel"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="h-full">
            <CardHeader className="space-y-4">
              <Badge variant="outline">Recent signups</Badge>
              <CardTitle className="text-[1.45rem]">Newest users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.recentSignups.length ? (
                overview.recentSignups.map((user) => (
                  <div key={user.id} className="surface-block px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {formatAdminLabel(user.fullName, user.email)}
                        </p>
                        <p className="text-sm text-muted">{user.email}</p>
                      </div>
                      <p className="text-sm text-muted">{formatAdminDate(user.createdAt)}</p>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                      {formatAdminLabel(user.region, user.country ?? "Region unavailable")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="surface-block px-4 py-4 text-sm leading-7 text-muted">
                  No user records are available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="space-y-4">
              <Badge variant="outline">Recent purchases</Badge>
              <CardTitle className="text-[1.45rem]">Latest paid orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.recentPurchases.length ? (
                overview.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="surface-block px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {purchase.title}
                        </p>
                        <p className="text-sm text-muted">{purchase.userEmail}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrencyBreakdown([
                          {
                            currency: purchase.currency,
                            amountCents: purchase.amountCents
                          }
                        ])}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-muted">
                      <span>{purchase.paymentProvider ?? "Unknown provider"}</span>
                      <span>•</span>
                      <span>{purchase.purchaseType.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>{formatAdminDateTime(purchase.purchasedAt ?? purchase.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-block px-4 py-4 text-sm leading-7 text-muted">
                  No paid purchases are available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Assessment Demand"
        title="What users complete and what they pay for"
        description="These tables use stored assessment sessions and paid purchase records only. “Tracked sessions” are not true starts; they represent sessions that reached the saved completion/preview layer."
        variant="subtle"
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <AnalyticsTable
            title="Top purchased assessments"
            description="Assessments ranked by paid purchase count."
            columns={[
              { key: "assessment", label: "Assessment" },
              { key: "purchases", label: "Purchases" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={overview.topPurchasedAssessments.map((item) => ({
              assessment: item.assessmentTitle,
              purchases: formatAdminNumber(item.count),
              revenue: formatCurrencyBreakdown(item.revenueByCurrency ?? [])
            }))}
            minWidthClassName="min-w-[640px]"
          />
          <AnalyticsTable
            title="Top completed assessments"
            description="Assessments ranked by completed session count."
            columns={[
              { key: "assessment", label: "Assessment" },
              { key: "completions", label: "Completions" }
            ]}
            rows={overview.topCompletedAssessments.map((item) => ({
              assessment: item.assessmentTitle,
              completions: formatAdminNumber(item.count)
            }))}
            minWidthClassName="min-w-[560px]"
          />
          <AnalyticsTable
            title="Top tracked assessments"
            description="This is the closest truthful signal currently available for “started” demand, but it reflects saved preview/completion sessions rather than first-question starts."
            columns={[
              { key: "assessment", label: "Assessment" },
              { key: "tracked", label: "Tracked Sessions" }
            ]}
            rows={overview.topTrackedAssessments.map((item) => ({
              assessment: item.assessmentTitle,
              tracked: formatAdminNumber(item.count)
            }))}
            minWidthClassName="min-w-[560px]"
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Region And Provider Split"
        title="Confirmed paid purchases by region and payment provider"
        description="These splits are derived from paid checkout intents and paid purchase records, not client-side heuristics."
        variant="panel"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <AnalyticsTable
            title="Paid purchases by region"
            description="Region comes from the resolved checkout intent at payment time."
            columns={[
              { key: "region", label: "Region" },
              { key: "purchases", label: "Paid Purchases" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={overview.paidPurchaseRegionSplit.map((item) => ({
              region: item.regionKey,
              purchases: formatAdminNumber(item.purchaseCount),
              revenue: formatCurrencyBreakdown(item.revenueByCurrency)
            }))}
            minWidthClassName="min-w-[620px]"
          />
          <AnalyticsTable
            title="Paid purchases by provider"
            description="Provider split from stored paid purchase records."
            columns={[
              { key: "provider", label: "Provider" },
              { key: "purchases", label: "Paid Purchases" },
              { key: "revenue", label: "Revenue" }
            ]}
            rows={overview.paidPurchaseProviderSplit.map((item) => ({
              provider: item.provider ?? "UNKNOWN",
              purchases: formatAdminNumber(item.purchaseCount),
              revenue: formatCurrencyBreakdown(item.revenueByCurrency)
            }))}
            minWidthClassName="min-w-[620px]"
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Tracking Limits"
        title="Metrics intentionally omitted until the current event model supports them"
        description="These are not missing because of UI work. They are intentionally withheld because the current schema does not capture them truthfully yet."
        variant="subtle"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {overview.unavailableMetrics.map((note) => (
            <Card key={note}>
              <CardHeader className="space-y-3">
                <Badge variant="outline">Unavailable</Badge>
                <CardTitle className="text-[1.2rem]">Not shown yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Report Operations"
        title="Live report generation, delivery, and recovery"
        description="These sections are already backed by real report, email, PDF, and operational-event data."
        variant="panel"
      >
        <div className="space-y-8">
          <LiveReportOperations />
          <OperationalRecovery />
        </div>
      </SectionShell>
    </>
  );
}
