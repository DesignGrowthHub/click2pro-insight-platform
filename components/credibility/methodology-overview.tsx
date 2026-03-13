import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { methodologySteps } from "@/lib/credibility-content";

type MethodologyOverviewProps = {
  compact?: boolean;
  showLink?: boolean;
  title?: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
};

export function MethodologyOverview({
  compact = false,
  showLink = false,
  title = "How the structured insight approach works",
  description = "The assessments organize responses into structured pattern signals, then turn those signals into a readable report designed for reflection and clarity.",
  linkHref = "/methodology",
  linkLabel = "Read The Methodology"
}: MethodologyOverviewProps) {
  const visibleSteps = methodologySteps;

  return (
    <Card variant="raised" className="h-full">
      <CardHeader className={compact ? "space-y-4" : "space-y-5"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline">Methodology</Badge>
          {showLink ? (
            <LinkButton href={linkHref} variant="outline" size="sm">
              {linkLabel}
            </LinkButton>
          ) : null}
        </div>
        <div className="space-y-3">
          <CardTitle
            className={
              compact ? "text-[1.35rem] sm:text-[1.45rem]" : "text-[1.7rem]"
            }
          >
            {title}
          </CardTitle>
          <p className={compact ? "body-sm" : "body-md"}>{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`grid ${compact ? "gap-2.5 sm:grid-cols-2" : "gap-3 lg:grid-cols-2"}`}
        >
          {visibleSteps.map((item) => (
            <div
              key={item.step}
              className={compact ? "surface-block px-4 py-3.5" : "surface-block px-4 py-4"}
            >
              <p className="insight-label">Step {item.step}</p>
              <p
                className={
                  compact
                    ? "mt-2 text-[0.96rem] font-semibold leading-6 text-foreground/92"
                    : "mt-3 text-base font-semibold leading-7 text-foreground/92"
                }
              >
                {item.title}
              </p>
              <p
                className={
                  compact
                    ? "mt-2 text-sm leading-6 text-muted"
                    : "mt-3 text-sm leading-7 text-muted"
                }
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
