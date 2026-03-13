import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthConfigured } from "@/lib/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import {
  isReportContinuationPath,
  sanitizeProfileNextPath
} from "@/lib/profile/completion";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
      badgeLabel={isReportContinuation ? "Continue to your report" : "Account access"}
      title={
        isReportContinuation
          ? "Sign in to continue to your saved report."
          : "Log in to open your saved reports."
      }
      description={
        isReportContinuation
          ? "Your payment is already attached to the right account path. Sign in once and continue directly into the saved report."
          : "Use your account to keep report access, delivery options, and future insight history in one private library."
      }
      supportTitle={isReportContinuation ? "Next step" : "What stays in your library"}
      supportBody={
        isReportContinuation
          ? "If this checkout email already belongs to you, signing in is the fastest way back into the purchased report."
          : "Purchased reports, account delivery actions, and future access stay attached to the same private account."
      }
      supportPoints={
        isReportContinuation
          ? [
              "Open the purchased report immediately after sign-in.",
              "Keep your access attached to the same checkout email.",
              "Reset your password if you no longer remember it."
            ]
          : [
              "Saved reports stay available any time you return.",
              "Delivery actions remain attached to the same account.",
              "Future purchases stay in one private library."
            ]
      }
      providerSlot={
        googleConfigured ? (
          <GoogleSignInButton callbackUrl={safeCallbackUrl} mode="login" />
        ) : null
      }
    >
      <LoginForm />
    </AuthPageShell>
  );
}
