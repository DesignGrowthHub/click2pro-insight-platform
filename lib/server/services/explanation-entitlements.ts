import "server-only";

import type { ExplanationEntitlementStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type CreateExplanationEntitlementInput = {
  userId: string;
  sourcePurchaseId: string;
  reportId?: string | null;
  assessmentSlug?: string | null;
  topicKey?: string | null;
  title: string;
  durationMinutes: number;
  regionKey?: string | null;
  currency?: string | null;
  amountCents: number;
  status?: ExplanationEntitlementStatus;
  notes?: Prisma.InputJsonValue;
  grantedAt?: Date | string | null;
  scheduledFor?: Date | string | null;
  completedAt?: Date | string | null;
};

export async function createExplanationEntitlementRecord(
  input: CreateExplanationEntitlementInput
) {
  return prisma.explanationEntitlement.create({
    data: {
      userId: input.userId,
      sourcePurchaseId: input.sourcePurchaseId,
      reportId: input.reportId ?? null,
      assessmentSlug: input.assessmentSlug ?? null,
      topicKey: input.topicKey ?? null,
      title: input.title,
      durationMinutes: input.durationMinutes,
      regionKey: input.regionKey ?? null,
      currency: input.currency ?? "INR",
      amountCents: input.amountCents,
      status: input.status ?? "READY_FOR_CONTACT",
      notes: input.notes,
      grantedAt: toOptionalDate(input.grantedAt) ?? new Date(),
      scheduledFor: toOptionalDate(input.scheduledFor),
      completedAt: toOptionalDate(input.completedAt)
    }
  });
}

export async function listExplanationEntitlementsForUser(userId: string) {
  return prisma.explanationEntitlement.findMany({
    where: { userId },
    include: {
      sourcePurchase: true,
      report: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function updateExplanationEntitlementById(
  entitlementId: string,
  data: Prisma.ExplanationEntitlementUpdateInput
) {
  return prisma.explanationEntitlement.update({
    where: {
      id: entitlementId
    },
    data
  });
}
