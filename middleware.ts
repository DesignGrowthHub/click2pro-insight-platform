import { NextRequest, NextResponse } from "next/server";

import {
  DEV_REGION_OVERRIDE_COOKIE,
  REGION_PREFERENCE_COOKIE
} from "@/lib/region/catalog";
import { isRegionKey } from "@/lib/region/resolve";

const DEV_REGION_QUERY_PARAM = "region";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.next();
  }

  const regionOverride = request.nextUrl.searchParams.get(DEV_REGION_QUERY_PARAM);

  if (!isRegionKey(regionOverride)) {
    return NextResponse.next();
  }

  const nextUrl = request.nextUrl.clone();
  nextUrl.searchParams.delete(DEV_REGION_QUERY_PARAM);

  const response = NextResponse.redirect(nextUrl);
  response.cookies.set(DEV_REGION_OVERRIDE_COOKIE, regionOverride, {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  response.cookies.set(REGION_PREFERENCE_COOKIE, regionOverride, {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
