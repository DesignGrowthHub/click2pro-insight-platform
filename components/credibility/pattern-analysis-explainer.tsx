import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { patternAnalysisPoints } from "@/lib/credibility-content";

type PatternAnalysisExplainerProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function PatternAnalysisExplainer({
  title = "How responses are interpreted",
  description = "The platform uses structured behavioral pattern analysis to evaluate multiple dimensions, look for repeated tendencies, and interpret how those tendencies combine.",
  compact = false
}: PatternAnalysisExplainerProps) {
  return (
    <Card className="h-full">
      <CardHeader className={compact ? "space-y-4" : "space-y-5"}>
        <Badge variant="outline">Pattern analysis</Badge>
        <div className="space-y-3">
          <CardTitle className={compact ? "text-[1.35rem]" : "text-[1.5rem]"}>
            {title}
          </CardTitle>
          <p className={compact ? "body-sm" : "body-md"}>{description}</p>
        </div>
      </CardHeader>
      <CardContent
        className={compact ? "grid gap-2.5 sm:grid-cols-2" : "space-y-3"}
      >
        {patternAnalysisPoints.map((item) => (
          <div
            key={item}
            className={
              compact
                ? "surface-block px-4 py-3.5 text-sm leading-6 text-foreground/88"
                : "surface-block px-4 py-4 text-[0.98rem] leading-7 text-foreground/88"
            }
          >
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
