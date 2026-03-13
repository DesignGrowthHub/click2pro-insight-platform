import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentCommerceStateForUser } from "@/lib/commerce/server/library";
import { queueAndSendOwnedReportEmail } from "@/lib/server/services/report-deliveries";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  const { reportId } = await context.params;
  const body = (await request.json()) as {
    target?: "account_email" | "alternate_email";
    recipientEmail?: string | null;
  };

  if (!body.target) {
    return NextResponse.json(
      {
        error: "A delivery target is required."
      },
      {
        status: 400
      }
    );
  }

  try {
    const result = await queueAndSendOwnedReportEmail({
      reportId,
      userId: user.id,
      target: body.target,
      recipientEmail: body.recipientEmail ?? null,
      trigger:
        body.target === "account_email" ? "resend" : "alternate_send"
    });
    const state = await getPersistentCommerceStateForUser(user.id);
    const ownedReport = state?.ownedReports.find((item) => item.id === reportId) ?? null;

    return NextResponse.json({
      ok: result.ok,
      message: result.message,
      ownedReport
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The report email could not be delivered."
      },
      {
        status: 400
      }
    );
  }
}
