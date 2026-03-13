import { NextResponse } from "next/server";

import { getServerCommerceRegionContext } from "@/lib/region/server";
import { REGION_PREFERENCE_COOKIE } from "@/lib/region/catalog";
import { resolveRegionContext } from "@/lib/region/resolve";
import type { RegionPreferencePayload } from "@/lib/region/types";

export async function POST(request: Request) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    const context = await getServerCommerceRegionContext();
    return NextResponse.json(context);
  }

  const body = (await request.json()) as Partial<RegionPreferencePayload>;

  if (body.regionKey !== "international" && body.regionKey !== "india") {
    return NextResponse.json(
      {
        error: "Invalid region preference."
      },
      {
        status: 400
      }
    );
  }

  const response = NextResponse.json(
    resolveRegionContext({
      explicitRegionKey: body.regionKey
    })
  );

  response.cookies.set(REGION_PREFERENCE_COOKIE, body.regionKey, {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 180
  });

  return response;
}
