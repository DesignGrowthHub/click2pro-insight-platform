import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  subtle: "bg-white/[0.05] text-muted ring-white/10",
  accent: "bg-primary/14 text-primary ring-primary/28 shadow-[0_10px_28px_rgba(59,130,246,0.12)]",
  success: "bg-success/14 text-success ring-success/28 shadow-[0_10px_28px_rgba(34,197,94,0.1)]",
  outline: "bg-white/[0.02] text-foreground ring-white/12"
} as const;

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof badgeVariants;
};

export function Badge({
  children,
  className,
  variant = "subtle"
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.19em] ring-1",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
