import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProgressStep = {
  label: string;
  status: "complete" | "current" | "upcoming";
};

type ProgressIndicatorProps = {
  steps: ProgressStep[];
  className?: string;
};

export function ProgressIndicator({
  steps,
  className
}: ProgressIndicatorProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <Badge variant="outline">Flow</Badge>
        <span className="text-base text-muted">Assessment to report progression</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="surface-block flex min-h-[92px] items-center gap-4 px-4 py-4 sm:px-5"
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                step.status === "complete" &&
                  "bg-success/18 text-success ring-1 ring-success/25",
                step.status === "current" &&
                  "bg-primary/16 text-primary ring-1 ring-primary/25 shadow-[0_0_0_6px_rgba(59,130,246,0.08)]",
                step.status === "upcoming" &&
                  "bg-white/[0.05] text-muted ring-1 ring-white/8"
              )}
            >
              {index + 1}
            </span>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">{step.label}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                {step.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
