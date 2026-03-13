import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryIcon } from "@/components/ui/icons";
import type { OwnedBundle } from "@/lib/commerce/types";

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

type OwnedBundleCardProps = {
  bundle: OwnedBundle;
};

export function OwnedBundleCard({ bundle }: OwnedBundleCardProps) {
  return (
    <Card variant="raised" className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary shadow-[0_16px_32px_rgba(59,130,246,0.16)]">
            <LibraryIcon className="h-5 w-5" />
          </span>
          <Badge variant={bundle.accessStatus === "active" ? "success" : "outline"}>
            {bundle.accessStatus === "active" ? "Active bundle" : "Queued bundle"}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Purchased bundle</Badge>
            <Badge variant="outline">{bundle.includedAssessmentSlugs.length} included topics</Badge>
          </div>
          <CardTitle className="text-[1.45rem] sm:text-[1.7rem]">{bundle.title}</CardTitle>
          <p className="body-md">{bundle.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Purchased</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {formatDateLabel(bundle.purchasedAt)}
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Bundle access</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              Custom bundle library
            </p>
          </div>
          <div className="surface-block px-4 py-4">
            <p className="insight-label">Primary route</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {bundle.primaryAssessmentSlug}
            </p>
          </div>
        </div>

        <div className="surface-block px-5 py-5">
          <p className="insight-label">Included assessments</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {bundle.includedAssessmentSlugs.map((slug) => (
              <Badge key={slug} variant="outline">
                {slug}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <LinkButton href={`/reports/${bundle.primaryAssessmentSlug}`} size="lg">
            Open Primary Report
          </LinkButton>
          <LinkButton href="/pricing" variant="outline" size="lg">
            Explore Membership
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
