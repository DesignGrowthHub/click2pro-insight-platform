import "server-only";

import type {
  DeliveryStatus,
  FileProcessingStatus,
  Prisma,
  ReportAccessStatus,
  ReportStatus,
  ReportTier
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type CreateReportRecordInput = {
  userId: string;
  assessmentSessionId?: string | null;
  sourcePurchaseId?: string | null;
  sourceAttributionId?: string | null;
  assessmentSlug: string;
  topicKey: string;
  title: string;
  subtitle?: string | null;
  tier?: ReportTier;
  status?: ReportStatus;
  accessStatus?: ReportAccessStatus;
  previewPayload?: Prisma.InputJsonValue;
  resultProfile?: Prisma.InputJsonValue;
  reportPayload?: Prisma.InputJsonValue;
  aiPayload?: Prisma.InputJsonValue;
  aiSections?: Prisma.InputJsonValue;
  pdfStatus?: FileProcessingStatus;
  emailStatus?: DeliveryStatus | null;
  generatedAt?: Date | string | null;
  unlockedAt?: Date | string | null;
};

export async function createReportRecord(input: CreateReportRecordInput) {
  return prisma.report.create({
    data: {
      userId: input.userId,
      assessmentSessionId: input.assessmentSessionId ?? null,
      sourcePurchaseId: input.sourcePurchaseId ?? null,
      sourceAttributionId: input.sourceAttributionId ?? null,
      assessmentSlug: input.assessmentSlug,
      topicKey: input.topicKey,
      title: input.title,
      subtitle: input.subtitle ?? null,
      tier: input.tier ?? "STANDARD",
      status: input.status ?? "READY",
      accessStatus: input.accessStatus ?? "OWNED",
      previewPayload: input.previewPayload,
      resultProfile: input.resultProfile,
      reportPayload: input.reportPayload,
      aiPayload: input.aiPayload,
      aiSections: input.aiSections,
      pdfStatus: input.pdfStatus ?? "PENDING",
      emailStatus: input.emailStatus ?? null,
      generatedAt: toOptionalDate(input.generatedAt) ?? new Date(),
      unlockedAt: toOptionalDate(input.unlockedAt)
    }
  });
}

export async function getOwnedReportsForUser(userId: string) {
  return prisma.report.findMany({
    where: { userId },
    include: {
      sourcePurchase: true,
      emailDeliveries: {
        orderBy: {
          createdAt: "desc"
        }
      },
      downloadRecords: {
        orderBy: {
          downloadedAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getOwnedReportById(userId: string, reportId: string) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      userId
    },
    include: {
      sourcePurchase: true,
      emailDeliveries: true,
      downloadRecords: true
    }
  });
}

export async function getOwnedReportBySlug(userId: string, assessmentSlug: string) {
  return prisma.report.findFirst({
    where: {
      userId,
      assessmentSlug
    },
    include: {
      assessmentSession: {
        include: {
          sourceAttribution: true
        }
      },
      sourcePurchase: {
        include: {
          sourceAttribution: true
        }
      },
      sourceAttribution: true,
      emailDeliveries: {
        orderBy: {
          createdAt: "desc"
        }
      },
      downloadRecords: {
        orderBy: {
          downloadedAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function updateReportById(
  id: string,
  data: Prisma.ReportUpdateInput | Prisma.ReportUncheckedUpdateInput
) {
  return prisma.report.update({
    where: { id },
    data
  });
}
