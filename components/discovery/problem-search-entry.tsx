import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRightIcon, SearchIcon } from "@/components/ui/icons";
import {
  discoverySearchExamples,
  discoveryThemes,
  featuredIssueEntryPoints,
  getThemeSlugByLabel
} from "@/lib/discovery";
import { cn } from "@/lib/utils";

type ProblemSearchEntryProps = {
  className?: string;
  compact?: boolean;
};

function buildDiscoveryHref(query: string, theme: string) {
  const params = new URLSearchParams();
  params.set("q", query);

  const themeSlug = getThemeSlugByLabel(theme);

  if (themeSlug) {
    params.set("theme", themeSlug);
  }

  return `/assessments?${params.toString()}`;
}

export function ProblemSearchEntry({
  className,
  compact = false
}: ProblemSearchEntryProps) {
  return (
    <Card variant="raised" className={cn("panel-grid overflow-hidden", className)}>
      <CardContent
        className={cn(
          "grid gap-6 p-6 sm:p-8 lg:items-start lg:p-9",
          compact ? "lg:grid-cols-[1.04fr_0.96fr]" : "lg:grid-cols-[0.92fr_1.08fr]"
        )}
      >
        <div className={cn("space-y-5", compact && "space-y-4")}>
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">Start here</Badge>
            {!compact ? <Badge variant="outline">Search-led discovery</Badge> : null}
          </div>

          <div className="space-y-3">
            <CardTitle className="text-[1.85rem] leading-[1.04] sm:text-[2.2rem]">
              {compact
                ? "Begin with the issue that already feels active."
                : "Begin with what feels most familiar."}
            </CardTitle>
            <p className="body-sm reading-column-tight">
              {compact
                ? "Search by question, feeling, or recurring pattern. The library will narrow the strongest fit."
                : "You do not need to know which assessment fits yet. Start with the question, feeling, or repeating pattern that is already taking up space, and the library will narrow the best-fit options for you."}
            </p>
          </div>

          <form action="/assessments" className="space-y-4">
            <label className="block space-y-2">
              <span className="insight-label">
                Search by question, feeling, or pattern
              </span>
              <div className="discovery-input">
                <SearchIcon className="h-4 w-4 text-primary" />
                <input
                  type="text"
                  name="q"
                  placeholder="What are you dealing with?"
                  className="w-full bg-transparent text-[0.98rem] text-foreground outline-none placeholder:text-muted"
                />
              </div>
            </label>

            <div className="flex flex-wrap gap-2">
              {discoverySearchExamples.slice(0, compact ? 3 : 4).map((example) => (
                <Link
                  key={example}
                  href={`/assessments?q=${encodeURIComponent(example)}`}
                  className="filter-chip"
                >
                  {example}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {discoveryThemes.slice(0, compact ? 4 : 6).map((theme) => (
                <Link
                  key={theme.slug}
                  href={`/assessments?theme=${theme.slug}`}
                  className="filter-chip"
                >
                  {theme.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button type="submit" size="lg">
                Search Assessments
                <ArrowUpRightIcon className="h-4 w-4" />
              </Button>
              <LinkButton href="/assessments" variant="outline" size="lg">
                Browse All Assessments
              </LinkButton>
            </div>
          </form>
        </div>

        <div className={cn("grid gap-4", compact ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {featuredIssueEntryPoints.slice(0, compact ? 3 : 4).map((entry, index) => (
            <Link
              key={entry.title}
              href={buildDiscoveryHref(entry.query, entry.theme)}
              className={cn(
                "surface-block group rounded-[28px] px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/28 hover:bg-white/[0.05]",
                index === 1 && "reveal-soft-delay-1",
                index >= 2 && "reveal-soft-delay-2"
              )}
            >
              <p className="insight-label">{entry.theme}</p>
              <h3 className="mt-3 text-[1.1rem] font-semibold leading-7 text-foreground transition-colors group-hover:text-primary">
                {entry.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {compact ? entry.query : entry.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                {compact ? "Search this issue" : "Explore this starting point"}
                <ArrowUpRightIcon className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
