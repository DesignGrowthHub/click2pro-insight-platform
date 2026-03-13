import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { getOperationalRecoverySnapshot } from "@/lib/server/services/operational-recovery";
import { retryReportAccountEmailDelivery, retryReportGeneration, retryReportPdfGeneration } from "@/lib/server/services/report-recovery";
import { updateExplanationEntitlementById } from "@/lib/server/services/explanation-entitlements";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    {
      error: "Authentication required."
    },
    {
      status: 401
    }
  );
}

function forbidden() {
  return NextResponse.json(
    {
      error: "Admin access required."
    },
    {
      status: 403
    }
  );
}

function normalizeExplanationStatus(value: string | null | undefined) {
  switch (value?.toLowerCase()) {
    case "pending":
      return "PENDING" as const;
    case "granted":
      return "GRANTED" as const;
    case "ready_for_contact":
      return "READY_FOR_CONTACT" as const;
    case "contacted":
      return "CONTACTED" as const;
    case "scheduled":
      return "SCHEDULED" as const;
    case "completed":
      return "COMPLETED" as const;
    case "canceled":
      return "CANCELED" as const;
    case "expired":
      return "EXPIRED" as const;
    default:
      return null;
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  if (!isAdminEmail(user.email)) {
    return forbidden();
  }

  const snapshot = await getOperationalRecoverySnapshot();

  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  if (!isAdminEmail(user.email)) {
    return forbidden();
  }

  const body = (await request.json()) as
    | {
        action?: "retry_report_generation" | "retry_pdf_generation" | "retry_email_delivery";
        reportId?: string;
      }
    | {
        action?: "update_explanation_status";
        entitlementId?: string;
        status?: string;
        scheduledFor?: string | null;
      };

  try {
    if (
      body.action === "retry_report_generation" &&
      "reportId" in body &&
      body.reportId
    ) {
      const result = await retryReportGeneration({
        reportId: body.reportId,
        actorId: user.id
      });

      return NextResponse.json({
        ok: true,
        message: result.message
      });
    }

    if (
      body.action === "retry_pdf_generation" &&
      "reportId" in body &&
      body.reportId
    ) {
      const result = await retryReportPdfGeneration({
        reportId: body.reportId,
        actorId: user.id
      });

      return NextResponse.json({
        ok: true,
        message: result.message
      });
    }

    if (
      body.action === "retry_email_delivery" &&
      "reportId" in body &&
      body.reportId
    ) {
      const result = await retryReportAccountEmailDelivery({
        reportId: body.reportId,
        actorId: user.id
      });

      return NextResponse.json({
        ok: true,
        message: result.message
      });
    }

    if (
      body.action === "update_explanation_status" &&
      "entitlementId" in body &&
      body.entitlementId
    ) {
      const nextStatus = normalizeExplanationStatus(body.status);

      if (!nextStatus) {
        return NextResponse.json(
          {
            error: "A valid explanation entitlement status is required."
          },
          {
            status: 400
          }
        );
      }

      const scheduledFor =
        body.scheduledFor && !Number.isNaN(Date.parse(body.scheduledFor))
          ? new Date(body.scheduledFor)
          : null;
      const updated = await updateExplanationEntitlementById(body.entitlementId, {
        status: nextStatus,
        scheduledFor: nextStatus === "SCHEDULED" ? scheduledFor ?? new Date() : undefined,
        completedAt: nextStatus === "COMPLETED" ? new Date() : undefined
      });

      await recordOperationalEvent({
        eventType: "explanation_entitlement",
        eventKey: updated.id,
        status: "RETRIED",
        userId: updated.userId,
        reportId: updated.reportId ?? null,
        purchaseId: updated.sourcePurchaseId,
        message: `Explanation entitlement status changed to ${nextStatus.toLowerCase()}.`,
        metadata: {
          actorId: user.id
        }
      });

      return NextResponse.json({
        ok: true,
        message: "Explanation-session status updated."
      });
    }

    return NextResponse.json(
      {
        error: "Unsupported recovery action."
      },
      {
        status: 400
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The recovery action could not be completed."
      },
      {
        status: 400
      }
    );
  }
}
