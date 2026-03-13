import { blogPopupFallback, blogTopicMappings } from "@/lib/blog-popup/mappings";
import {
  getInsightAssessmentLibraryUrl,
  getInsightAssessmentUrl,
  DEFAULT_INSIGHT_BASE_URL
} from "@/lib/blog-popup/routing";
import type {
  BlogTopicDetectionInput,
  BlogTopicDetectionResult,
  BlogTopicMapping
} from "@/lib/blog-popup/types";

type ScoredBlogTopicMatch = {
  mapping: BlogTopicMapping;
  score: number;
  slugHits: number;
  keywordHits: number;
  matchedTerms: string[];
  matchedBy: "slug" | "keyword";
};

export function normalizeTopicText(value: string) {
  return value
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPathnameFromUrl(url: string) {
  try {
    return new URL(url, "https://click2pro.com").pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function uniqueTerms(terms: string[]) {
  return [...new Set(terms)];
}

function buildDetectionHaystack(input: BlogTopicDetectionInput) {
  return normalizeTopicText(
    [
      extractPathnameFromUrl(input.url),
      input.pageTitle ?? "",
      input.metaKeywords ?? "",
      input.metaDescription ?? ""
    ].join(" ")
  );
}

export function isLikelyBlogArticlePage(
  url: string,
  articlePathHints: string[]
) {
  const pathname = extractPathnameFromUrl(url);

  if (articlePathHints.some((hint) => pathname.includes(hint.toLowerCase()))) {
    return true;
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2 && pathname.includes("-");
}

export function scoreBlogTopicMapping(
  mapping: BlogTopicMapping,
  input: BlogTopicDetectionInput
): ScoredBlogTopicMatch {
  const normalizedPath = normalizeTopicText(extractPathnameFromUrl(input.url));
  const haystack = buildDetectionHaystack(input);
  let score = 0;
  let slugHits = 0;
  let keywordHits = 0;
  const matchedTerms: string[] = [];
  let matchedBy: "slug" | "keyword" = "keyword";

  for (const fragment of [mapping.assessmentSlug, ...mapping.urlFragments]) {
    const normalizedFragment = normalizeTopicText(fragment);

    if (!normalizedFragment) {
      continue;
    }

    if (
      normalizedPath.includes(normalizedFragment) ||
      haystack.includes(normalizedFragment)
    ) {
      score += fragment === mapping.assessmentSlug ? 9 : 6;
      slugHits += 1;
      matchedBy = "slug";
      matchedTerms.push(fragment);
    }
  }

  for (const keyword of mapping.keywords) {
    const normalizedKeyword = normalizeTopicText(keyword);

    if (!normalizedKeyword || !haystack.includes(normalizedKeyword)) {
      continue;
    }

    score += normalizedKeyword.includes(" ") ? 4 : 2;
    keywordHits += 1;
    matchedTerms.push(keyword);
  }

  return {
    mapping,
    score,
    slugHits,
    keywordHits,
    matchedTerms: uniqueTerms(matchedTerms),
    matchedBy
  };
}

export function resolveBlogAssessmentRecommendation(
  input: BlogTopicDetectionInput
): BlogTopicDetectionResult {
  const insightBaseUrl = input.insightBaseUrl ?? DEFAULT_INSIGHT_BASE_URL;
  const sortedMatches = blogTopicMappings
    .map((mapping) => scoreBlogTopicMapping(mapping, input))
    .filter((match) => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.slugHits !== left.slugHits) {
        return right.slugHits - left.slugHits;
      }

      if ((right.mapping.priority ?? 0) !== (left.mapping.priority ?? 0)) {
        return (right.mapping.priority ?? 0) - (left.mapping.priority ?? 0);
      }

      return right.keywordHits - left.keywordHits;
    });

  const bestMatch = sortedMatches[0];

  if (!bestMatch || bestMatch.score < 2) {
    return {
      kind: "fallback",
      matchedBy: "fallback",
      href: getInsightAssessmentLibraryUrl(insightBaseUrl),
      title: blogPopupFallback.title,
      topicLabel: blogPopupFallback.topicLabel,
      message: blogPopupFallback.message,
      ctaLabel: blogPopupFallback.ctaLabel,
      badgeLabel: blogPopupFallback.badgeLabel,
      matchedTerms: [],
      score: 0
    };
  }

  return {
    kind: "assessment",
    matchedBy: bestMatch.matchedBy,
    href: getInsightAssessmentUrl(bestMatch.mapping.assessmentSlug, insightBaseUrl),
    title: bestMatch.mapping.assessmentTitle,
    topicLabel: bestMatch.mapping.topicLabel,
    message: bestMatch.mapping.contextualMessage,
    ctaLabel: bestMatch.mapping.ctaLabel,
    badgeLabel: bestMatch.mapping.badgeLabel,
    matchedTerms: bestMatch.matchedTerms,
    score: bestMatch.score,
    assessmentSlug: bestMatch.mapping.assessmentSlug,
    timeEstimate: bestMatch.mapping.timeEstimate,
    privacyNote: bestMatch.mapping.privacyNote,
    reportLabel: bestMatch.mapping.reportLabel
  };
}
