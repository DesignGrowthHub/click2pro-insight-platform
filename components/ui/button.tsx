import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "border border-primary/50 bg-[linear-gradient(180deg,rgba(96,165,250,0.98),rgba(59,130,246,0.9))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_20px_48px_rgba(59,130,246,0.28)] hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_26px_58px_rgba(59,130,246,0.34)] active:translate-y-0 focus-visible:outline-primary",
  secondary:
    "border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.1] active:translate-y-0 focus-visible:outline-white/20",
  outline:
    "border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white/[0.06] active:translate-y-0 focus-visible:outline-primary",
  ghost:
    "bg-transparent text-muted hover:bg-white/[0.03] hover:text-foreground active:translate-y-0 focus-visible:outline-white/20",
  success:
    "border border-success/50 bg-[linear-gradient(180deg,rgba(74,222,128,0.98),rgba(34,197,94,0.9))] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(34,197,94,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(34,197,94,0.3)] active:translate-y-0 focus-visible:outline-success"
} as const;

const sizeStyles = {
  sm: "h-11 rounded-2xl px-4 text-sm",
  md: "h-12 rounded-2xl px-5 text-[0.98rem]",
  lg: "h-14 rounded-[20px] px-7 text-[1.02rem]",
  xl: "h-16 rounded-[22px] px-8 text-[1.08rem]"
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[-0.01em] backdrop-blur-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    children: ReactNode;
  };

export function Button({
  children,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = ButtonStyleOptions & {
  children: ReactNode;
  href: string;
};

export function LinkButton({
  children,
  className,
  href,
  size,
  variant
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonStyles({ variant, size, className })}>
      {children}
    </Link>
  );
}
