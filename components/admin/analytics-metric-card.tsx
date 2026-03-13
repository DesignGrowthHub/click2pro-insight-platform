import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyticsMetricCardProps = {
  label: string;
  value: string;
  note: string;
  badge?: string;
  icon?: ReactNode;
};

export function AnalyticsMetricCard({
  label,
  value,
  note,
  badge = "Metric",
  icon
}: AnalyticsMetricCardProps) {
  return (
    <Card variant="raised" className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline">{badge}</Badge>
          {icon ? (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/18 bg-primary/10 text-primary shadow-[0_14px_28px_rgba(59,130,246,0.16)]">
              {icon}
            </span>
          ) : null}
        </div>
        <div className="space-y-3">
          <p className="executive-kicker">{label}</p>
          <CardTitle className="text-[2.2rem] sm:text-[2.5rem]">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
          <p className="text-sm leading-7 text-muted">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
