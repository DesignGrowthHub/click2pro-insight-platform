import { Badge } from "@/components/ui/badge";
import { InsightIcon } from "@/components/ui/icons";
import type {
  AIGeneratedNarrativeSection,
  SubscriptionFollowUpBlueprint
} from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

const aiNarrativeSections = [
  {
    title: "Personalized pattern interpretation",
    description:
      "Reserved for deeper personalized interpretation that connects the strongest tendencies, contradictions, and emotional patterns in one clearer read."
  },
  {
    title: "Context-sensitive insight",
    description:
      "Prepared for a more nuanced reading that changes emphasis based on topic, intensity, and likely situational triggers."
  },
  {
    title: "What this may look like in real life",
    description:
      "Prepared for concrete examples that translate abstract patterns into recognizable interpersonal, work, or self-talk moments."
  },
  {
    title: "Stability suggestions",
    description:
      "Reserved for calm, grounded next-step guidance that feels useful without shifting into diagnosis or therapy imitation."
  }
] as const;

type AiNarrativePreviewProps = {
  compact?: boolean;
  className?: string;
  showHeader?: boolean;
  sections?: AIGeneratedNarrativeSection[];
  followUpBlueprint?: SubscriptionFollowUpBlueprint;
};

export function AiNarrativePreview({
  compact = false,
  className,
  showHeader = true,
  sections,
  followUpBlueprint
}: AiNarrativePreviewProps) {
  const visibleSections = (
    sections?.length
      ? sections.map((section) => ({
          title: section.title,
          description: section.synopsis,
          detail:
            section.paragraphs[0] ??
            "Prepared for richer personalized interpretation when this section is expanded further."
        }))
      : aiNarrativeSections.map((section) => ({
          title: section.title,
          description: section.description,
          detail:
            "Prepared for richer personalized interpretation when this section is expanded further."
        }))
  ).slice(0, compact ? 2 : 4);

  return (
    <div className={cn("space-y-5", className)}>
      {showHeader ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge variant="accent">Deeper interpretation</Badge>
            <div className="space-y-2">
              <h3 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[1.7rem]">
                These reserved sections show how the report can deepen while staying tied to the same core pattern.
              </h3>
              <p className="body-md max-w-2xl">
                These sections show where deeper interpretation, real-life
                examples, and steadier guidance can extend the report while
                staying anchored to the same scored foundation.
              </p>
            </div>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/20 bg-primary/10 text-primary">
            <InsightIcon className="h-5 w-5" />
          </span>
        </div>
      ) : null}

      <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "lg:grid-cols-2")}>
        {visibleSections.map((section, index) => (
          <div
            key={section.title}
            className="surface-block relative overflow-hidden p-5 sm:p-6"
          >
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline">Section {index + 1}</Badge>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Prepared section
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <h4 className="text-[1.15rem] font-semibold leading-7 tracking-[-0.02em] text-foreground sm:text-[1.25rem]">
                {section.title}
              </h4>
              <p className="text-[0.98rem] leading-7 text-muted">
                {section.description}
              </p>
            </div>
            <div className="report-paper mt-5 p-4">
              <p className="insight-label">
                {sections?.length ? "Current section shape" : "Section outline"}
              </p>
              <p className="mt-3 text-[0.98rem] leading-7 text-foreground">
                {section.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {followUpBlueprint ? (
        <div className="surface-block-strong p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Subscriber follow-up layer</Badge>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Available later
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <h4 className="text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground">
              {followUpBlueprint.title}
            </h4>
            <p className="text-[0.98rem] leading-7 text-muted">
              {followUpBlueprint.description}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {followUpBlueprint.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <p className="text-sm font-semibold text-foreground">{module.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
