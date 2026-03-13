import { LimitationsNote } from "@/components/credibility/limitations-note";
import { MethodologyOverview } from "@/components/credibility/methodology-overview";
import { PatternAnalysisExplainer } from "@/components/credibility/pattern-analysis-explainer";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "@/components/ui/section-shell";

export default function MethodologyPage() {
  return (
    <main>
      <SectionShell className="pb-6 pt-10 sm:pt-14">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">Methodology</Badge>
            <Badge variant="outline">Structured insight approach</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="page-title max-w-4xl">
              How the assessments and reports are structured
            </h1>
            <p className="body-md reading-column-tight max-w-3xl">
              Click2Pro Insight Platform uses structured behavioral questions,
              multi-dimension scoring, and pattern interpretation to generate a
              readable insight report. The aim is reflection and clarity, not diagnosis.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="How it works"
        title="The same structure carries from the question flow into the report."
        description="Questions surface recurring signals, scoring organizes them into dimensions, and the report turns the clearest combinations into a calmer interpretation."
        variant="subtle"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.96fr]">
          <MethodologyOverview compact />
          <div className="grid gap-4">
            <PatternAnalysisExplainer compact />
            <LimitationsNote
              compact
              description="The reports are meant for self-reflection and pattern recognition. They are useful when they help you read a recurring tendency more clearly, not when they try to act like certainty."
            />
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
