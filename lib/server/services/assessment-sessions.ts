import "server-only";

import type { AssessmentSessionStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type SaveCompletedAssessmentSessionInput = {
  userId?: string | null;
  anonymousVisitorId?: string | null;
  assessmentSlug: string;
  assessmentTitle?: string | null;
  topicKey?: string | null;
  sourceAttributionId?: string | null;
  status?: AssessmentSessionStatus;
  answers: Prisma.InputJsonValue;
  scoringPayload?: Prisma.InputJsonValue;
  resultProfile?: Prisma.InputJsonValue;
  previewPayload?: Prisma.InputJsonValue;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  paidAt?: Date | string | null;
};

export async function saveCompletedAssessmentSession(
  input: SaveCompletedAssessmentSessionInput
) {
  return prisma.assessmentSession.create({
    data: {
      userId: input.userId ?? null,
      anonymousVisitorId: input.anonymousVisitorId ?? null,
      assessmentSlug: input.assessmentSlug,
      assessmentTitle: input.assessmentTitle ?? null,
      topicKey: input.topicKey ?? null,
      sourceAttributionId: input.sourceAttributionId ?? null,
      status: input.status ?? "COMPLETED",
      answers: input.answers,
      scoringPayload: input.scoringPayload,
      resultProfile: input.resultProfile,
      previewPayload: input.previewPayload,
      startedAt: toOptionalDate(input.startedAt),
      completedAt: toOptionalDate(input.completedAt) ?? new Date(),
      paidAt: toOptionalDate(input.paidAt)
    }
  });
}

export async function getAssessmentSessionsForUser(userId: string) {
  return prisma.assessmentSession.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getAssessmentSessionById(id: string) {
  return prisma.assessmentSession.findUnique({
    where: { id },
    include: {
      sourceAttribution: true,
      reports: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
}

export async function updateAssessmentSessionById(
  id: string,
  data: Prisma.AssessmentSessionUpdateInput
) {
  return prisma.assessmentSession.update({
    where: { id },
    data
  });
}

export async function getLatestCompletedAssessmentSessionForUser(
  userId: string,
  assessmentSlug: string
) {
  return prisma.assessmentSession.findFirst({
    where: {
      userId,
      assessmentSlug,
      status: {
        in: ["COMPLETED", "PREVIEW_VIEWED", "UNLOCK_CLICKED", "PAID"]
      }
    },
    orderBy: {
      completedAt: "desc"
    },
    include: {
      sourceAttribution: true
    }
  });
}

export async function getLatestCompletedAssessmentSessionForAnonymousVisitor(
  anonymousVisitorId: string,
  assessmentSlug: string
) {
  return prisma.assessmentSession.findFirst({
    where: {
      anonymousVisitorId,
      assessmentSlug,
      status: {
        in: ["COMPLETED", "PREVIEW_VIEWED", "UNLOCK_CLICKED", "PAID"]
      }
    },
    orderBy: {
      completedAt: "desc"
    },
    include: {
      sourceAttribution: true
    }
  });
}
