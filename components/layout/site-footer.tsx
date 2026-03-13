"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { Container } from "@/components/ui/container";
import { MailIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/public-contact";

export function SiteFooter() {
  const pathname = usePathname();
  const isAssessmentMode =
    Boolean(pathname?.startsWith("/assessments/")) && pathname?.endsWith("/take");
  const assessmentExitHref =
    isAssessmentMode && pathname ? pathname.replace(/\/take$/, "") : "/assessments";

  if (isAssessmentMode) {
    return (
      <footer className="border-t border-white/8 py-4 sm:py-5">
        <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-muted/90">
            Private guided reflection. Your progress stays with you while you move through the assessment.
          </p>
          <Link
            href={assessmentExitHref}
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Return to assessment overview
          </Link>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/8 py-10 sm:py-12">
      <Container className="space-y-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.45fr_0.55fr]">
          <div className="space-y-4">
            <BrandLockup subtitle="Private guided behavioral insight" />
            <p className="body-md max-w-2xl">
              A private guided insight experience on{" "}
              <span className="font-medium text-foreground">
                insight.click2pro.com
              </span>
              . Built for structured assessments, saved reports, and calmer
              personal clarity around recurring emotional and behavioral patterns.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                <MailIcon className="h-4 w-4 text-foreground/70" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">
                  {SUPPORT_EMAIL}
                </a>
              </span>
              <span>Private and confidential from the start.</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted">
            <p className="insight-label">Platform</p>
            <div className="grid gap-2">
              <Link href="/assessments" className="hover:text-foreground">
                Assessments
              </Link>
              <Link href="/methodology" className="hover:text-foreground">
                Methodology
              </Link>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Login
              </Link>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted">
            <p className="insight-label">Legal</p>
            <div className="grid gap-2">
              <Link href="/privacy-policy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="hover:text-foreground">
                Terms and Conditions
              </Link>
              <Link href="/cancellation-and-refund-policy" className="hover:text-foreground">
                Cancellation and Refund Policy
              </Link>
              <Link href="/support" className="hover:text-foreground">
                Contact / Support
              </Link>
            </div>
          </div>
        </div>
        <div className="subtle-divider" />
        <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Private assessments, structured reports, and one place to return to what you have already explored.
          </p>
          <p>© Click2Pro</p>
        </div>
      </Container>
    </footer>
  );
}
