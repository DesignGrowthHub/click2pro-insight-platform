import "server-only";

import { cookies } from "next/headers";

import { getAuthSession } from "@/lib/auth/session";
import {
  DEV_REGION_OVERRIDE_COOKIE,
  REGION_PREFERENCE_COOKIE
} from "@/lib/region/catalog";
import { isRegionKey } from "@/lib/region/resolve";
import { resolveRegionContext } from "@/lib/region/resolve";

export async function getServerCommerceRegionContext() {
  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isDevelopment = process.env.NODE_ENV === "development";
  const explicitRegionKey = isDevelopment
    ? cookieStore.get(DEV_REGION_OVERRIDE_COOKIE)?.value ?? null
    : null;

  return resolveRegionContext({
    explicitRegionKey: isRegionKey(explicitRegionKey) ? explicitRegionKey : null,
    cookieRegionKey: isDevelopment
      ? cookieStore.get(REGION_PREFERENCE_COOKIE)?.value ?? null
      : null,
    country: session?.user?.country ?? null
  });
}
