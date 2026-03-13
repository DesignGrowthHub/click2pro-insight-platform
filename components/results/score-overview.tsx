import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentResultProfile } from "@/lib/types/assessment-domain";

type ScoreOverviewProps = {
  resultProfile: AssessmentResultProfile;
  variant?: "preview" | "report";
};

function toSignalLine(text: string) {
  const normalized = text.trim();

  if (!normalized) {
    return "This signal showed up clearly across your responses.";
  }

  const sentence = normalized.split(".")[0]?.trim() ?? normalized;
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

export function ScoreOverview({
  resultProfile,
  variant = "report"
}: ScoreOverviewProps) {
  const topDimensions = [...resultProfile.dimensionScores]
    .sort((left, right) => right.normalizedScore - left.normalizedScore)
    .slice(0, 3);
  const isPreview = variant === "preview";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {isPreview ? "Top 3 signals" : "Strongest signals"}
          </Badge>
        </div>
        <CardTitle className="text-[1.5rem]">
          {isPreview
            ? "The clearest measured signals in your responses"
            : "Where the pattern is showing up most clearly"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {topDimensions.map((dimension) => (
            <div key={dimension.key} className="surface-block px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {dimension.label}
                  </p>
                </div>
                <p className="shrink-0 text-[1.3rem] font-semibold tracking-[-0.04em] text-foreground">
                  {dimension.normalizedScore}%
                </p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.9),rgba(96,165,250,0.95))]"
                  style={{ width: `${dimension.normalizedScore}%` }}
                />
              </div>
              {isPreview ? (
                <p className="mt-3 text-sm leading-6 text-muted">
                  {toSignalLine(dimension.interpretation)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
