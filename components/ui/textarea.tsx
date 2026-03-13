import { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[136px] w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-base text-foreground outline-none transition-all placeholder:text-muted focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  );
}
