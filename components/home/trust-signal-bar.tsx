import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AssessmentIcon,
  InsightIcon,
  ReportIcon,
  ShieldIcon
} from "@/components/ui/icons";
import { homepageTrustBar } from "@/lib/site-content";

const trustIcons = [ShieldIcon, AssessmentIcon, InsightIcon, ReportIcon];

export function TrustSignalBar() {
  return (
    <section className="pb-8 sm:pb-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">Trust signals</Badge>
          <p className="text-sm leading-7 text-muted">
            A quieter explanation of what makes the platform feel structured, private, and credible.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          {homepageTrustBar.map((item, index) => {
            const Icon = trustIcons[index] ?? InsightIcon;

            return (
              <Card key={item.label} className="h-full">
                <CardContent className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-foreground/80">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold leading-7 text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm leading-7 text-muted">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
