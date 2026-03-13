import { NextRequest, NextResponse } from "next/server";

import { getAssessmentDefinitionBySlug } from "@/lib/assessments";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildAnonymousVisitorCookieAttributes,
  buildAnonymousVisitorCookieRemovalAttributes,
  buildAnonymousVisitorCookieValue,
  INSIGHT_ANONYMOUS_VISITOR_COOKIE
} from "@/lib/server/anonymous-visitor";
import { mergeAnonymousVisitorIntoUser } from "@/lib/server/services/anonymous-merge";
import { persistCompletedAssessment } from "@/lib/server/services/report-pipeline";
import type { AssessmentResponseMap } from "@/lib/scoring/assessment-scoring";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function isResponseMap(value: unknown): value is AssessmentResponseMap {
  return Boolean(
    value &&
      typeof value === "object" &&
      Object.values(value as Record<string, unknown>).every(
        (item) => typeof item === "string"
      )
  );
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const assessment = getAssessmentDefinitionBySlug(slug);

  if (!assessment) {
    return NextResponse.json(
      {
        error: "Assessment could not be found."
      },
      {
        status: 404
      }
    );
  }

  const body = (await request.json()) as {
    answers?: unknown;
    startedAt?: string | null;
    completedAt?: string | null;
    sourceAttributionId?: string | null;
  };

  if (!isResponseMap(body.answers)) {
    return NextResponse.json(
      {
        error: "Assessment answers are required."
      },
      {
        status: 400
      }
    );
  }

  const currentUser = await getCurrentUser();
  const existingAnonymousVisitorId =
    request.cookies.get(INSIGHT_ANONYMOUS_VISITOR_COOKIE)?.value ?? null;

  if (currentUser && existingAnonymousVisitorId) {
    await mergeAnonymousVisitorIntoUser({
      anonymousVisitorId: existingAnonymousVisitorId,
      userId: currentUser.id
    });
  }

  const anonymousVisitorId = currentUser
    ? null
    : existingAnonymousVisitorId ?? buildAnonymousVisitorCookieValue();
  const outcome = await persistCompletedAssessment({
    assessment,
    answers: body.answers,
    userId: currentUser?.id ?? null,
    anonymousVisitorId,
    sourceAttributionId: body.sourceAttributionId ?? null,
    startedAt: body.startedAt ?? null,
    completedAt: body.completedAt ?? null
  });
  const response = NextResponse.json(outcome);

  if (!currentUser && !existingAnonymousVisitorId && anonymousVisitorId) {
    response.cookies.set({
      ...buildAnonymousVisitorCookieAttributes(),
      value: anonymousVisitorId
    });
  }

  if (currentUser && existingAnonymousVisitorId) {
    response.cookies.set(buildAnonymousVisitorCookieRemovalAttributes());
  }

  return response;
}
