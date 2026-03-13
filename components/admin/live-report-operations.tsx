"use client";

import { useEffect, useState } from "react";

import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { AnalyticsTable } from "@/components/admin/analytics-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadIcon, MailIcon, ReportIcon } from "@/components/ui/icons";

type ReportOperationsSnapshot = {
  counts: {
    reportsReady: number;
    pdfReady: number;
    pdfGenerating: number;
    pdfFailed: number;
    emailsSent: number;
    emailsQueued: number;
    emailsFailed: number;
    totalDownloads: number;
    resendAttempts: number;
  };
  recentReports: Array<{
    reportId: string;
    report: string;
    generated: string;
    pdf: string;
    accountEmail: string;
    alternateEmail: string;
    resendAttempts: number;
    downloads: number;
    failureLog: string;
  }>;
};

export function LiveReportOperations() {
  const [snapshot, setSnapshot] = useState<ReportOperationsSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/report-operations", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Live report operations are not available for this session.");
        }

        const payload = (await response.json()) as ReportOperationsSnapshot;

        if (cancelled) {
          return;
        }

        setSnapshot(payload);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("empty");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-[1.4rem]">Loading live report operations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted">
            Pulling current PDF, delivery, resend, and download activity from the
            saved report records.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "empty" || !snapshot) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-[1.4rem]">No live report operations yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted">
            Once reports are generated, downloaded, or emailed from real owned
            records, the live operations summary will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricRows = [
    {
      label: "Reports ready",
      value: String(snapshot.counts.reportsReady),
      note: "Saved reports available for owned access.",
      icon: <ReportIcon className="h-4 w-4" />
    },
    {
      label: "PDF ready",
      value: String(snapshot.counts.pdfReady),
      note: "Owned reports with generated PDF assets.",
      icon: <DownloadIcon className="h-4 w-4" />
    },
    {
      label: "Emails sent",
      value: String(snapshot.counts.emailsSent),
      note: "Successful account-email and alternate-email deliveries.",
      icon: <MailIcon className="h-4 w-4" />
    },
    {
      label: "Downloads",
      value: String(snapshot.counts.totalDownloads),
      note: "Tracked PDF downloads from saved report assets.",
      icon: <DownloadIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricRows.map((item) => (
          <AnalyticsMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            badge="Live"
            icon={item.icon}
          />
        ))}
      </div>

      <AnalyticsTable
        eyebrow="Live Operations"
        title="Current report asset activity"
        description="These rows come from the saved report records, delivery attempts, and download events already stored in the platform."
        columns={[
          { key: "report", label: "Report" },
          { key: "generated", label: "Generated" },
          { key: "pdf", label: "PDF" },
          { key: "accountEmail", label: "Account Email" },
          { key: "alternateEmail", label: "Alternate Email" },
          { key: "resendAttempts", label: "Resends" },
          { key: "downloads", label: "Downloads" },
          { key: "failureLog", label: "Failure Log" }
        ]}
        rows={snapshot.recentReports.map((item) => ({
          ...item,
          resendAttempts: String(item.resendAttempts),
          downloads: String(item.downloads)
        }))}
        minWidthClassName="min-w-[1250px]"
      />
    </div>
  );
}
