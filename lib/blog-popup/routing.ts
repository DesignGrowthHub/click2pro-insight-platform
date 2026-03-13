export const DEFAULT_INSIGHT_BASE_URL = "https://insight.click2pro.com";

export function normalizeInsightBaseUrl(baseUrl = DEFAULT_INSIGHT_BASE_URL) {
  return baseUrl.replace(/\/+$/, "");
}

export function getInsightAssessmentPath(slug: string) {
  return `/assessments/${slug}`;
}

export function getInsightAssessmentUrl(
  slug: string,
  baseUrl = DEFAULT_INSIGHT_BASE_URL
) {
  return `${normalizeInsightBaseUrl(baseUrl)}${getInsightAssessmentPath(slug)}`;
}

export function getInsightAssessmentLibraryPath() {
  return "/assessments";
}

export function getInsightAssessmentLibraryUrl(
  baseUrl = DEFAULT_INSIGHT_BASE_URL
) {
  return `${normalizeInsightBaseUrl(baseUrl)}${getInsightAssessmentLibraryPath()}`;
}
