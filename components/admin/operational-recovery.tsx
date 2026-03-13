"use client";

import { useEffect, useState } from "react";

import { AnalyticsMetricCard } from "@/components/admin/analytics-metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DownloadIcon,
  MailIcon,
  ReportIcon,
  ShieldIcon,
  SubscriptionIcon
} from "@/components/ui/icons";

type OperationalRecoverySnapshot = {
  counts: {
    failedReports: number;
    failedPdfs: number;
    failedEmails: number;
    pendingExplanations: number;
    recentFailures: number;
    missingRequiredEnv: number;
  };
  env: {
    missingRequired: number;
    missingOptional: number;
    diagnostics: Array<{
      key: string;
      label: string;
      feature: string;
      configured: boolean;
      status: "configured" | "missing_required" | "missing_optional";
      note: string;
    }>;
  };
  failedReports: Array<{
    reportId: string;
    title: string;
    assessmentSlug: string;
    userEmail: string;
    status: string;
    failureReason: string;
    updatedAt: string;
  }>;
  failedPdfs: Array<{
    reportId: string;
    title: string;
    userEmail: string;
    pdfStatus: string;
    failureReason: string;
    updatedAt: string;
  }>;
  failedEmails: Array<{
    deliveryId: string;
    reportId: string;
    reportTitle: string;
    recipientEmail: string;
    status: string;
    failureReason: string;
    resendCount: number;
    lastAttemptedAt: string | null;
  }>;
  explanationEntitlements: Array<{
    entitlementId: string;
    title: string;
    assessmentSlug: string | null;
    reportTitle: string | null;
    userEmail: string;
    durationMinutes: number;
    status: string;
    grantedAt: string | null;
    scheduledFor: string | null;
  }>;
  recentFailures: Array<{
    id: string;
    eventType: string;
    message: string;
    level: string;
    createdAt: string;
    reportId: string | null;
    checkoutIntentId: string | null;
  }>;
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function statusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("ready") ||
    normalized === "completed" ||
    normalized === "sent" ||
    normalized === "configured"
  ) {
    return "success" as const;
  }

  if (
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("bounce") ||
    normalized.includes("missing")
  ) {
    return "outline" as const;
  }

  return "accent" as const;
}

type RecoveryAction =
  | {
      action: "retry_report_generation" | "retry_pdf_generation" | "retry_email_delivery";
      reportId: string;
    }
  | {
      action: "update_explanation_status";
      entitlementId: string;
      status: string;
    };

export function OperationalRecovery() {
  const [snapshot, setSnapshot] = useState<OperationalRecoverySnapshot | null>(null);
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "empty">("loading");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadSnapshot() {
    try {
      const response = await fetch("/api/admin/operational-recovery", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Operational recovery data is not available.");
      }

      const payload = (await response.json()) as OperationalRecoverySnapshot;

      setSnapshot(payload);
      setLoadingState("ready");
    } catch {
      setLoadingState("empty");
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  async function runAction(key: string, action: RecoveryAction) {
    setPendingAction(key);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/operational-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(action)
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "The recovery action could not be completed.");
      }

      setFeedback(payload.message ?? "The recovery action completed successfully.");
      await loadSnapshot();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The recovery action could not be completed."
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (loadingState === "loading") {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-[1.4rem]">Loading operational recovery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted">
            Pulling failed generation, asset, delivery, environment, and explanation-session readiness data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingState === "empty" || !snapshot) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-[1.4rem]">Operational recovery is not available yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted">
            Once persistent reports, delivery events, and environment diagnostics are available, recovery controls will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricRows = [
    {
      label: "Failed reports",
      value: String(snapshot.counts.failedReports),
      note: "Saved premium reports that need another generation pass.",
      icon: <ReportIcon className="h-4 w-4" />
    },
    {
      label: "Failed PDFs",
      value: String(snapshot.counts.failedPdfs),
      note: "Owned reports that need another PDF export pass.",
      icon: <DownloadIcon className="h-4 w-4" />
    },
    {
      label: "Failed emails",
      value: String(snapshot.counts.failedEmails),
      note: "Delivery attempts that need a resend or provider check.",
      icon: <MailIcon className="h-4 w-4" />
    },
    {
      label: "Explanation queue",
      value: String(snapshot.counts.pendingExplanations),
      note: "Guided walkthrough entitlements waiting for contact or follow-through.",
      icon: <SubscriptionIcon className="h-4 w-4" />
    },
    {
      label: "Recent failures",
      value: String(snapshot.counts.recentFailures),
      note: "Latest operational failures captured in the internal event log.",
      icon: <ShieldIcon className="h-4 w-4" />
    },
    {
      label: "Missing env",
      value: String(snapshot.counts.missingRequiredEnv),
      note: "Required launch configuration gaps that should be closed before go-live.",
      icon: <ShieldIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {feedback ? (
        <div className="rounded-[24px] border border-primary/18 bg-primary/[0.08] px-5 py-4 text-sm leading-7 text-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {metricRows.map((item) => (
          <AnalyticsMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            badge="Recovery"
            icon={item.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline">Launch environment</Badge>
            <Badge variant={snapshot.env.missingRequired > 0 ? "outline" : "success"}>
              {snapshot.env.missingRequired > 0 ? "Action needed" : "Configured"}
            </Badge>
          </div>
          <CardTitle className="text-[1.4rem]">
            Runtime configuration should be explicit before go-live.
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {snapshot.env.diagnostics.map((item) => (
            <div key={item.key} className="surface-block px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <Badge variant={statusVariant(item.status)}>{item.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                {item.feature}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="space-y-4">
            <Badge variant="outline">Report recovery</Badge>
            <CardTitle className="text-[1.35rem]">Failed report generations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.failedReports.length === 0 ? (
              <p className="text-sm leading-7 text-muted">
                No saved reports currently need a generation retry.
              </p>
            ) : (
              snapshot.failedReports.map((report) => (
                <div key={report.reportId} className="surface-block px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{report.title}</p>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        {report.userEmail} · {report.assessmentSlug}
                      </p>
                    </div>
                    <Badge variant={statusVariant(report.status)}>{report.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground">{report.failureReason}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs leading-6 text-muted">
                      Last updated {formatDateLabel(report.updatedAt)}
                    </p>
                    <Button
                      variant="outline"
                      size="md"
                      disabled={pendingAction === `report:${report.reportId}`}
                      onClick={() => {
                        void runAction(`report:${report.reportId}`, {
                          action: "retry_report_generation",
                          reportId: report.reportId
                        });
                      }}
                    >
                      {pendingAction === `report:${report.reportId}` ? "Retrying..." : "Retry generation"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-4">
            <Badge variant="outline">Asset recovery</Badge>
            <CardTitle className="text-[1.35rem]">Failed PDF and email delivery operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.failedPdfs.length === 0 && snapshot.failedEmails.length === 0 ? (
              <p className="text-sm leading-7 text-muted">
                No saved report assets currently need export or delivery recovery.
              </p>
            ) : null}

            {snapshot.failedPdfs.map((report) => (
              <div key={`pdf:${report.reportId}`} className="surface-block px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{report.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">{report.userEmail}</p>
                  </div>
                  <Badge variant={statusVariant(report.pdfStatus)}>{report.pdfStatus.toLowerCase()}</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground">{report.failureReason}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs leading-6 text-muted">
                    Last updated {formatDateLabel(report.updatedAt)}
                  </p>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={pendingAction === `pdf:${report.reportId}`}
                    onClick={() => {
                      void runAction(`pdf:${report.reportId}`, {
                        action: "retry_pdf_generation",
                        reportId: report.reportId
                      });
                    }}
                  >
                    {pendingAction === `pdf:${report.reportId}` ? "Retrying..." : "Retry PDF"}
                  </Button>
                </div>
              </div>
            ))}

            {snapshot.failedEmails.map((delivery) => (
              <div key={delivery.deliveryId} className="surface-block px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{delivery.reportTitle}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">{delivery.recipientEmail}</p>
                  </div>
                  <Badge variant={statusVariant(delivery.status)}>{delivery.status.toLowerCase()}</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground">{delivery.failureReason}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs leading-6 text-muted">
                    Resends {delivery.resendCount} · Last attempt {formatDateLabel(delivery.lastAttemptedAt)}
                  </p>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={pendingAction === `email:${delivery.reportId}`}
                    onClick={() => {
                      void runAction(`email:${delivery.reportId}`, {
                        action: "retry_email_delivery",
                        reportId: delivery.reportId
                      });
                    }}
                  >
                    {pendingAction === `email:${delivery.reportId}` ? "Retrying..." : "Retry email"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="space-y-4">
            <Badge variant="outline">Guided explanation ops</Badge>
            <CardTitle className="text-[1.35rem]">
              Explanation-session entitlements waiting for operational follow-through
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.explanationEntitlements.length === 0 ? (
              <p className="text-sm leading-7 text-muted">
                No explanation-session entitlements are currently waiting for contact or scheduling.
              </p>
            ) : (
              snapshot.explanationEntitlements.map((item) => (
                <div key={item.entitlementId} className="surface-block px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        {item.userEmail} · {item.durationMinutes} min
                      </p>
                    </div>
                    <Badge variant={statusVariant(item.status)}>{item.status.toLowerCase().replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Report: {item.reportTitle ?? "Not linked yet"} · Granted {formatDateLabel(item.grantedAt)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      disabled={pendingAction === `entitlement:ready:${item.entitlementId}`}
                      onClick={() => {
                        void runAction(`entitlement:ready:${item.entitlementId}`, {
                          action: "update_explanation_status",
                          entitlementId: item.entitlementId,
                          status: "ready_for_contact"
                        });
                      }}
                    >
                      Ready for contact
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      disabled={pendingAction === `entitlement:contacted:${item.entitlementId}`}
                      onClick={() => {
                        void runAction(`entitlement:contacted:${item.entitlementId}`, {
                          action: "update_explanation_status",
                          entitlementId: item.entitlementId,
                          status: "contacted"
                        });
                      }}
                    >
                      Mark contacted
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      disabled={pendingAction === `entitlement:completed:${item.entitlementId}`}
                      onClick={() => {
                        void runAction(`entitlement:completed:${item.entitlementId}`, {
                          action: "update_explanation_status",
                          entitlementId: item.entitlementId,
                          status: "completed"
                        });
                      }}
                    >
                      Mark completed
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-4">
            <Badge variant="outline">Recent failures</Badge>
            <CardTitle className="text-[1.35rem]">Internal operational failure log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.recentFailures.length === 0 ? (
              <p className="text-sm leading-7 text-muted">
                No recent operational failures have been recorded.
              </p>
            ) : (
              snapshot.recentFailures.map((event) => (
                <div key={event.id} className="surface-block px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-semibold text-foreground">{event.eventType}</p>
                    <Badge variant={statusVariant(event.level)}>{event.level.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground">{event.message}</p>
                  <p className="mt-3 text-xs leading-6 text-muted">
                    {formatDateLabel(event.createdAt)}
                    {event.reportId ? ` · report ${event.reportId}` : ""}
                    {event.checkoutIntentId ? ` · intent ${event.checkoutIntentId}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
