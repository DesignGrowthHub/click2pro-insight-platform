"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/assessments", label: "Assessments" },
  { href: "/methodology", label: "Methodology" },
  { href: "/pricing", label: "Pricing" }
] as const;

type SiteHeaderClientProps = {
  isAuthenticated: boolean;
  accountLabel?: string | null;
};

export function SiteHeaderClient({
  isAuthenticated,
  accountLabel
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isAssessmentMode =
    Boolean(pathname?.startsWith("/assessments/")) && pathname?.endsWith("/take");
  const assessmentExitHref =
    isAssessmentMode && pathname ? pathname.replace(/\/take$/, "") : "/assessments";

  if (isAssessmentMode) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[linear-gradient(180deg,rgba(11,18,32,0.9),rgba(15,23,42,0.78))] shadow-[0_10px_26px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
        <Container className="py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <BrandLockup compact subtitle="Guided reflection" />
            </Link>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden md:inline-flex">
                Private guided reflection
              </Badge>
              <Link
                href={assessmentExitHref}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 text-sm font-semibold text-foreground hover:border-white/14 hover:bg-white/[0.04]"
              >
                Exit Assessment
              </Link>
            </div>
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[linear-gradient(180deg,rgba(11,18,32,0.94),rgba(15,23,42,0.8))] shadow-[0_10px_35px_rgba(2,6,23,0.32)] backdrop-blur-2xl">
      <Container className="py-3 sm:py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <BrandLockup subtitle="Premium behavioral insight experience" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex w-full gap-2 overflow-x-auto rounded-[22px] border border-white/10 bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:w-auto lg:flex-wrap">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground",
                    pathname === link.href && "border-white/10 bg-white/[0.05] text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    "rounded-full border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground",
                    pathname === "/dashboard" && "border-white/10 bg-white/[0.05] text-foreground"
                  )}
                >
                  My Reports
                </Link>
              ) : null}
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isAuthenticated ? (
                <>
                  <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-sm font-medium text-muted">
                    {accountLabel ?? "Signed in"}
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut({ callbackUrl: "/" })}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] px-5 text-base font-semibold text-foreground hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    Log Out
                  </button>
                  <LinkButton href="/dashboard" size="lg" className="w-full sm:w-auto">
                    View My Reports
                  </LinkButton>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] px-5 text-base font-semibold text-foreground hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    Log In
                  </Link>
                  <LinkButton href="/assessments" size="lg" className="w-full sm:w-auto">
                    Start Assessment
                  </LinkButton>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
