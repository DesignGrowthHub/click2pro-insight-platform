import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function BrandMarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3l7 3.6v5.2c0 4.4-2.8 8-7 9.9-4.2-1.9-7-5.5-7-9.9V6.6L12 3z" />
      <path d="M9.3 9.1c0-1.4 1.1-2.3 2.4-2.3 1 0 1.8.4 2.3 1.2.4-.5 1-.8 1.8-.8 1.2 0 2.1.8 2.1 2 0 .8-.3 1.3-.9 1.9-.5.5-.9 1-1 1.8H9.9c-.1-.9-.5-1.4-1.1-2-.5-.5-.8-1-.8-1.8 0-1.2.9-2 2.1-2 .5 0 .9.1 1.3.4" />
      <path d="M10 15.2h4.2" />
      <path d="M10.4 17.3h3.4" />
    </svg>
  );
}

export function AssessmentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
      <path d="M9 11.5h6" />
      <path d="M9 15h4" />
      <path d="M8.5 8.5h7" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8.5 11V8.75a3.5 3.5 0 017 0V11" />
      <path d="M12 15.5v2.5" />
    </svg>
  );
}

export function ReportIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M8 3.5h8l4 4V20a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 017 20V5A1.5 1.5 0 018.5 3.5z" />
      <path d="M16 3.5V8h4" />
      <path d="M10 12h6" />
      <path d="M10 15.5h6" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3l7 3.5v5.3c0 4.2-2.7 7.8-7 9.7-4.3-1.9-7-5.5-7-9.7V6.5L12 3z" />
      <path d="M9.5 12l1.8 1.8 3.7-3.8" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 4v10" />
      <path d="M8.5 10.5L12 14l3.5-3.5" />
      <path d="M5 18.5h14" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7l7.5 5 7.5-5" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4 18-7z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

export function SubscriptionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M7 9.5h10" />
      <path d="M7 13.5h4.5" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      <path d="M5.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M4 19.5h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-3" />
    </svg>
  );
}

export function InsightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3.5a8.5 8.5 0 108.5 8.5" />
      <path d="M12 7.5a4.5 4.5 0 104.5 4.5" />
      <path d="M12 3.5v8.5h8.5" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12.24 10.285v3.833h5.362c-.236 1.264-.95 2.336-2.024 3.057l3.273 2.54c1.908-1.759 3.009-4.347 3.009-7.43 0-.721-.065-1.415-.184-2.086H12.24z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.894 6.618-2.42l-3.273-2.54c-.907.608-2.069.967-3.345.967-2.57 0-4.748-1.733-5.526-4.06H3.09v2.626A9.997 9.997 0 0012 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.474 13.947A5.998 5.998 0 016.165 12c0-.676.116-1.333.309-1.947V7.427H3.09A10.003 10.003 0 002 12c0 1.61.386 3.134 1.09 4.573l3.384-2.626z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.993c1.468 0 2.786.505 3.822 1.498l2.868-2.868C16.959 2.987 14.695 2 12 2A9.997 9.997 0 003.09 7.427l3.384 2.626c.778-2.327 2.956-4.06 5.526-4.06z"
      />
    </svg>
  );
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M5 4.5h5v15H5z" />
      <path d="M10 4.5h4.5a2.5 2.5 0 012.5 2.5v12H10z" />
      <path d="M17 9.5h2v10H7.5" />
    </svg>
  );
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M4 17l5.5-5.5 4 4L20 9" />
      <path d="M15.5 9H20v4.5" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M6.5 9.5L12 15l5.5-5.5" />
    </svg>
  );
}
