import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { createEmptyAssessmentDraft } from "@/lib/server/services/assessment-drafts";

export const runtime = "nodejs";

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    topicFamily?: string | null;
    targetAudience?: string | null;
    emotionalGoal?: string | null;
    requestedQuestionCount?: number | null;
    desiredTone?: string | null;
    requestedDimensions?: string[] | null;
    previewEmphasisNotes?: string | null;
    reportEmphasisNotes?: string | null;
    notes?: string | null;
  };

  const title = body.title?.trim();
  const slug = sanitizeSlug(body.slug ?? title ?? "");

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  try {
    const draft = await createEmptyAssessmentDraft({
      title,
      slug,
      topicFamily: body.topicFamily ?? null,
      targetAudience: body.targetAudience ?? null,
      emotionalGoal: body.emotionalGoal ?? null,
      requestedQuestionCount:
        typeof body.requestedQuestionCount === "number" ? body.requestedQuestionCount : null,
      desiredTone: body.desiredTone ?? null,
      requestedDimensions:
        Array.isArray(body.requestedDimensions) && body.requestedDimensions.length
          ? body.requestedDimensions
          : null,
      previewEmphasisNotes: body.previewEmphasisNotes ?? null,
      reportEmphasisNotes: body.reportEmphasisNotes ?? null,
      notes: body.notes ?? null,
      createdByUserId: user.id
    });

    return NextResponse.json({
      ok: true,
      draft
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assessment draft could not be created."
      },
      {
        status: 400
      }
    );
  }
}
