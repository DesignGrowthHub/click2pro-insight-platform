import "server-only";

import type { BundleAccessStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type CreateOwnedBundleInput = {
  userId: string;
  sourcePurchaseId: string;
  primaryAssessmentSlug?: string | null;
  title: string;
  description?: string | null;
  includedAssessmentSlugs: Prisma.InputJsonValue;
  accessStatus?: BundleAccessStatus;
  metadata?: Prisma.InputJsonValue;
  purchasedAt?: Date | string | null;
};

export async function createOwnedBundleRecord(input: CreateOwnedBundleInput) {
  return prisma.ownedBundle.create({
    data: {
      userId: input.userId,
      sourcePurchaseId: input.sourcePurchaseId,
      primaryAssessmentSlug: input.primaryAssessmentSlug ?? null,
      title: input.title,
      description: input.description ?? null,
      includedAssessmentSlugs: input.includedAssessmentSlugs,
      accessStatus: input.accessStatus ?? "ACTIVE",
      metadata: input.metadata,
      purchasedAt: toOptionalDate(input.purchasedAt)
    }
  });
}

export async function listOwnedBundlesForUser(userId: string) {
  return prisma.ownedBundle.findMany({
    where: { userId },
    include: {
      sourcePurchase: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
