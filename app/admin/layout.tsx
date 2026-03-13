import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "@/components/ui/section-shell";
import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(user.email)) {
    notFound();
  }

  return (
    <main>
      <SectionShell className="pb-5 pt-8 sm:pb-6 sm:pt-10">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">Admin</Badge>
            <Badge variant="outline">{user.email}</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="page-title max-w-4xl">
              Real founder metrics across users, purchases, report ownership, and tracked assessment activity.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted">
              This admin surface is backed by current database records only. Metrics that cannot be computed truthfully from the current schema are intentionally omitted or marked unavailable.
            </p>
          </div>
          <AdminNav />
        </div>
      </SectionShell>
      {children}
    </main>
  );
}
