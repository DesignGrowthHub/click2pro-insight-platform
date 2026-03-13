import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon, ReportIcon } from "@/components/ui/icons";

type StateProps = {
  title: string;
  description: string;
};

export function ReportLibraryEmptyState({ title, description }: StateProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-foreground">
            <ReportIcon className="h-5 w-5" />
          </span>
          <Badge variant="outline">Empty state</Badge>
        </div>
        <CardTitle className="text-[1.45rem]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="body-md">{description}</p>
        <p className="text-sm leading-7 text-muted">
          After the first premium purchase, owned reports appear here with saved
          access, PDF readiness, and delivery controls.
        </p>
        <LinkButton href="/assessments" variant="outline" size="lg">
          Explore Assessment Library
        </LinkButton>
      </CardContent>
    </Card>
  );
}

export function ReportLibraryLoadingState({ title, description }: StateProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
            <ClockIcon className="h-5 w-5" />
          </span>
          <Badge variant="accent">Loading state</Badge>
        </div>
        <CardTitle className="text-[1.45rem]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="body-md">{description}</p>
        <p className="text-sm leading-7 text-muted">
          Use this state while report files, delivery history, and ownership
          records are hydrating from local or future server-backed storage.
        </p>
        <div className="space-y-3">
          <div className="state-skeleton h-4 w-2/3 rounded-full" />
          <div className="state-skeleton h-4 w-full rounded-full" />
          <div className="state-skeleton h-4 w-4/5 rounded-full" />
          <div className="surface-block state-skeleton h-16 px-4 py-4" />
        </div>
      </CardContent>
    </Card>
  );
}
