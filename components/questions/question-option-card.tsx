import { cn } from "@/lib/utils";

type QuestionOptionCardProps = {
  index: number;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
};

export function QuestionOptionCard({
  index,
  label,
  description,
  selected,
  onSelect
}: QuestionOptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "assessment-option-card group relative flex min-h-[118px] w-full overflow-hidden rounded-[22px] border px-4 py-4.5 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-[126px] sm:px-5 sm:py-5",
        selected
          ? "border-primary/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.16),rgba(59,130,246,0.07))] shadow-[0_22px_48px_rgba(59,130,246,0.14)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.014))] hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.045] hover:shadow-[0_16px_34px_rgba(2,6,23,0.18)]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent",
          selected && "via-primary/30"
        )}
      />
      <div className="flex min-h-full w-full items-start gap-3.5">
        <span
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border text-sm font-semibold transition-colors duration-300",
            selected
              ? "border-primary/40 bg-primary/12 text-primary shadow-[0_0_0_7px_rgba(59,130,246,0.08)]"
              : "border-white/10 bg-white/[0.04] text-muted"
          )}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 self-center">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p
                className="font-semibold leading-7 text-[1rem] text-foreground/95 sm:text-[1.02rem]"
              >
                {label}
              </p>
              {description ? (
                <p className="text-sm leading-6 text-muted/95 sm:text-[0.95rem] sm:leading-7">
                  {description}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                selected
                  ? "border-primary/45 bg-primary/14"
                  : "border-white/12 bg-white/[0.03]"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  selected ? "bg-primary shadow-[0_0_14px_rgba(59,130,246,0.42)]" : "bg-transparent"
                )}
              />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
