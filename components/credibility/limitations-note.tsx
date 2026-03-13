import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { limitationsPoints } from "@/lib/credibility-content";

type LimitationsNoteProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function LimitationsNote({
  title = "How to read these insights",
  description = "Transparency matters here. The report is meant to support clearer self-reflection and pattern recognition, not to replace professional care or make fixed claims.",
  compact = false
}: LimitationsNoteProps) {
  return (
    <Card className="h-full">
      <CardHeader className={compact ? "space-y-4" : "space-y-5"}>
        <Badge variant="outline">Limits and scope</Badge>
        <div className="space-y-3">
          <CardTitle className={compact ? "text-[1.3rem]" : "text-[1.45rem]"}>
            {title}
          </CardTitle>
          <p className={compact ? "body-sm" : "body-md"}>{description}</p>
        </div>
      </CardHeader>
      <CardContent className={compact ? "grid gap-2.5 sm:grid-cols-3" : "space-y-3"}>
        {limitationsPoints.map((item) => (
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
