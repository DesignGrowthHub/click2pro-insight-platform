import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { publishAssessmentDraft } from "@/lib/server/services/published-assessments";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await publishAssessmentDraft({
      draftId: id,
      publishedByUserId: user.id
    });

    return NextResponse.json({
      ok: true,
      draft: result.draft,
      publishedAssessment: result.publishedAssessment,
      publishedIssuePage: result.publishedIssuePage
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The draft could not be published."
      },
      {
        status: 400
      }
    );
  }
}
