import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ProfileCompletionForm } from "@/components/profile/profile-completion-form";
import { getCurrentUser } from "@/lib/auth/session";
import { buildProfileCompletionUrl, sanitizeProfileNextPath } from "@/lib/profile/completion";
import { profileNeedsCompletion } from "@/lib/server/services/users";

type ProfileCompletionPageProps = {
  searchParams?: Promise<{
    next?: string;
    force?: string;
  }>;
};

export default async function ProfileCompletionPage({
  searchParams
}: ProfileCompletionPageProps) {
  const currentUser = await getCurrentUser();
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = sanitizeProfileNextPath(
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/dashboard"
  );
  const forceOpen = resolvedSearchParams.force === "1";

  if (!currentUser) {
    redirect(`/login?callbackUrl=${encodeURIComponent(buildProfileCompletionUrl(nextPath, forceOpen))}`);
  }

  if (forceOpen && currentUser.profileCompleted) {
    redirect(nextPath);
  }

  if (!forceOpen && !profileNeedsCompletion(currentUser)) {
    redirect(nextPath);
  }

  return (
    <AuthPageShell
      badgeLabel="Profile completion"
      title={
        forceOpen
          ? "Complete a short profile to open your saved report."
          : "Complete a short profile so your reports feel more personal."
      }
      description={
        forceOpen
          ? "This takes less than a minute. Once it is saved, we will continue straight to the unlocked report."
          : "This takes less than a minute and helps the dashboard, report metadata, and future personalization feel more relevant to your situation."
      }
      supportTitle={forceOpen ? "Why this step appears now" : "What this improves"}
      supportBody={
        forceOpen
          ? "We only use what you actually save here. This short step completes the context attached to the unlocked report."
          : "We only use what you actually save here. If you skip, your reports still work and remain private."
      }
      supportPoints={
        forceOpen
          ? [
              "Adds real context to the report and PDF you just unlocked.",
              "Keeps your saved report easier to revisit later.",
              "Only uses the information you choose to save here."
            ]
          : [
              "Adds real context to your saved reports and PDF.",
              "Makes the dashboard feel more personal and easier to scan.",
              "Keeps future insight recommendations grounded in your stated concern."
            ]
      }
    >
      <ProfileCompletionForm
        initialValues={{
          fullName: currentUser.fullName ?? "",
          preferredName: currentUser.preferredName ?? "",
          ageRange: currentUser.ageRange ?? "",
          country: currentUser.country ?? "",
          region: currentUser.region ?? "",
          occupationOrLifeStage: currentUser.occupationOrLifeStage ?? "",
          primaryConcern: currentUser.primaryConcern ?? "",
          profileCompleted: currentUser.profileCompleted
        }}
        nextPath={nextPath}
        requireCompletion={forceOpen}
      />
    </AuthPageShell>
  );
}
