import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon, ReportIcon } from "@/components/ui/icons";
import type { ComposedReportSection } from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

type ReportSectionCardProps = {
  section: ComposedReportSection;
  unlocked?: boolean;
  index?: number;
  chapterLabel?: string;
};

function generationModeLabel(mode: ComposedReportSection["generationMode"]) {
  if (mode === "deterministic") {
    return "Scored";
  }

  if (mode === "hybrid") {
    return "Layered";
  }

  return "Narrative-ready";
}

function normalizeBlockText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function ReportSectionCard({
  section,
  unlocked = false,
  index,
  chapterLabel
}: ReportSectionCardProps) {
  const wasPremium = section.state === "locked";
  const isLocked = wasPremium && !unlocked;
  const badgeLabel = unlocked && wasPremium ? "Unlocked premium" : isLocked ? "Premium" : "Preview";
  const visibleBlocks = section.blocks.filter(
    (block) => block.visibility !== "full_report_only" || unlocked
  );
  const previewBlockLabels =
    (visibleBlocks.map((block) => block.label).filter(Boolean) as string[]).slice(0, 4);
  const lockedBlockLabels = previewBlockLabels.length
    ? previewBlockLabels
    : ["Deeper interpretation", "Practical context", "Stability guidance"];
  const signalBlocks = visibleBlocks.filter((block) => block.type === "signal_grid");
  const bulletBlocks = visibleBlocks.filter((block) => block.type === "bullet_list");
  const narrativeBlocks = visibleBlocks.filter(
    (block) =>
      block.type === "paragraph" ||
      block.type === "callout" ||
      block.type === "ai_placeholder"
  );
  const interpretationParagraphs = [
    section.overview,
    ...narrativeBlocks.map((block) => block.content).filter(Boolean)
  ]
    .filter(hasText)
    .filter((item, itemIndex, array) => {
      const normalized = normalizeBlockText(item);
      return array.findIndex((candidate) => normalizeBlockText(candidate) === normalized) === itemIndex;
    })
    .slice(0, 2);
  const behavioralExamples = bulletBlocks
    .flatMap((block) => block.items ?? [])
    .filter(hasText)
    .filter((item, itemIndex, array) => array.indexOf(item) === itemIndex)
    .slice(0, 4);
  const chapterHeading = chapterLabel ?? section.title;
  const chapterMeta = unlocked && wasPremium ? "Unlocked premium section" : "Scored section";
  const realWorldSummary =
    normalizeBlockText(section.previewTeaser) === normalizeBlockText(section.sectionIntro)
      ? null
      : section.previewTeaser;

  if (!isLocked) {
    return (
      <article className="space-y-8 overflow-hidden">
        <header className="space-y-3 border-b border-white/8 pb-6">
          {typeof index === "number" ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400/95">
              {`Chapter ${String(index + 1).padStart(2, "0")}`}
            </p>
          ) : null}
          <div className="space-y-2">
            <h3 className="text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-[1.95rem] lg:text-[2rem]">
              {chapterHeading}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-6 text-foreground/78">
              <span>{chapterMeta}</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/18 sm:inline-block" />
              <span>{generationModeLabel(section.generationMode)}</span>
            </div>
            <p className="max-w-4xl text-[1.02rem] leading-8 text-foreground/72">
              {section.description}
            </p>
          </div>
        </header>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/64">
              Key mechanism
            </p>
            <p className="max-w-[68ch] text-[1rem] leading-[1.75] text-foreground/94">
              {section.sectionIntro}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/64">
              Real-world expression
            </p>
            {realWorldSummary ? (
              <p className="max-w-[68ch] text-[1rem] leading-[1.75] text-foreground/94">
                {realWorldSummary}
              </p>
            ) : null}
            {behavioralExamples.length > 0 ? (
              <div className="grid gap-[18px] md:grid-cols-2">
                {behavioralExamples.map((item) => (
                  <div
                    key={item}
                    className="min-h-[120px] rounded-[18px] border border-white/8 bg-white/[0.03] px-[22px] py-5 text-[15px] leading-[1.65] text-foreground/92"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 border-t border-white/6 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/64">
              Interpretation
            </p>
            <div className="max-w-[68ch] space-y-[22px]">
              {interpretationParagraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${paragraph}-${paragraphIndex}`}
                  className="text-[1rem] leading-[1.75] text-foreground/94"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {signalBlocks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {signalBlocks.flatMap((block) => block.metrics ?? []).map((metric) => (
                <div key={metric.label} className="metric-tile">
                  <p className="insight-label">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <Card
      className={cn(
        "h-full overflow-hidden",
        isLocked
          ? "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(10,14,24,0.96))]"
          : unlocked && wasPremium
            ? "border-primary/18 bg-[linear-gradient(180deg,rgba(59,130,246,0.1),rgba(17,24,39,0.94))]"
            : unlocked
              ? "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(13,18,30,0.96))]"
              : "border-success/18 bg-[linear-gradient(180deg,rgba(34,197,94,0.06),rgba(255,255,255,0.02))]"
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {typeof index === "number" ? (
              <Badge variant="outline">{`Section ${String(index + 1).padStart(2, "0")}`}</Badge>
            ) : null}
            <Badge variant={unlocked && wasPremium ? "accent" : isLocked ? "accent" : "success"}>
              {badgeLabel}
            </Badge>
            <Badge variant="outline">{generationModeLabel(section.generationMode)}</Badge>
          </div>
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              isLocked
                ? "border-white/10 bg-white/[0.04] text-foreground"
                : unlocked && wasPremium
                  ? "border-primary/18 bg-primary/10 text-primary"
                  : "border-success/18 bg-success/10 text-success"
            )}
          >
            {isLocked ? <LockIcon className="h-4 w-4" /> : <ReportIcon className="h-4 w-4" />}
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-[1.35rem] leading-[1.15]">{section.title}</CardTitle>
          <p className="max-w-3xl text-sm leading-7 text-muted">{section.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLocked ? (
          <>
            <div className="surface-block-strong px-5 py-5">
              <p className="insight-label">What unlock adds</p>
              <p className="mt-3 reading-column text-base leading-8 text-foreground">
                {section.previewTeaser}
              </p>
            </div>

            <div className="surface-block px-4 py-4">
              <p className="insight-label">Section focus</p>
              <p className="mt-3 reading-column text-base leading-8 text-foreground">
                {section.description}
              </p>
            </div>

            <div className="report-paper relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/44 to-background/95" />
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
              <div className="relative z-10 space-y-3">
                {lockedBlockLabels.map((label) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                      {label}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-4/5 rounded-full bg-white/10" />
                      <div className="h-3 w-full rounded-full bg-white/10" />
                      <div className="h-3 w-3/5 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div />
        )}
      </CardContent>
    </Card>
  );
}
