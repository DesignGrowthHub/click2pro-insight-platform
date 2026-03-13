import "server-only";

import { randomUUID } from "node:crypto";

export const INSIGHT_ANONYMOUS_VISITOR_COOKIE = "click2pro_insight_visitor";

export function buildAnonymousVisitorCookieValue() {
  return randomUUID();
}

export function buildAnonymousVisitorCookieAttributes() {
  return {
    name: INSIGHT_ANONYMOUS_VISITOR_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export function buildAnonymousVisitorCookieRemovalAttributes() {
  return {
    name: INSIGHT_ANONYMOUS_VISITOR_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0)
  };
}
