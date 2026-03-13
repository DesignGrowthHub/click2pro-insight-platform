import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  ensureOwnedReportPdfAsset,
  recordOwnedReportDownload
} from "@/lib/server/services/report-assets";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
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

  try {
    const asset = await ensureOwnedReportPdfAsset(reportId, user.id);

    await recordOwnedReportDownload({
      reportId,
      userId: user.id,
      sourceContext: request.nextUrl.searchParams.get("sourceContext") ?? "unknown",
      fileVersion: "premium-report-v1",
      metadata: {
        deliveredBy: "report-asset-route"
      }
    });

    return new NextResponse(
      new Uint8Array(
        asset.buffer.buffer,
        asset.buffer.byteOffset,
        asset.buffer.byteLength
      ),
      {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asset.fileName}"`,
        "Cache-Control": "private, no-store"
      }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The report PDF could not be prepared."
      },
      {
        status: 400
      }
    );
  }
}
