import "server-only";

import { cookies } from "next/headers";
import { headers } from "next/headers";

import { getAuthSession } from "@/lib/auth/session";
import {
  DEV_REGION_OVERRIDE_COOKIE,
  REGION_PREFERENCE_COOKIE
} from "@/lib/region/catalog";
import { isRegionKey } from "@/lib/region/resolve";
import { resolveRegionContext } from "@/lib/region/resolve";

function normalizeGeoHeaderCountry(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized === "XX" || normalized === "T1") {
    return null;
  }

  return normalized;
}

async function getHeaderResolvedCountry() {
  const headerStore = await headers();

  return normalizeGeoHeaderCountry(
    headerStore.get("x-vercel-ip-country") ??
      headerStore.get("cf-ipcountry") ??
      headerStore.get("x-country-code") ??
      headerStore.get("cloudfront-viewer-country") ??
      null
  );
}

export async function getServerCommerceRegionContext() {
  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isDevelopment = process.env.NODE_ENV === "development";
  const explicitRegionKey = isDevelopment
    ? cookieStore.get(DEV_REGION_OVERRIDE_COOKIE)?.value ?? null
    : null;
  const geoHeaderCountry = await getHeaderResolvedCountry();

  return resolveRegionContext({
    explicitRegionKey: isRegionKey(explicitRegionKey) ? explicitRegionKey : null,
    cookieRegionKey: isDevelopment
      ? cookieStore.get(REGION_PREFERENCE_COOKIE)?.value ?? null
      : null,
    country: session?.user?.country ?? null,
    geoHeaderCountry
  });
}
