import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentCommerceStateForUser } from "@/lib/commerce/server/library";
import {
  buildAnonymousVisitorCookieRemovalAttributes,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { mergeAnonymousVisitorIntoUser } from "@/lib/server/services/anonymous-merge";

export async function GET(request: NextRequest) {
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

  if (anonymousVisitorId) {
    await mergeAnonymousVisitorIntoUser({
      anonymousVisitorId,
      userId: user.id
    });
  }

  const state = await getPersistentCommerceStateForUser(user.id);

  if (!state) {
    return NextResponse.json(
      {
        error: "Unable to load account library."
      },
      {
        status: 404
      }
    );
  }

  const response = NextResponse.json(state);

  if (anonymousVisitorId) {
    response.cookies.set(buildAnonymousVisitorCookieRemovalAttributes());
  }

  return response;
}
