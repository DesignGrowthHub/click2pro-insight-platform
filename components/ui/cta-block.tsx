import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CtaBlockProps = {
  title: string;
  description: string;
  actions: ReactNode;
  eyebrow?: string;
  aside?: string;
  className?: string;
};

export function CtaBlock({
  title,
  description,
  actions,
  eyebrow,
  aside,
  className
}: CtaBlockProps) {
  return (
    <Card
      variant="raised"
      className={cn(
        "panel-grid overflow-hidden border-primary/20 bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,24,39,0.92))]",
        className
      )}
    >
      <CardHeader className="space-y-5">
        {eyebrow ? <Badge variant="accent">{eyebrow}</Badge> : null}
        <CardTitle className="max-w-3xl text-[2.1rem] sm:text-[2.55rem]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div className="space-y-6">
          <p className="body-lg reading-column-tight max-w-2xl">{description}</p>
          <div className="subtle-divider max-w-2xl" />
          <p className="max-w-2xl text-base leading-8 text-muted">
            Reports stay private, remain visible in the dashboard, and are
            structured to support later download, delivery, and deeper follow-up
            insight without changing the core experience.
          </p>
        </div>
        <div className="surface-block-strong p-5 sm:p-6">
          <p className="insight-label">Next step</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">{actions}</div>
          {aside ? <p className="mt-4 text-sm leading-7 text-muted">{aside}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
