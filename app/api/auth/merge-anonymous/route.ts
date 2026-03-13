import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  buildAnonymousVisitorCookieRemovalAttributes,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { mergeAnonymousVisitorIntoUser } from "@/lib/server/services/anonymous-merge";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentication required."
      },
      {
        status: 401
      }
    );
  }

  const anonymousVisitorId =
    request.cookies.get(INSIGHT_ANONYMOUS_VISITOR_COOKIE)?.value ?? null;
  const mergeResult = await mergeAnonymousVisitorIntoUser({
    anonymousVisitorId,
    userId: user.id
  });
  const response = NextResponse.json({
    ok: true,
    ...mergeResult
  });

  if (anonymousVisitorId) {
    response.cookies.set(buildAnonymousVisitorCookieRemovalAttributes());
  }

  return response;
}
