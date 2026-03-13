import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";

type AuthPageShellProps = {
  badgeLabel: string;
  title: string;
  description: string;
  supportTitle: string;
  supportBody: string;
  supportPoints: string[];
  children: ReactNode;
  providerSlot?: ReactNode;
};

export function AuthPageShell({
  badgeLabel,
  title,
  description,
  supportTitle,
  supportBody,
  supportPoints,
  children,
  providerSlot
}: AuthPageShellProps) {
  return (
    <main>
      <SectionShell className="pb-10 pt-8 sm:pb-12 sm:pt-12 lg:pt-14">
        <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <section className="space-y-5 lg:sticky lg:top-24">
            <div className="space-y-4">
              <Badge variant="outline">{badgeLabel}</Badge>
              <div className="space-y-3">
                <h1 className="text-balance text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[2.6rem]">
                  {title}
                </h1>
                <p className="max-w-xl text-base leading-8 text-muted sm:text-[1.05rem]">
                  {description}
                </p>
              </div>
            </div>

            <div className="surface-block-strong space-y-4 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="insight-label">{supportTitle}</p>
                <p className="text-sm leading-7 text-muted">{supportBody}</p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
                {supportPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[18px] border border-border/60 bg-surface-elevated px-4 py-3 text-sm leading-6 text-secondary"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Card variant="raised" className="overflow-hidden">
            <CardContent className="space-y-5 px-5 py-5 sm:px-7 sm:py-7">
              {providerSlot}
              {children}
            </CardContent>
          </Card>
        </div>
      </SectionShell>
    </main>
  );
}
