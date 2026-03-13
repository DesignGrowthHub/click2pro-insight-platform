import { NextResponse } from "next/server";

import { getServerCommerceRegionContext } from "@/lib/region/server";

export async function GET() {
  const context = await getServerCommerceRegionContext();

  return NextResponse.json(context);
}
