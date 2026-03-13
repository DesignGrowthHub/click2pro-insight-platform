import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryIcon, ReportIcon, ShieldIcon } from "@/components/ui/icons";
import { buildReportEmailPlan } from "@/lib/email/report-delivery";
import { getPdfStatusNote } from "@/lib/pdf/report-pdf";
import { buildReportOwnershipSnapshot } from "@/lib/reports/report-ownership";
import type { OwnedReport } from "@/lib/commerce/types";

import { ReportActions } from "./report-actions";

function formatDateLabel(date: string | null) {
  if (!date) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function getStatusBadge(report: OwnedReport) {
  if (report.generationStatus === "ready") {
    return { label: "Ready", variant: "success" as const };
  }

  if (report.generationStatus === "generating") {
    return { label: "Generating", variant: "accent" as const };
  }

  return { label: "Needs retry", variant: "outline" as const };
}

function getAccessBadge(report: OwnedReport) {
  if (report.accessSource === "subscription") {
    return "Membership";
  }

  if (report.accessSource === "bundle") {
    return "Bundle";
  }

  return "Single purchase";
}

type ReportLibraryCardProps = {
  report: OwnedReport;
  accountEmail: string;
};

export function ReportLibraryCard({
  report,
  accountEmail
}: ReportLibraryCardProps) {
  const status = getStatusBadge(report);
  const snapshot = buildReportOwnershipSnapshot(report);
  const emailPlan = buildReportEmailPlan(
    snapshot.record,
    snapshot.file,
    snapshot.deliveries
  );

  return (
    <Card variant="raised" className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary shadow-[0_16px_32px_rgba(59,130,246,0.16)]">
            <ReportIcon className="h-5 w-5" />
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant="outline">{getAccessBadge(report)}</Badge>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">My report</Badge>
            <Badge variant="outline">{report.topic}</Badge>
          </div>
          <CardTitle className="text-[1.55rem] sm:text-[1.8rem]">
            {report.reportTitle}
          </CardTitle>
          <p className="body-md max-w-3xl">
            Purchased reports are structured as durable owned assets: saved in the
            dashboard, prepared for PDF export, and staged for account-email or
            alternate-email delivery without leaving the library context.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="surface-block px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Purchased</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {formatDateLabel(report.purchasedAt)}
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Generated</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {formatDateLabel(report.generatedAt)}
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">PDF</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {snapshot.file.status === "ready"
                ? "Ready"
                : snapshot.file.status === "processing"
                  ? "Processing"
                  : "Failed"}
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Delivery</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {snapshot.record.emailStatus === "sent"
                ? "Sent"
                : snapshot.record.emailStatus === "queued"
                  ? "Queued"
                  : snapshot.record.emailStatus === "failed"
                    ? "Needs retry"
                    : "Not sent"}
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Downloads</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {snapshot.record.downloadCount}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-block px-5 py-5">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <LibraryIcon className="h-4 w-4 text-primary" />
              Library ownership
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground">
              Access source: {getAccessBadge(report)}. This report remains visible
              in the library even when the user leaves the preview or purchase
              flow, so ownership feels durable rather than session-bound.
            </p>
            <p className="mt-3 text-sm text-muted">
              {report.sourceBlogUrl ?? "Direct / unknown source attribution"}
            </p>
          </div>
          <div className="surface-block-strong px-5 py-5">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <ShieldIcon className="h-4 w-4 text-success" />
              Delivery and export readiness
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>{getPdfStatusNote(snapshot.file)}</p>
              <p>{emailPlan.note}</p>
              <p>Account email: {accountEmail}</p>
              <p>Last download: {formatDateLabel(snapshot.record.lastDownloadedAt)}</p>
            </div>
          </div>
        </div>

        {report.file.failureReason ?? report.delivery.failureReason ? (
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Operational note</p>
            <p className="mt-2 text-base text-foreground">
              {report.file.failureReason ?? report.delivery.failureReason}
            </p>
          </div>
        ) : null}

        <ReportActions
          ownedReport={report}
          accountEmailLabel={accountEmail}
          context="library"
        />
      </CardContent>
    </Card>
  );
}
