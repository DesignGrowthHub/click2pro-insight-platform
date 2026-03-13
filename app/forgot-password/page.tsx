import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser } from "@/lib/auth/session";
import {
  isReportContinuationPath,
  sanitizeProfileNextPath
} from "@/lib/profile/completion";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    callbackUrl?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const currentUser = await getCurrentUser();
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialEmail =
    typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : "";
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : null;
  const safeCallbackUrl = sanitizeProfileNextPath(callbackUrl);
  const isReportContinuation = isReportContinuationPath(callbackUrl);

  if (currentUser) {
    redirect(safeCallbackUrl);
  }

  return (
    <AuthPageShell
      badgeLabel="Password reset"
      title={
        isReportContinuation
          ? "Reset your password and continue to your saved report."
          : "Reset your password without losing access to your saved reports."
      }
      description={
        isReportContinuation
          ? "Use the same email from checkout or your existing account. Once your password is reset, you can sign in and continue directly to the saved report."
          : "Enter the email used for your account and we will send a secure reset link."
      }
      supportTitle="Secure reset link"
      supportBody={
        isReportContinuation
          ? "This reset flow keeps the post-payment path intact, so you can sign back in without losing the report that was just attached to your email."
          : "Reset links are one-time use, expire automatically, and help protect saved report access if you no longer remember your password."
      }
      supportPoints={[
        "Use the same email tied to your account or checkout.",
        "Reset links expire automatically for security.",
        "After reset, you can sign in and continue immediately."
      ]}
    >
      <ForgotPasswordForm
        initialEmail={initialEmail}
        callbackUrl={callbackUrl}
      />
    </AuthPageShell>
  );
}
