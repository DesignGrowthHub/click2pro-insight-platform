import type { SafeUser } from "@/lib/server/services/users";

export function sanitizeProfileNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
}

export function buildProfileCompletionUrl(nextPath: string, force = false) {
  const params = new URLSearchParams({
    next: sanitizeProfileNextPath(nextPath)
  });

  if (force) {
    params.set("force", "1");
  }

  return `/profile/complete?${params.toString()}`;
}

export function isProfileCompletionPath(value: string | null | undefined) {
  return Boolean(value && sanitizeProfileNextPath(value).startsWith("/profile/complete"));
}

export function ensureProfileCompletionCallback(nextPath: string, force = false) {
  const safeNextPath = sanitizeProfileNextPath(nextPath);

  if (isProfileCompletionPath(safeNextPath)) {
    return safeNextPath;
  }

  return buildProfileCompletionUrl(safeNextPath, force);
}

export function extractFinalContinuationPath(value: string | null | undefined) {
  const safeValue = sanitizeProfileNextPath(value);

  if (!isProfileCompletionPath(safeValue)) {
    return safeValue;
  }

  const queryIndex = safeValue.indexOf("?");

  if (queryIndex === -1) {
    return "/dashboard";
  }

  const params = new URLSearchParams(safeValue.slice(queryIndex + 1));
  return sanitizeProfileNextPath(params.get("next"));
}

export function isReportContinuationPath(value: string | null | undefined) {
  const finalPath = extractFinalContinuationPath(value);
  return finalPath.includes("/reports/") || finalPath.includes("/checkout/claim");
}

export function formatProfileContextLine(user: Pick<SafeUser, "country" | "occupationOrLifeStage" | "ageRange">) {
  return [user.occupationOrLifeStage, user.ageRange, user.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" · ");
}
