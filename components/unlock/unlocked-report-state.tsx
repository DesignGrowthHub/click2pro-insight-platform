import { ReportActions } from "@/components/reports/report-actions";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldIcon } from "@/components/ui/icons";
import type {
  CommercePersistenceMode,
  OwnedReport
} from "@/lib/commerce/types";
import type {
  AssessmentDefinition,
  PremiumReport
} from "@/lib/types/assessment-domain";

type UnlockedReportStateProps = {
  assessment: AssessmentDefinition;
  ownedReport: OwnedReport;
  accountEmailLabel?: string;
  premiumReport?: PremiumReport | null;
  persistenceMode?: CommercePersistenceMode;
  onRefresh?: () => void | Promise<void>;
  showPrimaryReportLink?: boolean;
};

function formatUnlockDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function UnlockedReportState({
  assessment,
  ownedReport,
  accountEmailLabel = "your account email",
  premiumReport = null,
  persistenceMode = "local_demo",
  onRefresh,
  showPrimaryReportLink = true
}: UnlockedReportStateProps) {
  return (
    <Card variant="raised" className="panel-grid overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Full report unlocked</Badge>
          <Badge variant="outline">
            {ownedReport.accessSource === "subscription"
              ? "Membership access"
              : ownedReport.accessSource === "bundle"
                ? "Bundle access"
                : "Purchased report"}
          </Badge>
          <Badge variant="outline">{formatUnlockDate(ownedReport.purchasedAt)}</Badge>
        </div>
        <CardTitle className="text-[1.75rem] leading-[1.08] sm:text-[1.95rem]">
          Your report is saved privately and stays available whenever you want to return to it.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="surface-block-strong p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-success/20 bg-success/10 text-success">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">
                  {assessment.reportLabel}
                </p>
                <p className="text-sm leading-7 text-muted">
                  The report is already attached to your account, so download, email delivery, and later reading all stay connected to the same saved document.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-block px-4 py-4">
              <p className="insight-label">Access path</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {ownedReport.unlock.reasonLabel}
              </p>
            </div>
            <div className="surface-block px-4 py-4">
              <p className="insight-label">Available later</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Download and email delivery
              </p>
            </div>
            <div className="surface-block px-4 py-4 sm:col-span-2">
              <p className="insight-label">Account note</p>
              <p className="mt-2 text-base leading-8 text-muted">
                Saved under {accountEmailLabel}. You can come back to it from your library without retaking the assessment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {showPrimaryReportLink ? (
            <LinkButton href={`/reports/${assessment.slug}#full-report`} size="lg">
              Open Full Report
            </LinkButton>
          ) : null}
          <LinkButton href="/dashboard" variant="outline" size="lg">
            View My Report Library
          </LinkButton>
        </div>

        <div className="space-y-3">
          <p className="insight-label">Delivery and file actions</p>
          <ReportActions
            ownedReport={ownedReport}
            accountEmailLabel={accountEmailLabel}
            premiumReport={premiumReport}
            context="report"
            persistenceMode={persistenceMode}
            onRefresh={onRefresh}
          />
        </div>
      </CardContent>
    </Card>
  );
}
