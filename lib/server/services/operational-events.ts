import "server-only";

import type {
  OperationalEventLevel,
  OperationalEventStatus,
  Prisma
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type RecordOperationalEventInput = {
  eventType: string;
  eventKey?: string | null;
  status: OperationalEventStatus;
  level?: OperationalEventLevel;
  message: string;
  userId?: string | null;
  reportId?: string | null;
  purchaseId?: string | null;
  checkoutIntentId?: string | null;
  metadata?: Record<string, unknown> | null;
};

function toJsonValue(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function recordOperationalEvent(input: RecordOperationalEventInput) {
  try {
    return await prisma.operationalEvent.create({
      data: {
        eventType: input.eventType,
        eventKey: input.eventKey ?? null,
        status: input.status,
        level: input.level ?? (input.status === "FAILED" ? "ERROR" : "INFO"),
        message: input.message,
        userId: input.userId ?? null,
        reportId: input.reportId ?? null,
        purchaseId: input.purchaseId ?? null,
        checkoutIntentId: input.checkoutIntentId ?? null,
        metadata: toJsonValue(input.metadata)
      }
    });
  } catch (error) {
    console.error("[insight-operational-event]", input.eventType, input.status, error);
    return null;
  }
}

export async function listRecentOperationalEvents(input?: {
  statuses?: OperationalEventStatus[];
  levels?: OperationalEventLevel[];
  limit?: number;
}) {
  return prisma.operationalEvent.findMany({
    where: {
      ...(input?.statuses?.length
        ? {
            status: {
              in: input.statuses
            }
          }
        : {}),
      ...(input?.levels?.length
        ? {
            level: {
              in: input.levels
            }
          }
        : {})
    },
    orderBy: {
      createdAt: "desc"
    },
    take: input?.limit ?? 20
  });
}
