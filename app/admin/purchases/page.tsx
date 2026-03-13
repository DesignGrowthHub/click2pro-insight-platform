import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { AnalyticsTable } from "@/components/admin/analytics-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionShell } from "@/components/ui/section-shell";
import { TrendUpIcon } from "@/components/ui/icons";
import {
  formatAdminDateTime,
  formatAdminLabel,
  formatAdminNumber,
  formatCurrencyAmount,
  formatCurrencyBreakdown
} from "@/lib/admin/format";
import { getAdminPurchasesPageData } from "@/lib/server/services/admin-dashboard";

type AdminPurchasesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    provider?: string;
    type?: string;
  }>;
};

export default async function AdminPurchasesPage({
  searchParams
}: AdminPurchasesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = {
    query: typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "",
    status:
      typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "",
    provider:
      typeof resolvedSearchParams.provider === "string"
        ? resolvedSearchParams.provider
        : "",
    purchaseType:
      typeof resolvedSearchParams.type === "string" ? resolvedSearchParams.type : ""
  };
  const data = await getAdminPurchasesPageData(filters);

  return (
    <>
      <SectionShell
        eyebrow="Purchases"
        title="Paid purchases, linked buyers, and provider-level payment records"
        description="This page uses the real purchase table and linked user/checkout records only. It does not estimate revenue or fabricate provider state."
        variant="panel"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetricCard
            label="Matching purchases"
            value={formatAdminNumber(data.summary.matchingPurchases)}
            note="All purchases matching the current search/filter set."
            badge="Purchases"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Paid purchases"
            value={formatAdminNumber(data.summary.matchingPaidPurchases)}
            note="Confirmed paid purchases inside the current result set."
            badge="Paid"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Unique buyers"
            value={formatAdminNumber(data.summary.uniqueBuyers)}
            note="Distinct users across the current paid purchase results."
            badge="Buyers"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
          <AnalyticsMetricCard
            label="Paid revenue"
            value={formatCurrencyBreakdown(data.summary.paidRevenueByCurrency)}
            note="Revenue shown by actual stored currency for the filtered paid purchases."
            badge="Revenue"
            icon={<TrendUpIcon className="h-4 w-4" />}
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Filters"
        title="Search and narrow the purchase table"
        description="Search by buyer, assessment slug, or product title. Filters apply to the real purchase table only."
        variant="subtle"
      >
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-[1.3rem]">Purchase filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,180px))_auto]" action="/admin/purchases">
              <Input
                name="q"
                defaultValue={data.filters.query}
                placeholder="Search buyer, title, or slug"
              />
              <Input
                name="status"
                defaultValue={data.filters.status}
                placeholder="Status (PAID, FAILED)"
              />
              <Input
                name="provider"
                defaultValue={data.filters.provider}
                placeholder="Provider (STRIPE, RAZORPAY)"
              />
              <Input
                name="type"
                defaultValue={data.filters.purchaseType}
                placeholder="Type (PREMIUM_REPORT)"
              />
              <div className="flex gap-3">
                <Button type="submit" size="md">
                  Apply
                </Button>
                {(data.filters.query ||
                  data.filters.status ||
                  data.filters.provider ||
                  data.filters.purchaseType) ? (
                  <a
                    href="/admin/purchases"
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
        eyebrow="Purchase Table"
        title="Real payment and purchase records"
        description="The rows below come straight from the purchase table with linked user and checkout intent information."
        variant="panel"
      >
        <AnalyticsTable
          title="Purchases"
          description="Most recent matching purchase records."
          columns={[
            { key: "purchasedAt", label: "Purchase Date" },
            { key: "buyer", label: "Buyer" },
            { key: "product", label: "Assessment / Product" },
            { key: "amount", label: "Amount" },
            { key: "provider", label: "Provider" },
            { key: "type", label: "Purchase Type" },
            { key: "status", label: "Status" },
            { key: "checkout", label: "Checkout Intent" }
          ]}
          rows={data.purchases.map((purchase) => ({
            purchasedAt: formatAdminDateTime(purchase.purchasedAt ?? purchase.createdAt),
            buyer: (
              <div className="space-y-1">
                <div>{formatAdminLabel(purchase.userName, purchase.userEmail)}</div>
                <div className="text-xs text-muted">{purchase.userEmail}</div>
                <div className="text-xs text-muted">
                  {purchase.userProfileCompleted ? "Profile completed" : "Profile incomplete"}
                </div>
                {purchase.userPrimaryConcern ? (
                  <div className="text-xs text-muted">{purchase.userPrimaryConcern}</div>
                ) : null}
              </div>
            ),
            product: (
              <div className="space-y-1">
                <div>{formatAdminLabel(purchase.title, purchase.assessmentSlug ?? "Untitled purchase")}</div>
                {purchase.assessmentSlug ? (
                  <div className="text-xs text-muted">{purchase.assessmentSlug}</div>
                ) : null}
              </div>
            ),
            amount: formatCurrencyAmount(purchase.currency, purchase.amountCents),
            provider: purchase.paymentProvider ?? "UNKNOWN",
            type: purchase.purchaseType.replace(/_/g, " "),
            status: purchase.status,
            checkout: purchase.checkoutIntentId ?? "No linked intent"
          }))}
          minWidthClassName="min-w-[1320px]"
        />
      </SectionShell>
    </>
  );
}
