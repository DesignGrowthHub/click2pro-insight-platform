import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { SignupForm } from "@/components/auth/signup-form";
import { isGoogleAuthConfigured } from "@/lib/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import {
  isReportContinuationPath,
  sanitizeProfileNextPath
} from "@/lib/profile/completion";

type SignupPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const currentUser = await getCurrentUser();
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : null;
  const safeCallbackUrl = sanitizeProfileNextPath(callbackUrl);
  const isReportContinuation = isReportContinuationPath(safeCallbackUrl);
  const googleConfigured = isGoogleAuthConfigured();

  if (currentUser) {
    redirect(safeCallbackUrl);
  }

  return (
    <AuthPageShell
      badgeLabel={isReportContinuation ? "Create account to continue" : "Create account"}
      title={
        isReportContinuation
          ? "Create your account and keep this report private."
          : "Create a private library for your reports."
      }
      description={
        isReportContinuation
          ? "Set up one secure account so the purchased report stays saved, easy to reopen, and attached to the same email."
          : "Create one account to keep report access, purchases, and future insight history in the same place."
      }
      supportTitle={isReportContinuation ? "What happens next" : "What you keep"}
      supportBody={
        isReportContinuation
          ? "If you reached this step after payment, account setup keeps the saved report attached to you instead of leaving it in a temporary checkout state."
          : "Your account keeps purchased reports, future access, and delivery actions organized in one calm private space."
      }
      supportPoints={
        isReportContinuation
          ? [
              "Claim the purchased report under one secure login.",
              "Return later without losing access.",
              "Use the same email you checked out with."
            ]
          : [
              "Save purchased reports in one private library.",
              "Keep delivery actions and future access together.",
              "Reopen insights any time without starting over."
            ]
      }
      providerSlot={
        googleConfigured ? (
          <GoogleSignInButton callbackUrl={safeCallbackUrl} mode="signup" />
        ) : null
      }
    >
      <SignupForm />
    </AuthPageShell>
  );
}
