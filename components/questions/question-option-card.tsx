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
        "assessment-option-card group relative flex min-h-[84px] w-full overflow-hidden rounded-[20px] border px-4 py-3 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-[90px] sm:px-[1.125rem] sm:py-3.5",
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
      <div className="flex min-h-full w-full items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-[12px] border text-[0.82rem] font-semibold transition-colors duration-300 sm:h-9 sm:w-9",
            selected
              ? "border-primary/40 bg-primary/12 text-primary shadow-[0_0_0_7px_rgba(59,130,246,0.08)]"
              : "border-white/10 bg-white/[0.04] text-muted"
          )}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 self-center">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p
                className="font-semibold leading-[1.6] text-[0.98rem] text-foreground/95 sm:text-[1rem] sm:leading-[1.65]"
              >
                {label}
              </p>
              {description ? (
                <p className="text-[0.92rem] leading-6 text-muted/95 sm:text-[0.93rem] sm:leading-[1.65]">
                  {description}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "mt-0.5 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-5 sm:w-5",
                selected
                  ? "border-primary/45 bg-primary/14"
                  : "border-white/12 bg-white/[0.03]"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300 sm:h-2 sm:w-2",
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
