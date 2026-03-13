import { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const cardVariants = {
  default:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] shadow-[0_24px_60px_rgba(2,6,23,0.24)]",
  raised:
    "border-white/12 bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(17,24,39,0.94))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_28px_68px_rgba(2,6,23,0.32)]",
  muted:
    "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.014))]"
} as const;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: keyof typeof cardVariants;
};

export function Card({
  children,
  className,
  hoverable = false,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-[32px] border backdrop-blur-xl transition-all duration-300",
        cardVariants[variant],
        hoverable &&
          "hover:-translate-y-1 hover:border-primary/28 hover:shadow-[0_30px_74px_rgba(15,23,42,0.5)]",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-px rounded-[31px] border border-white/[0.03]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute -right-14 top-0 h-36 w-36 rounded-full bg-primary/[0.08] blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4 p-6 sm:p-8 lg:p-9", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[1.35rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[1.5rem]",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("body-md", className)}>{children}</p>;
}

export function CardContent({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 pb-6 sm:px-8 sm:pb-8 lg:px-9 lg:pb-9", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 px-7 pb-7 sm:px-8 sm:pb-8 lg:px-9 lg:pb-9",
        className
      )}
    >
      {children}
    </div>
  );
}
