"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import {
  DownloadIcon,
  MailIcon,
  ReportIcon,
  SendIcon
} from "@/components/ui/icons";
import type {
  CommercePersistenceMode,
  OwnedReport
} from "@/lib/commerce/types";
import {
  recordReportDownload,
  sendReportToAccountEmail,
  sendReportToAlternateEmail
} from "@/lib/commerce/ownership-store";
import {
  buildReportEmailPlan,
  getEmailDeliveryStatusNote
} from "@/lib/email/report-delivery";
import { getPdfStatusNote } from "@/lib/pdf/report-pdf";
import { buildReportOwnershipSnapshot } from "@/lib/reports/report-ownership";
import type { PremiumReport } from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

type ReportActionCardProps = {
  title: string;
  description: string;
  statusLabel: string;
  icon: ReactNode;
  emphasis?: "default" | "accent";
  children: ReactNode;
};

function ReportActionCard({
  title,
  description,
  statusLabel,
  icon,
  emphasis = "default",
  children
}: ReportActionCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_18px_40px_rgba(2,6,23,0.16)]",
        emphasis === "accent" &&
          "border-primary/24 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(255,255,255,0.03))] shadow-[0_20px_42px_rgba(59,130,246,0.12)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-foreground",
            emphasis === "accent" && "border-primary/20 bg-primary/10 text-primary"
          )}
        >
          {icon}
        </span>
        <Badge variant={emphasis === "accent" ? "accent" : "outline"}>
          {statusLabel}
        </Badge>
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

type ReportActionsProps = {
  ownedReport: OwnedReport;
  accountEmailLabel: string;
  premiumReport?: PremiumReport | null;
  context?: "library" | "report" | "checkout_success";
  persistenceMode?: CommercePersistenceMode;
  onRefresh?: () => void | Promise<void>;
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

export function ReportActions({
  ownedReport,
  accountEmailLabel,
  premiumReport = null,
  context = "library",
  persistenceMode = "local_demo",
  onRefresh
}: ReportActionsProps) {
  const [reportState, setReportState] = useState(ownedReport);
  const [alternateEmail, setAlternateEmail] = useState(
    ownedReport.delivery.alternateEmail ?? ""
  );
  const [showAlternateForm, setShowAlternateForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    null | "download" | "account_email" | "alternate_email"
  >(null);

  useEffect(() => {
    setReportState(ownedReport);
    setAlternateEmail(ownedReport.delivery.alternateEmail ?? "");
  }, [ownedReport]);

  const snapshot = useMemo(
    () => buildReportOwnershipSnapshot(reportState, premiumReport),
    [reportState, premiumReport]
  );
  const emailPlan = buildReportEmailPlan(
    snapshot.record,
    snapshot.file,
    snapshot.deliveries
  );
  const accountDelivery = snapshot.deliveries.find(
    (delivery) => delivery.target === "account_email"
  );
  const alternateDelivery = snapshot.deliveries.find(
    (delivery) => delivery.target === "alternate_email"
  );
  const canDownload = snapshot.file.status === "ready";
  const canEmail = emailPlan.accountDeliveryEnabled;

  async function refreshFromServer() {
    if (onRefresh) {
      await onRefresh();
    }
  }

  async function readErrorMessage(response: Response) {
    try {
      const payload = (await response.json()) as {
        error?: string;
      };

      return payload.error ?? "The action could not be completed.";
    } catch {
      return "The action could not be completed.";
    }
  }

  function updateDownloadedState() {
    const occurredAt = new Date().toISOString();

    setReportState((current) => ({
      ...current,
      file: {
        ...current.file,
        downloadCount: current.file.downloadCount + 1,
        lastDownloadedAt: occurredAt
      }
    }));
  }

  async function handleDatabaseDownload() {
    const response = await fetch(
      `/api/report-assets/${reportState.id}/pdf?sourceContext=${context}`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const disposition = response.headers.get("content-disposition");
    const fileName =
      disposition?.match(/filename="([^"]+)"/)?.[1] ??
      `${reportState.assessmentSlug}-insight-report.pdf`;
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    updateDownloadedState();
    setFeedback("The report PDF was downloaded from your insight library.");
    await refreshFromServer();
  }

  async function handleDatabaseEmail(
    target: "account_email" | "alternate_email",
    recipientEmail?: string
  ) {
    const response = await fetch(`/api/report-assets/${reportState.id}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        target,
        recipientEmail
      })
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as {
      message: string;
      ownedReport?: OwnedReport | null;
    };

    if (payload.ownedReport) {
      setReportState(payload.ownedReport);
    }

    setFeedback(payload.message);
    await refreshFromServer();
  }

  async function handleDownload() {
    setPendingAction("download");
    setFeedback(null);

    try {
      if (persistenceMode === "database") {
        await handleDatabaseDownload();
        return;
      }

      const result = recordReportDownload(
        reportState.id,
        context === "report"
          ? "report_view"
          : context === "checkout_success"
            ? "checkout_success"
            : "dashboard"
      );

      if (result.report) {
        setReportState(result.report);
      }

      setFeedback(result.message);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The report PDF could not be downloaded."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAccountEmail() {
    setPendingAction("account_email");
    setFeedback(null);

    try {
      if (persistenceMode === "database") {
        await handleDatabaseEmail("account_email");
        return;
      }

      const result = sendReportToAccountEmail(reportState.id);

      if (result.report) {
        setReportState(result.report);
      }

      setFeedback(result.message);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The report email could not be sent."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAlternateEmail() {
    setPendingAction("alternate_email");
    setFeedback(null);

    try {
      if (persistenceMode === "database") {
        await handleDatabaseEmail("alternate_email", alternateEmail);
        setShowAlternateForm(false);
        return;
      }

      const result = sendReportToAlternateEmail(reportState.id, alternateEmail);

      if (result.report) {
        setReportState(result.report);
      }

      setFeedback(result.message);

      if (result.ok) {
        setShowAlternateForm(false);
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The report email could not be sent."
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="insight-label">Owned report actions</p>
          <p className="text-base leading-7 text-muted">
            Open, download, or send your saved report from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              snapshot.file.status === "ready"
                ? "success"
                : snapshot.file.status === "failed"
                  ? "outline"
                  : "accent"
            }
          >
            {snapshot.file.status === "ready"
              ? "PDF ready"
              : snapshot.file.status === "failed"
                ? "PDF needs retry"
                : "PDF processing"}
          </Badge>
          <Badge variant="outline">
            {snapshot.record.accessStatus === "membership_unlocked"
              ? "Membership library"
              : snapshot.record.accessStatus === "bundle_unlocked"
                ? "Bundle library"
                : "Owned library"}
          </Badge>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-[24px] border border-primary/18 bg-primary/[0.08] px-5 py-4 text-sm leading-7 text-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportActionCard
          title="View Full Report"
          description="Open the saved report from your private library."
          statusLabel="Available"
          icon={<ReportIcon className="h-5 w-5" />}
          emphasis="accent"
        >
          <div className="space-y-3">
            <Link
              href={reportState.viewUrl}
              className={buttonStyles({ size: "lg", className: "w-full" })}
            >
              Open Full Report
            </Link>
            <p className="text-xs leading-6 text-muted">
              Saved to dashboard {formatDateLabel(reportState.purchasedAt)}.
            </p>
          </div>
        </ReportActionCard>

        <ReportActionCard
          title="Download PDF"
          description={getPdfStatusNote(snapshot.file)}
          statusLabel={
            snapshot.file.status === "ready"
              ? "Ready"
              : snapshot.file.status === "failed"
                ? "Needs retry"
                : "Processing"
          }
          icon={<DownloadIcon className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={!canDownload || pendingAction === "download"}
              onClick={() => {
                void handleDownload();
              }}
            >
              {pendingAction === "download" ? "Preparing PDF..." : "Download PDF"}
            </Button>
            <p className="text-xs leading-6 text-muted">
              {snapshot.file.downloadCount > 0
                ? `${snapshot.file.downloadCount} download${snapshot.file.downloadCount === 1 ? "" : "s"} so far. Last download ${formatDateLabel(snapshot.file.lastDownloadedAt)}.`
                : "Download available here as soon as the PDF is ready."}
            </p>
          </div>
        </ReportActionCard>

        <ReportActionCard
          title="Email To Account"
          description={
            accountDelivery
              ? getEmailDeliveryStatusNote(accountDelivery)
              : "Prepared for account-email delivery after purchase."
          }
          statusLabel={
            accountDelivery?.emailStatus === "sent"
              ? "Sent"
              : accountDelivery?.emailStatus === "queued"
                ? "Queued"
                : accountDelivery?.emailStatus === "failed"
                  ? "Needs retry"
                  : "Ready"
          }
          icon={<MailIcon className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={!canEmail || pendingAction === "account_email"}
              onClick={() => {
                void handleAccountEmail();
              }}
            >
              {pendingAction === "account_email"
                ? "Sending..."
                : accountDelivery?.emailStatus === "sent"
                  ? "Resend To Account Email"
                  : accountDelivery?.emailStatus === "failed"
                    ? "Retry Account Email"
                    : "Send To Account Email"}
            </Button>
            <p className="text-xs leading-6 text-muted">
              Sent to {accountEmailLabel}. Last sent {formatDateLabel(accountDelivery?.sentAt ?? null)}.
            </p>
          </div>
        </ReportActionCard>

        <ReportActionCard
          title="Send To Another Email"
          description={
            alternateDelivery?.recipientEmail
              ? `Last alternate delivery used ${alternateDelivery.recipientEmail}.`
              : "Use a second inbox without replacing the account delivery path."
          }
          statusLabel={
            alternateDelivery?.emailStatus === "sent"
              ? "Alternate sent"
              : alternateDelivery?.emailStatus === "failed"
                ? "Needs retry"
              : showAlternateForm
                ? "Preparing"
                : "Optional"
          }
          icon={<SendIcon className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {showAlternateForm ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={alternateEmail}
                  onChange={(event) => setAlternateEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={!canEmail || pendingAction === "alternate_email"}
                    onClick={() => {
                      void handleAlternateEmail();
                    }}
                  >
                    {pendingAction === "alternate_email" ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => setShowAlternateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={!canEmail || pendingAction === "alternate_email"}
                  onClick={() => setShowAlternateForm(true)}
                >
                  Send To Another Email
                </Button>
                <p className="text-xs leading-6 text-muted">
                  {alternateDelivery?.recipientEmail
                    ? `Last alternate send: ${alternateDelivery.recipientEmail}.`
                    : "Useful if you want a second inbox copy without changing your account email."}
                </p>
              </div>
            )}
          </div>
        </ReportActionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="surface-block px-4 py-4">
          <p className="insight-label">Library status</p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            Saved to your private report library and available whenever you return.
          </p>
        </div>
        <div className="surface-block px-4 py-4">
          <p className="insight-label">PDF status</p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            {snapshot.file.status === "ready"
              ? "PDF ready for download"
              : snapshot.file.status === "processing"
                ? "PDF is still being prepared"
                : "PDF needs a fresh retry"}
          </p>
        </div>
        <div className="surface-block px-4 py-4 lg:col-span-2">
          <p className="insight-label">Resend state</p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            {reportState.delivery.resendStatus === "resent"
              ? "Previously resent"
              : reportState.delivery.resendStatus === "available"
                ? "Ready if needed"
                : "Not requested yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
