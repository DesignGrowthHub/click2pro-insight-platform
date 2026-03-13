import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  buildAnonymousVisitorCookieRemovalAttributes,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { mergeAnonymousVisitorIntoUser } from "@/lib/server/services/anonymous-merge";
import { getPersistedReportExperience } from "@/lib/server/services/report-pipeline";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const currentUser = await getCurrentUser();
  const cookieAnonymousVisitorId =
    request.cookies.get(INSIGHT_ANONYMOUS_VISITOR_COOKIE)?.value ?? null;

  if (currentUser && cookieAnonymousVisitorId) {
    await mergeAnonymousVisitorIntoUser({
      anonymousVisitorId: cookieAnonymousVisitorId,
      userId: currentUser.id
    });
  }

  const anonymousVisitorId = currentUser ? null : cookieAnonymousVisitorId;
  const experience = await getPersistedReportExperience({
    assessmentSlug: slug,
    userId: currentUser?.id ?? null,
    anonymousVisitorId
  });

  if (!experience) {
    return NextResponse.json(
      {
        error: "No saved report or completed session is available yet."
      },
      {
        status: 404
      }
    );
  }

  const response = NextResponse.json(experience);

  if (currentUser && cookieAnonymousVisitorId) {
    response.cookies.set(buildAnonymousVisitorCookieRemovalAttributes());
  }

  return response;
}
