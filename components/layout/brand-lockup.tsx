import { BrandMarkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

export function BrandLockup({
  subtitle,
  compact = false,
  className
}: BrandLockupProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-[18px] border border-primary/25 bg-[linear-gradient(180deg,rgba(96,165,250,0.18),rgba(59,130,246,0.12))] text-primary shadow-[0_10px_24px_rgba(59,130,246,0.18)]",
          compact ? "h-10 w-10 rounded-[16px]" : "h-12 w-12"
        )}
      >
        <BrandMarkIcon className={compact ? "h-5 w-5" : "h-6 w-6"} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold tracking-tight text-foreground",
            compact ? "text-[0.98rem]" : "text-[1.02rem]"
          )}
        >
          Click2Pro Insight Platform
        </p>
        {subtitle ? (
          <p className="hidden text-sm text-muted sm:block">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
