import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { LockIcon, ReportIcon } from "@/components/ui/icons";
import { ReportSectionState } from "@/lib/assessments";
import { cn } from "@/lib/utils";

type ReportSectionPreviewProps = {
  title: string;
  description: string;
  state: ReportSectionState;
};

export function ReportSectionPreview({
  title,
  description,
  state
}: ReportSectionPreviewProps) {
  const isOpen = state === "open";

  return (
    <Card
      className={cn(
        "h-full",
        isOpen
          ? "border-success/15 bg-[linear-gradient(180deg,rgba(34,197,94,0.06),rgba(255,255,255,0.02))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(11,18,32,0.94))]"
      )}
    >
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={isOpen ? "success" : "outline"}>
            {isOpen ? "Preview Open" : "Full Report"}
          </Badge>
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              isOpen
                ? "border-success/20 bg-success/10 text-success"
                : "border-white/10 bg-white/[0.04] text-muted"
            )}
          >
            {isOpen ? <ReportIcon className="h-4 w-4" /> : <LockIcon className="h-4 w-4" />}
          </span>
        </div>
        <div className="space-y-3">
          <CardTitle className="text-[1.3rem]">{title}</CardTitle>
          <CardDescription className="text-base leading-8">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4">
          <p className="insight-label">
            {isOpen ? "Preview excerpt" : "Premium section"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            {isOpen
              ? "A concise interpretation appears here first so the preview feels substantive before checkout."
              : "This section is held back for the full report, where more specific interpretation and forward guidance can live."}
          </p>
        </div>
        <div
          className={cn(
            "report-paper relative p-5",
            !isOpen && "relative overflow-hidden"
          )}
        >
          {!isOpen ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-background/10 via-background/45 to-background/95 px-5 text-center backdrop-blur-[2px]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Unlock Required
              </p>
              <p className="max-w-[14rem] text-sm leading-6 text-muted">
                Deeper interpretation, triggers, and action framing live in the full report.
              </p>
            </div>
          ) : null}
          <div className={cn("space-y-4", !isOpen && "blur-[2px]")}>
            <div className="flex items-center justify-between gap-3">
              <p className="insight-label">Narrative analysis</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {isOpen ? "Visible" : "Locked"}
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-3 w-4/5 rounded-full bg-white/10" />
              <div className="h-3 w-full rounded-full bg-white/10" />
              <div className="h-3 w-2/3 rounded-full bg-white/10" />
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="h-3 w-1/3 rounded-full bg-white/10" />
              <div className="mt-4 h-16 rounded-[18px] bg-white/[0.03]" />
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {isOpen ? "Actionable readout included" : "Deeper guidance included"}
                </p>
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    isOpen ? "bg-success" : "bg-primary"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
