import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { AnalyticsTable } from "@/components/admin/analytics-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionShell } from "@/components/ui/section-shell";
import { LibraryIcon, ReportIcon, TrendUpIcon } from "@/components/ui/icons";
import {
  formatAdminDate,
  formatAdminLabel,
  formatAdminNumber
} from "@/lib/admin/format";
import { getAdminUsersPageData } from "@/lib/server/services/admin-dashboard";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const data = await getAdminUsersPageData(query);

  return (
    <>
      <SectionShell
        eyebrow="Users"
        title="Real account records and account-level ownership visibility"
        description="This page uses the current user, purchase, report, and tracked activity tables only. It does not infer users from anonymous preview traffic."
        variant="panel"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <AnalyticsMetricCard
            label="Total users"
            value={formatAdminNumber(data.summary.totalUsers)}
            note="All account records currently stored."
            badge="Users"
            icon={<LibraryIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="New users (7 days)"
            value={formatAdminNumber(data.summary.newUsersLast7Days)}
            note="Accounts created in the last week."
            badge="Users"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Users with paid purchases"
            value={formatAdminNumber(data.summary.buyersCount)}
            note="Distinct users who have at least one paid purchase."
            badge="Commerce"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Users with owned reports"
            value={formatAdminNumber(data.summary.reportOwnersCount)}
            note="Distinct users with at least one saved report record."
            badge="Reports"
            icon={<ReportIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Profiles completed"
            value={formatAdminNumber(data.summary.profileCompletedCount)}
            note="Users who saved the profile/intake step."
            badge="Profiles"
            icon={<LibraryIcon className="h-4 w-4" />}
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Search"
        title="Find a user quickly"
        description="Search by email or full name. Results are limited to the latest 150 matching users so the page stays fast and readable."
        variant="subtle"
      >
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-[1.3rem]">Search users</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3 sm:flex-row" action="/admin/users">
              <Input
                name="q"
                defaultValue={data.query}
                placeholder="Search by email or full name"
                className="sm:max-w-md"
              />
              <div className="flex gap-3">
                <Button type="submit" size="md">
                  Search
                </Button>
                {data.query ? (
                  <a
                    href="/admin/users"
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 px-5 text-[0.98rem] font-semibold text-foreground transition hover:border-primary/45 hover:bg-white/[0.06]"
                  >
                    Clear
                  </a>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell
        eyebrow="User Table"
        title="Accounts, purchase counts, report ownership, and latest tracked activity"
        description="Last tracked activity is derived from current user, purchase, report, session, and download timestamps. It is not a pageview or live-session metric."
        variant="panel"
      >
        <AnalyticsTable
          title="Users"
          description="Real user records from the database."
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "profile", label: "Profile" },
            { key: "signedUp", label: "Signed Up" },
            { key: "region", label: "Country / Region" },
            { key: "purchases", label: "Paid Purchases" },
            { key: "reports", label: "Reports Owned" },
            { key: "latestPurchase", label: "Latest Purchase" },
            { key: "lastActivity", label: "Last Tracked Activity" }
          ]}
          rows={data.users.map((user) => ({
            name: (
              <div className="space-y-1">
                <div>{formatAdminLabel(user.preferredName ?? user.fullName, "No name saved")}</div>
                {user.preferredName && user.fullName ? (
                  <div className="text-xs text-muted">{user.fullName}</div>
                ) : null}
              </div>
            ),
            email: user.email,
            profile: (
              <div className="space-y-1">
                <div>{user.profileCompleted ? "Completed" : "Incomplete"}</div>
                <div className="text-xs text-muted">
                  {formatAdminLabel(user.primaryConcern, "No primary concern saved")}
                </div>
              </div>
            ),
            signedUp: formatAdminDate(user.createdAt),
            region: [user.country, user.region].filter(Boolean).join(" / ") || "Unavailable",
            purchases: formatAdminNumber(user.purchasesCount),
            reports: formatAdminNumber(user.reportsOwnedCount),
            latestPurchase: formatAdminDate(user.latestPurchaseAt),
            lastActivity: formatAdminDate(user.lastTrackedActivityAt)
          }))}
          minWidthClassName="min-w-[1340px]"
        />
      </SectionShell>
    </>
  );
}
