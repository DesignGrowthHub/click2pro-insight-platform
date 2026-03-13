import { getCurrentUser } from "@/lib/auth/session";

import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { HeaderAccountLabel } from "@/components/ui/header-account-label";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <SiteHeaderClient
      isAuthenticated={Boolean(currentUser)}
      accountLabel={
        currentUser
          ? HeaderAccountLabel({
              email: currentUser.email,
              fullName: currentUser.fullName
            })
          : null
      }
    />
  );
}
