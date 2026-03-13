import "server-only";

import { normalizeEmail } from "@/lib/server/utils";

import { getCurrentUser } from "./session";

const ADMIN_EMAIL_ENV_KEYS = [
  "ADMIN_EMAIL_ALLOWLIST",
  "CLICK2PRO_ADMIN_EMAIL_ALLOWLIST",
  "ADMIN_EMAILS"
] as const;

function getConfiguredAdminEmails() {
  const configuredValue = ADMIN_EMAIL_ENV_KEYS.map((key) => process.env[key])
    .find((value) => typeof value === "string" && value.trim().length > 0);

  if (!configuredValue) {
    return new Set<string>();
  }

  return new Set(
    configuredValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => normalizeEmail(value))
  );
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getConfiguredAdminEmails().has(normalizeEmail(email));
}

export async function isCurrentUserAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return isAdminEmail(user.email);
}
