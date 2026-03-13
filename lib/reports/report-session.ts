import type { AssessmentResponseMap } from "@/lib/scoring/assessment-scoring";

type StoredAssessmentSession = {
  slug: string;
  savedAt: string;
  responses: AssessmentResponseMap;
};

function getStorageKey(slug: string) {
  return `click2pro-insight:${slug}:latest-session`;
}

export function saveAssessmentSession(
  slug: string,
  responses: AssessmentResponseMap
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredAssessmentSession = {
    slug,
    savedAt: new Date().toISOString(),
    responses
  };

  window.sessionStorage.setItem(getStorageKey(slug), JSON.stringify(payload));
}

export function loadAssessmentSession(slug: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(getStorageKey(slug));

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredAssessmentSession;
    return parsed.slug === slug ? parsed : null;
  } catch {
    return null;
  }
}
