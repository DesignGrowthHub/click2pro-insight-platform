import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportInterpretationPoints } from "@/lib/credibility-content";
import type { PremiumReport } from "@/lib/types/assessment-domain";

type ReportMethodologyCardProps = {
  report?: PremiumReport;
  title?: string;
  description?: string;
};

export function ReportMethodologyCard({
  report,
  title = "What the insight report represents",
  description = "The report combines structured responses, scored behavioral dimensions, pattern interactions, and layered interpretation so the result feels more coherent than a one-line summary."
}: ReportMethodologyCardProps) {
  return (
    <Card variant="raised" className="h-full">
      <CardHeader className="space-y-5">
        <Badge variant="outline">Report interpretation</Badge>
        <div className="space-y-3">
          <CardTitle className="text-[1.6rem]">{title}</CardTitle>
          <p className="body-md">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Data analyzed</p>
            <p className="mt-2 text-base font-semibold text-foreground/92">
              Structured responses, scored dimensions, and pattern clusters
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Interpretation approach</p>
            <p className="mt-2 text-base font-semibold text-foreground/92">
              Behavioral tendencies, friction areas, and context-sensitive reading
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Report structure</p>
            <p className="mt-2 text-base font-semibold text-foreground/92">
              Preview-safe summary first, deeper interpretation after unlock
            </p>
          </div>
        </div>

        {report ? (
          <div className="surface-block-strong p-5 sm:p-6">
            <p className="insight-label">How this report was prepared</p>
            <p className="mt-3 text-base leading-8 text-foreground">
              This report begins with structured scoring across multiple behavioral
              dimensions. Those scores are then organized into pattern summaries,
              tendency signals, friction areas, and deeper written sections.
              {report.aiNarrativeSections.length
                ? " The deeper interpretation layers stay tied to the same scored foundation rather than changing what your responses actually showed."
                : ""}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3">
          {reportInterpretationPoints.map((item) => (
            <div
              key={item}
              className="surface-block px-4 py-4 text-[0.98rem] leading-7 text-foreground/88"
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
