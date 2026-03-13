"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SearchIcon } from "@/components/ui/icons";
import { Assessment } from "@/lib/assessments";
import {
  discoverySearchExamples,
  discoveryThemes,
  featuredIssueEntryPoints,
  getThemeLabelBySlug
} from "@/lib/discovery";
import { cn } from "@/lib/utils";

import { AssessmentCard } from "./assessment-card";

type AssessmentLibraryShellProps = {
  assessments: Assessment[];
  featuredSlugs?: string[];
  initialQuery?: string;
  initialThemeSlug?: string | null;
};

const searchStopWords = new Set([
  "a",
  "am",
  "an",
  "and",
  "are",
  "be",
  "do",
  "everything",
  "feel",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "so",
  "that",
  "the",
  "them",
  "to",
  "why"
]);

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeSearchText(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !searchStopWords.has(token));
}

function getAssessmentSearchScore(
  assessment: Assessment,
  normalizedQuery: string,
  queryTokens: string[]
) {
  if (!normalizedQuery) {
    return 0;
  }

  const title = normalizeSearchText(assessment.title);
  const descriptor = normalizeSearchText(assessment.descriptor);
  const summary = normalizeSearchText(assessment.summary);
  const categories = normalizeSearchText(
    [...assessment.discoveryCategories, assessment.category].join(" ")
  );
  const problemTags = normalizeSearchText(assessment.problemTags.join(" "));
  const issuePhrases = normalizeSearchText(assessment.issuePhrases.join(" "));
  const keywords = normalizeSearchText(assessment.searchKeywords.join(" "));

  let score = 0;

  if (title.includes(normalizedQuery)) score += 18;
  if (descriptor.includes(normalizedQuery)) score += 12;
  if (summary.includes(normalizedQuery)) score += 10;
  if (problemTags.includes(normalizedQuery)) score += 16;
  if (issuePhrases.includes(normalizedQuery)) score += 18;
  if (keywords.includes(normalizedQuery)) score += 10;
  if (categories.includes(normalizedQuery)) score += 8;

  for (const token of queryTokens) {
    if (title.includes(token)) score += 5;
    if (descriptor.includes(token)) score += 4;
    if (summary.includes(token)) score += 3;
    if (problemTags.includes(token)) score += 5;
    if (issuePhrases.includes(token)) score += 5;
    if (keywords.includes(token)) score += 3;
    if (categories.includes(token)) score += 2;
  }

  return score;
}

export function AssessmentLibraryShell({
  assessments,
  featuredSlugs = assessments.filter((assessment) => assessment.featured).map((assessment) => assessment.slug),
  initialQuery = "",
  initialThemeSlug = null
}: AssessmentLibraryShellProps) {
  const initialThemeLabel = initialThemeSlug ? getThemeLabelBySlug(initialThemeSlug) : null;
  const [query, setQuery] = useState(initialQuery);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    initialThemeLabel ? [initialThemeLabel] : []
  );
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const featuredSet = useMemo(() => new Set(featuredSlugs), [featuredSlugs]);

  const visibleThemes = useMemo(
    () =>
      discoveryThemes.filter((theme) =>
        assessments.some((assessment) => assessment.problemTags.includes(theme.label))
      ),
    [assessments]
  );

  const filteredAssessments = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = tokenizeSearchText(query);

    return assessments
      .map((assessment, index) => {
        const matchesFeatured = featuredOnly ? featuredSet.has(assessment.slug) : true;
        const matchesThemes =
          selectedThemes.length === 0
            ? true
            : selectedThemes.some((theme) => assessment.problemTags.includes(theme));

        if (!matchesFeatured || !matchesThemes) {
          return {
            assessment,
            index,
            score: -1
          };
        }

        const score = getAssessmentSearchScore(assessment, normalizedQuery, queryTokens);

        if (normalizedQuery && score === 0) {
          return {
            assessment,
            index,
            score: -1
          };
        }

        return {
          assessment,
          index,
          score:
            score +
            (featuredSet.has(assessment.slug) ? 1 : 0) +
            (selectedThemes.some((theme) => assessment.problemTags.includes(theme)) ? 2 : 0)
        };
      })
      .filter((item) => item.score >= 0)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }

        return left.index - right.index;
      })
      .map((item) => item.assessment);
  }, [
    assessments,
    featuredOnly,
    featuredSet,
    query,
    selectedThemes
  ]);

  const featuredAssessments = filteredAssessments.filter((assessment) =>
    featuredSet.has(assessment.slug)
  );
  const standardAssessments = filteredAssessments.filter(
    (assessment) => !featuredSet.has(assessment.slug)
  );
  const hasActiveDiscovery =
    query.trim().length > 0 ||
    selectedThemes.length > 0 ||
    featuredOnly;

  function toggleTheme(theme: string) {
    setSelectedThemes((current) =>
      current.includes(theme)
        ? current.filter((item) => item !== theme)
        : [...current, theme]
    );
  }

  function applyIssueEntry(queryValue: string, theme: string) {
    setQuery(queryValue);
    setFeaturedOnly(false);
    setSelectedThemes([theme]);
  }

  function clearDiscovery() {
    setQuery("");
    setSelectedThemes([]);
    setFeaturedOnly(false);
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      <Card variant="raised" className="panel-grid overflow-hidden reveal-soft">
        <CardContent className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end lg:p-9">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">Discovery</Badge>
              <Badge variant="outline">Search first</Badge>
            </div>
            <div className="space-y-2.5">
              <CardTitle className="text-[1.75rem] leading-[1.05] sm:text-[2.05rem]">
                Search the issue first, then narrow the right assessment.
              </CardTitle>
              <p className="body-sm reading-column-tight">
                Use the question, feeling, or pattern that already feels active.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="insight-label">
                What are you dealing with?
              </span>
              <div className="discovery-input">
                <SearchIcon className="h-4 w-4 text-primary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by question, feeling, or pattern"
                  className="w-full bg-transparent text-[0.98rem] text-foreground outline-none placeholder:text-muted"
                />
              </div>
            </label>

            <div className="flex flex-wrap gap-2">
              {discoverySearchExamples.slice(0, 4).map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="filter-chip"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {visibleThemes.map((theme) => (
                <button
                  key={theme.slug}
                  type="button"
                  onClick={() => toggleTheme(theme.label)}
                  className={cn(
                    "filter-chip",
                    selectedThemes.includes(theme.label) && "filter-chip-active"
                  )}
                >
                  {theme.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFeaturedOnly((current) => !current)}
                className={cn("filter-chip", featuredOnly && "filter-chip-active")}
              >
                Featured only
              </button>
              {hasActiveDiscovery ? (
                <button
                  type="button"
                  onClick={clearDiscovery}
                  className="filter-chip"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <p className="text-sm leading-6 text-muted">
              Showing {filteredAssessments.length} of {assessments.length} assessments
              {query.trim() ? ` for “${query.trim()}”` : ""}.
            </p>
          </div>
        </CardContent>
      </Card>

      {!hasActiveDiscovery ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">Start with a familiar pattern</p>
              <h2 className="text-[1.55rem] font-semibold leading-[1.08] tracking-[-0.034em] text-foreground sm:text-[1.85rem]">
                Common starting points.
              </h2>
            </div>
            <p className="body-sm max-w-md">
              Useful when the pattern is clear but the assessment name is not.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {featuredIssueEntryPoints.slice(0, 4).map((entry, index) => (
              <button
                key={entry.title}
                type="button"
                onClick={() => applyIssueEntry(entry.query, entry.theme)}
                className={cn(
                  "surface-block rounded-[24px] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/28 hover:bg-white/[0.05]",
                  "reveal-soft",
                  index % 3 === 1 && "reveal-soft-delay-1",
                  index % 3 === 2 && "reveal-soft-delay-2"
                )}
              >
                <p className="insight-label">{entry.theme}</p>
                <h3 className="mt-2.5 text-[1rem] font-semibold leading-7 text-foreground">
                  {entry.title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  {entry.query}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {filteredAssessments.length === 0 ? (
        <Card className="reveal-soft">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <Badge variant="outline">No direct match</Badge>
            <div className="space-y-3">
              <CardTitle className="text-[1.55rem]">
                Try a broader phrase or switch the active theme.
              </CardTitle>
              <p className="body-sm reading-column-tight">
                Broader issue language usually works better than something very
                narrow, especially when one pattern overlaps with several topics.
              </p>
            </div>
            <button
              type="button"
              onClick={clearDiscovery}
              className="filter-chip filter-chip-active"
            >
              Reset search and filters
            </button>
          </CardContent>
        </Card>
      ) : null}

      {featuredAssessments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">Featured assessments</p>
              <h2 className="text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-[1.95rem]">
                Start with the clearest entry points.
              </h2>
            </div>
            <p className="body-sm max-w-md">
              These stay near the top so discovery stays quick as the library grows.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {featuredAssessments.map((assessment, index) => (
              <AssessmentCard
                key={assessment.slug}
                assessment={assessment}
                variant="featured"
                className={cn(
                  "reveal-soft",
                  index === 1 && "reveal-soft-delay-1",
                  index === 2 && "reveal-soft-delay-2"
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      {standardAssessments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">
                {hasActiveDiscovery ? "Matching assessments" : "Browse the library"}
              </p>
              <h2 className="text-[1.6rem] font-semibold leading-[1.08] tracking-[-0.034em] text-foreground sm:text-[1.88rem]">
                {hasActiveDiscovery
                  ? "Choose the assessment that feels closest to what you searched."
                  : "The wider library stays compact and easy to scan."}
              </h2>
            </div>
            <p className="body-sm max-w-md">
              Each card stays light so the library feels readable instead of crowded.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {standardAssessments.map((assessment, index) => (
              <AssessmentCard
                key={assessment.slug}
                assessment={assessment}
                className={cn(
                  "reveal-soft",
                  index % 4 === 1 && "reveal-soft-delay-1",
                  index % 4 === 2 && "reveal-soft-delay-2",
                  index % 4 === 3 && "reveal-soft-delay-3"
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
