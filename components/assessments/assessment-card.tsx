import Link from "next/link";

import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { AssessmentIcon, ClockIcon } from "@/components/ui/icons";
import { Assessment } from "@/lib/assessments";
import { cn } from "@/lib/utils";

type AssessmentCardProps = {
  assessment: Assessment;
  variant?: "compact" | "featured";
  className?: string;
};

export function AssessmentCard({
  assessment,
  variant = "compact",
  className
}: AssessmentCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Card
      hoverable
      variant={isFeatured ? "raised" : "default"}
      className={cn(
        "flex h-full flex-col",
        isFeatured &&
          "border-primary/18 bg-[linear-gradient(180deg,rgba(20,31,52,0.98),rgba(15,23,42,0.94))]",
        className
      )}
    >
      <CardHeader className={cn(isFeatured ? "space-y-4" : "space-y-3.5")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex items-center justify-center rounded-[18px] border border-primary/20 bg-primary/10 text-primary shadow-[0_16px_32px_rgba(59,130,246,0.16)]",
                isFeatured ? "h-11 w-11" : "h-10 w-10"
              )}
            >
              <AssessmentIcon className={cn(isFeatured ? "h-5 w-5" : "h-4.5 w-4.5")} />
            </div>
            <div className="space-y-1.5">
              <p className="insight-label">{assessment.category}</p>
              <CardTitle
                className={cn(
                  isFeatured ? "text-[1.45rem] sm:text-[1.62rem]" : "text-[1.16rem] sm:text-[1.28rem]"
                )}
              >
                <Link
                  href={`/assessments/${assessment.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {assessment.title}
                </Link>
              </CardTitle>
            </div>
          </div>
          {assessment.featured ? <Badge variant="outline">Featured</Badge> : null}
        </div>
        <p
          className={cn(
            "reading-column-tight text-[0.95rem] leading-7 text-muted",
            isFeatured && "text-[0.98rem] leading-7"
          )}
        >
          {assessment.descriptor}
        </p>

        <p className="text-sm leading-6 text-muted/90">
          {isFeatured ? assessment.tagline : assessment.outcomes[0]}
        </p>
      </CardHeader>
      <CardContent className="mt-auto flex items-end justify-between gap-4 pt-0">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted">
            <ClockIcon className="h-4 w-4 text-primary" />
            <span>{assessment.timeEstimate}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted/80">
            {isFeatured ? "Start here when this feels active" : "A clear starting point"}
          </p>
        </div>
        <LinkButton
          href={`/assessments/${assessment.slug}`}
          size={isFeatured ? "lg" : "md"}
          className="w-auto shrink-0"
        >
          Start Assessment
        </LinkButton>
      </CardContent>
    </Card>
  );
}
