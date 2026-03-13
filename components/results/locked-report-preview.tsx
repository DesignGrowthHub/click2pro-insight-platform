import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PremiumReport } from "@/lib/types/assessment-domain";

type LockedReportPreviewProps = {
  report: PremiumReport;
};

export function LockedReportPreview({ report }: LockedReportPreviewProps) {
  const premiumSections = report.lockedSections;
  const visibleSections = premiumSections.slice(0, 4);

  return (
    <Card variant="raised" className="panel-grid h-full overflow-hidden preview-reveal">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Full insight report</Badge>
          <Badge variant="accent">Locked for now</Badge>
          <Badge variant="outline">{premiumSections.length} premium sections</Badge>
        </div>
        <CardTitle className="text-[1.65rem] leading-[1.08]">
          The full report turns this opening read into a deeper, more complete interpretation.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-muted">
          The preview confirms the fit. The locked sections are where the fuller interpretation, hidden friction, and steadier perspective begin to open up.
        </p>

        <div className="report-paper p-5 sm:p-6">
          <p className="insight-label">What the full report opens</p>
          <div className="mt-4 grid gap-3">
            {visibleSections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="insight-label">{`Section ${String(index + 1).padStart(2, "0")}`}</p>
                    <p className="text-sm font-semibold leading-7 text-foreground">
                      {section.title}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                    Premium
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {section.previewTeaser}
                </p>
              </div>
            ))}
          </div>
          {premiumSections.length > visibleSections.length ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              And {premiumSections.length - visibleSections.length} more sections in the full report
            </p>
          ) : null}
        </div>

        <div className="surface-block px-4 py-4 sm:px-5 sm:py-5">
          <p className="insight-label">Why the full report matters</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            It moves beyond recognition into interpretation, pressure points, hidden friction, and steadier guidance you can actually use.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <LinkButton href="#unlock-path" size="lg">
            {report.lockCtaLabel}
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
