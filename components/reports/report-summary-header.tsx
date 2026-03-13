import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import type { PremiumReport } from "@/lib/types/assessment-domain";

type ReportSummaryHeaderProps = {
  report: PremiumReport;
  assessmentTitle?: string;
  liveSession?: boolean;
  isUnlocked?: boolean;
  generatedAt?: string | null;
  viewerProfile?: {
    displayName: string;
    primaryConcern: string | null;
    contextLine: string;
  } | null;
};

function formatGeneratedDate(value: string | null | undefined) {
  if (!value) {
    return "Saved to your report library";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function ReportSummaryHeader({
  report,
  assessmentTitle,
  liveSession = false,
  isUnlocked = false,
  generatedAt = null,
  viewerProfile = null
}: ReportSummaryHeaderProps) {
  const readingPath = report.sections.slice(0, 5);
  const executiveSummary =
    report.previewInsights[0]?.body ??
    report.patternClusters[0]?.description ??
    "The strongest signals point to one pattern carrying more emotional weight than it may appear to on the surface.";

  if (isUnlocked) {
    return (
      <header className="space-y-6 border-b border-white/8 pb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/90">
            <span>Full report access</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
            <span>{assessmentTitle ?? report.assessmentTitle}</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
            <span>{formatGeneratedDate(generatedAt)}</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
            <span>Saved to your report library</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-[2.85rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-[3.15rem] lg:text-[3.35rem]">
              {report.summaryTitle}
            </h1>
            {viewerProfile ? (
              <div className="space-y-1.5 text-[13px] leading-6 text-foreground/68">
                <p>
                  Prepared for{" "}
                  <span className="font-semibold text-foreground/88">
                    {viewerProfile.displayName}
                  </span>
                </p>
                {viewerProfile.primaryConcern ? (
                  <p>Primary concern: {viewerProfile.primaryConcern}</p>
                ) : null}
                {viewerProfile.contextLine ? <p>{viewerProfile.contextLine}</p> : null}
              </div>
            ) : null}
            <p className="max-w-[76ch] text-[17px] leading-[1.78] text-foreground/92">
              {report.summaryNarrative}
            </p>
            <p className="max-w-[70ch] text-[15px] leading-7 text-foreground/72">
              {report.subtitle}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/90">
              Executive summary
            </p>
            <p className="max-w-[74ch] text-[1.2rem] font-semibold leading-[1.55] tracking-[-0.02em] text-foreground">
              {report.summaryLabel}
            </p>
            <p className="max-w-[72ch] text-[15px] leading-[1.82] text-foreground/78">
              {report.summaryDescriptor}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.025] px-5 py-5 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/90">
              Chapter path
            </p>
            <div className="mt-4 space-y-3">
              {readingPath.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-start gap-3 border-b border-white/6 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-6 text-foreground">
                      {section.title}
                    </p>
                    <p className="text-sm leading-6 text-foreground/68">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <LinkButton href="#actions" size="sm">
            Download PDF
          </LinkButton>
          <LinkButton href="#actions" variant="outline" size="sm">
            Email Report
          </LinkButton>
          <LinkButton href="/dashboard" variant="ghost" size="sm">
            Open Report Library
          </LinkButton>
        </div>
      </header>
    );
  }

  return (
    <header className="space-y-5 border-b border-white/10 pb-7">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={isUnlocked ? "accent" : "success"}
            className="whitespace-nowrap px-3 py-1.5 tracking-[0.14em]"
          >
            {isUnlocked
              ? "Full report access"
              : liveSession
                ? "Latest completed session"
                : "Report preview"}
          </Badge>
          {isUnlocked ? (
            <Badge variant="outline" className="whitespace-nowrap px-3 py-1.5 tracking-[0.14em]">
              Private report saved
            </Badge>
          ) : null}
          <Badge
            variant="outline"
            className="max-w-full whitespace-nowrap px-3 py-1.5 tracking-[0.12em]"
          >
            {report.summaryLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)] lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.02em] text-muted">
            {assessmentTitle ?? report.assessmentTitle}
          </p>
          <h1 className="text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-[3rem] lg:text-[3.15rem]">
            {report.summaryTitle}
          </h1>
          <p className="max-w-5xl text-[1.02rem] leading-[1.72] text-foreground/94">
            {report.summaryNarrative}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-7 text-muted">
            <span>{formatGeneratedDate(generatedAt)}</span>
            {isUnlocked ? <span>Saved to your report library</span> : null}
          </div>
          <p className="max-w-3xl text-sm leading-7 text-foreground/72">
            {isUnlocked
              ? "Saved privately to your account. Read it now, return later, or download it when you need it."
              : liveSession
                ? "Built from your latest completed assessment session."
                : "Structured as a layered insight document rather than a simple result summary."}
          </p>
          {isUnlocked ? (
            <div className="flex flex-wrap gap-3">
              <LinkButton href="#actions" size="sm">
                Download PDF
              </LinkButton>
              <LinkButton href="#actions" variant="outline" size="sm">
                Email Report
              </LinkButton>
              <LinkButton href="/dashboard" variant="ghost" size="sm">
                Open Report Library
              </LinkButton>
            </div>
          ) : null}

          <div className="space-y-3 pt-1">
            <div className="report-paper p-5 sm:p-6">
              <p className="insight-label">Executive summary</p>
              <p className="mt-3 text-[1.18rem] font-semibold leading-8 text-foreground">
                {report.summaryLabel}
              </p>
              <p className="mt-4 reading-column document-copy">{executiveSummary}</p>
              <p className="mt-4 reading-column text-sm leading-7 text-foreground/72">
                {report.patternClusters[0]?.description ?? report.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="surface-block-strong px-5 py-5 sm:px-6 sm:py-6">
          <p className="insight-label">How this report unfolds</p>
          <div className="mt-4 space-y-3">
            {readingPath.map((section, index) => (
              <div
                key={section.id}
                className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3.5"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-6 text-foreground">
                    {section.title}
                  </p>
                  <p className="text-sm leading-6 text-muted">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
