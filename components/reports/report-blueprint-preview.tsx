import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightIcon, LockIcon, ReportIcon } from "@/components/ui/icons";
import type {
  AssessmentResultProfile,
  ReportBlueprint
} from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

type ReportBlueprintPreviewProps = {
  blueprint: ReportBlueprint;
  resultProfile?: AssessmentResultProfile | null;
  className?: string;
};

function generationModeLabel(mode: "deterministic" | "ai_ready" | "hybrid") {
  if (mode === "deterministic") {
    return "Structured";
  }

  if (mode === "hybrid") {
    return "Layered";
  }

  return "Prepared";
}

export function ReportBlueprintPreview({
  blueprint,
  resultProfile,
  className
}: ReportBlueprintPreviewProps) {
  return (
    <div className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3", className)}>
      {blueprint.sections.map((section) => {
        const isPreview = section.access === "preview";
        const isVisible =
          !resultProfile ||
          resultProfile.visiblePreviewSectionIds.includes(section.id) ||
          isPreview;

        return (
          <Card
            key={section.id}
            className={cn(
              "h-full",
              isPreview
                ? "border-success/14 bg-[linear-gradient(180deg,rgba(34,197,94,0.05),rgba(255,255,255,0.02))]"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,18,32,0.94))]"
            )}
          >
            <CardHeader className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isPreview ? "success" : "outline"}>
                    {isPreview ? "Preview" : "Premium"}
                  </Badge>
                  <Badge variant="outline">
                    {generationModeLabel(section.generationMode)}
                  </Badge>
                </div>
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border",
                    isPreview
                      ? "border-success/18 bg-success/10 text-success"
                      : "border-white/10 bg-white/[0.04] text-muted"
                  )}
                >
                  {isPreview ? (
                    <ReportIcon className="h-4 w-4" />
                  ) : (
                    <LockIcon className="h-4 w-4" />
                  )}
                </span>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-[1.25rem]">{section.title}</CardTitle>
                <p className="text-sm leading-7 text-muted">{section.description}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="surface-block px-4 py-4">
                <p className="insight-label">Narrative intent</p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  {section.narrativeIntent}
                </p>
              </div>
              <div className="report-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="insight-label">Section build state</p>
                  <InsightIcon
                    className={cn(
                      "h-4 w-4",
                      isPreview ? "text-success" : "text-primary"
                    )}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {isVisible
                    ? "Visible in the preview or early report reading."
                    : "Reserved for the paid report experience after unlock or membership access."}
                </p>
                <div className="mt-4 space-y-2">
                  {section.placeholderFocus.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-muted"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
