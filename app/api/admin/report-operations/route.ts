import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { getReportOperationsSnapshot } from "@/lib/server/services/report-operations";

export const runtime = "nodejs";

export async function GET() {
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

  if (!isAdminEmail(user.email)) {
    return NextResponse.json(
      {
        error: "Admin access required."
      },
      {
        status: 403
      }
    );
  }

  const snapshot = await getReportOperationsSnapshot();

  return NextResponse.json(snapshot);
}
