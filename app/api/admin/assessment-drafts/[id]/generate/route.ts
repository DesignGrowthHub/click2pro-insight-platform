import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import {
  generateAssessmentDraftWithAI,
  type DraftGenerationSection
} from "@/lib/server/services/assessment-draft-generation";

export const runtime = "nodejs";

function isDraftGenerationSection(value: string | undefined): value is DraftGenerationSection {
  return (
    value === "all" ||
    value === "dimensions" ||
    value === "questions" ||
    value === "issuePage" ||
    value === "previewBlueprint" ||
    value === "reportBlueprint"
  );
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    section?: string;
  };

  const section = isDraftGenerationSection(body.section) ? body.section : "all";

  try {
    const draft = await generateAssessmentDraftWithAI({
      draftId: id,
      requestedByUserId: user.id,
      section
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
            : "The AI draft generation request failed."
      },
      {
        status: 400
      }
    );
  }
}
