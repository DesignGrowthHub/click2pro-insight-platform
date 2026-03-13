import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartIcon,
  ClockIcon,
  InsightIcon,
  LockIcon,
  ShieldIcon
} from "@/components/ui/icons";
import type { Assessment } from "@/lib/assessments";

type HeroPreviewPanelProps = {
  highlightedAssessments: Assessment[];
  previewAssessment: Assessment;
  previewContent: {
    title: string;
    summary: string;
    tendencies: string[];
    boundary: string;
  };
};

export function HeroPreviewPanel({
  highlightedAssessments,
  previewAssessment,
  previewContent
}: HeroPreviewPanelProps) {
  return (
    <Card
      variant="raised"
      className="panel-grid overflow-hidden border-primary/18 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(11,18,32,0.94))] reveal-soft reveal-soft-delay-1"
    >
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">Insight preview</Badge>
          <Badge variant="outline">{previewAssessment.timeEstimate}</Badge>
        </div>

        <div className="space-y-3">
          <CardTitle className="text-[1.75rem] leading-[1.06] sm:text-[2.1rem]">
            A short private assessment, then a clear preview before any deeper purchase decision.
          </CardTitle>
          <p className="body-sm reading-column-tight max-w-2xl">
            The opening read is meant to feel specific enough to trust, without
            turning the homepage into a long explanation.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {highlightedAssessments.map((assessment, index) => (
            <div
              key={assessment.slug}
              className={`rounded-[24px] border px-4 py-4 ${
                assessment.slug === previewAssessment.slug
                  ? "border-primary/25 bg-primary/[0.08] shadow-[0_18px_38px_rgba(59,130,246,0.12)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="insight-label">0{index + 1}</p>
              <p className="mt-3 text-[0.98rem] font-semibold leading-7 text-foreground/94">
                {assessment.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {assessment.category}
              </p>
            </div>
          ))}
        </div>

        <div className="report-paper p-5 sm:p-6">
          <div className="grid gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="insight-label">Preview report</p>
                <p className="text-[1.22rem] font-semibold leading-7 text-foreground/94">
                  {previewAssessment.title}
                </p>
                <p className="reading-column-tight text-[0.96rem] leading-7 text-muted">
                  {previewContent.summary}
                </p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
                <InsightIcon className="h-5 w-5" />
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-block px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ClockIcon className="h-4 w-4 text-primary" />
                  Time
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                  {previewAssessment.timeEstimate}
                </p>
              </div>
              <div className="surface-block px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ShieldIcon className="h-4 w-4 text-success" />
                  Privacy
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                  {previewAssessment.privacy}
                </p>
              </div>
            </div>

            <div className="grid gap-2.5">
              {previewContent.tendencies.map((item) => (
                <div
                  key={item}
                  className="surface-block px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.98rem] font-semibold leading-7 text-foreground/92">
                      {item}
                    </p>
                    <ChartIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(15,23,42,0.92))] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="insight-label">Full report</p>
                  <p className="mt-2 reading-column text-base leading-8 text-foreground">
                    {previewContent.boundary}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground">
                  <LockIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  "Pattern interpretation",
                  "Pressure points",
                  "Stability and clarity"
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground/80"
                    >
                      <span>{item}</span>
                      <LockIcon className="h-3.5 w-3.5 text-muted" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
