import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentIcon, ClockIcon } from "@/components/ui/icons";
import type { Assessment } from "@/lib/assessments";
import { cn } from "@/lib/utils";

type LaunchAssessmentCardProps = {
  assessment: Assessment;
  launchLabel: string;
  className?: string;
};

export function LaunchAssessmentCard({
  assessment,
  launchLabel,
  className
}: LaunchAssessmentCardProps) {
  return (
    <Card
      hoverable
      variant="raised"
      className={cn(
        "flex h-full flex-col border-primary/18 bg-[linear-gradient(180deg,rgba(20,31,52,0.98),rgba(15,23,42,0.94))]",
        className
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/20 bg-primary/10 text-primary shadow-[0_18px_36px_rgba(59,130,246,0.18)]">
              <AssessmentIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <p className="insight-label">{assessment.category}</p>
              <CardTitle className="text-[1.5rem] sm:text-[1.72rem]">
                <Link
                  href={`/assessments/${assessment.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {assessment.title}
                </Link>
              </CardTitle>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="accent">{launchLabel}</Badge>
            <Badge variant="outline">{assessment.questionCount}</Badge>
          </div>
        </div>

        <p className="reading-column-tight text-[0.98rem] leading-7 text-muted">
          {assessment.tagline}
        </p>
      </CardHeader>

      <CardContent className="mt-auto flex flex-1 flex-col justify-end gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
            <ClockIcon className="h-4 w-4 text-primary" />
            {assessment.timeEstimate}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
            {assessment.questionCount}
          </span>
        </div>

        <LinkButton
          href={`/assessments/${assessment.slug}`}
          size="xl"
          className="w-full"
        >
          Start Assessment
        </LinkButton>
      </CardContent>
    </Card>
  );
}
