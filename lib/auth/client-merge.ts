"use client";

export async function mergeAnonymousInsightState() {
  try {
    const response = await fetch("/api/auth/merge-anonymous", {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      return {
        ok: false
      } as const;
    }

    return {
      ok: true
    } as const;
  } catch {
    return {
      ok: false
    } as const;
  }
}
