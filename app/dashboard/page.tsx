import { redirect } from "next/navigation";

import { DashboardOwnershipExperience } from "@/components/dashboard/dashboard-ownership-experience";
import { getCurrentUser } from "@/lib/auth/session";
import {
  dashboardMembershipBenefits,
  dashboardOwnershipRecommendedInsights
} from "@/lib/commerce/seeded-state";
import { buildProfileCompletionUrl } from "@/lib/profile/completion";
import { profileNeedsCompletion } from "@/lib/server/services/users";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (profileNeedsCompletion(user)) {
    redirect(buildProfileCompletionUrl("/dashboard"));
  }

  return (
    <main>
      <DashboardOwnershipExperience
        currentUser={user}
        recommendedInsights={dashboardOwnershipRecommendedInsights}
        membershipBenefits={dashboardMembershipBenefits}
      />
    </main>
  );
}
