import "server-only";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeNullableString(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function toOptionalDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}
