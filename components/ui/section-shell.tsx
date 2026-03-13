import { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "panel" | "subtle";
};

export function SectionShell({
  children,
  title,
  description,
  eyebrow,
  actions,
  className,
  contentClassName,
  variant = "default"
}: SectionShellProps) {
  const wrapperClassName =
    variant === "panel"
      ? "section-shell-panel panel-grid"
      : variant === "subtle"
        ? "section-shell-subtle"
        : "";

  const content = (
    <>
      {(eyebrow || title || description || actions) && (
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="section-title">{title}</h2> : null}
            {description ? (
              <p className="body-lg reading-column-tight max-w-2xl">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0 md:pt-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section className={cn("py-16 sm:py-24 lg:py-28", className)}>
      <Container className={contentClassName}>
        {wrapperClassName ? (
          <div className={cn("relative overflow-hidden", wrapperClassName)}>
            <div className="pointer-events-none absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            <div className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full bg-primary/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />
            <div className="relative z-10">{content}</div>
          </div>
        ) : (
          content
        )}
      </Container>
    </section>
  );
}
