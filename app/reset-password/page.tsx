import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import {
  isReportContinuationPath,
  sanitizeProfileNextPath
} from "@/lib/profile/completion";
import { validatePasswordResetToken } from "@/lib/server/services/password-reset";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
    callbackUrl?: string;
  }>;
};

function buildInvalidState(reason: "missing" | "invalid" | "expired" | "used") {
  switch (reason) {
    case "missing":
      return {
        title: "This reset link is missing important information.",
        body: "Request a new password reset email and use the latest secure link."
      };
    case "expired":
      return {
        title: "This reset link has expired.",
        body: "For security, password reset links stay active for a limited time. Request a fresh one to continue."
      };
    case "used":
      return {
        title: "This reset link has already been used.",
        body: "If you still need to change your password, request a new reset email."
      };
    case "invalid":
    default:
      return {
        title: "This reset link is no longer valid.",
        body: "Request a fresh password reset email and use the latest link."
      };
  }
}

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const currentUser = await getCurrentUser();

  const resolvedSearchParams = (await searchParams) ?? {};
  const token = resolvedSearchParams.token ?? null;
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : null;
  const safeCallbackUrl = sanitizeProfileNextPath(callbackUrl);
  const isReportContinuation = isReportContinuationPath(callbackUrl);
  const validation = await validatePasswordResetToken(token);

  if (currentUser) {
    redirect(safeCallbackUrl);
  }

  if (!validation.ok) {
    const invalidState = buildInvalidState(validation.reason);

    return (
      <AuthPageShell
        badgeLabel="Reset unavailable"
        title={invalidState.title}
        description={invalidState.body}
        supportTitle="What to do next"
        supportBody="Request a fresh reset email and use the newest secure link. Older links are invalidated for safety."
        supportPoints={[
          "Reset links are one-time use.",
          "Expired links need a new request.",
          "Your saved reports stay attached to the same account."
        ]}
      >
        <Card variant="muted" className="border-0 bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">Reset unavailable</Badge>
            </div>
            <CardTitle className="sr-only">{invalidState.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-0 pb-0">
            <a
              href={
                callbackUrl
                  ? `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/forgot-password"
              }
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Request New Reset Link
            </a>
          </CardContent>
        </Card>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      badgeLabel="Choose a new password"
      title={
        isReportContinuation
          ? "Set your new password and continue to the saved report."
          : "Set a new password for your private report library."
      }
      description={
        isReportContinuation
          ? `This secure link is ready for ${validation.email}. Once you save a new password, you can sign in and continue directly to the report.`
          : `This secure link is ready for ${validation.email}. Choose a new password to continue.`
      }
      supportTitle="Secure reset step"
      supportBody="This step updates the account without changing your saved access. Purchased reports, delivery options, and future history stay attached to the same email."
      supportPoints={[
        "Use at least 8 characters.",
        "Your purchased access stays attached.",
        "After saving, you can sign in immediately."
      ]}
    >
      <ResetPasswordForm
        token={token ?? ""}
        emailLabel={validation.email}
        callbackUrl={callbackUrl}
      />
    </AuthPageShell>
  );
}
