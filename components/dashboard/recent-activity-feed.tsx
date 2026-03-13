import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentActivityItem } from "@/lib/commerce/types";

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

type RecentActivityFeedProps = {
  items: RecentActivityItem[];
};

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <Card variant="raised">
      <CardHeader className="space-y-5">
        <Badge variant="outline">Recent activity</Badge>
        <CardTitle className="text-[1.55rem]">
          Purchases, delivery steps, and library changes remain visible as account history.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="surface-block px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <Badge variant="outline">{formatDateLabel(item.occurredAt)}</Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
            {item.relatedSlug ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                {item.relatedSlug}
              </p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
