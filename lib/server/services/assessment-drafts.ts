import "server-only";

import type {
  AssessmentDraftGenerationStatus,
  AssessmentDraftJobStatus,
  AssessmentDraftPublishStatus,
  AssessmentDraftQuestionStatus,
  AssessmentDraftReviewStatus,
  Prisma
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { normalizeNullableString } from "@/lib/server/utils";

const assessmentDraftInclude = {
  createdByUser: {
    select: {
      id: true,
      email: true,
      fullName: true
    }
  },
  dimensions: {
    orderBy: {
      order: "asc"
    }
  },
  questions: {
    orderBy: {
      order: "asc"
    }
  },
  issuePage: true,
  previewBlueprint: true,
  reportBlueprint: true,
  generationJobs: {
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.AssessmentDraftInclude;

export type CreateEmptyAssessmentDraftInput = {
  title: string;
  slug: string;
  topicFamily?: string | null;
  targetAudience?: string | null;
  emotionalGoal?: string | null;
  requestedQuestionCount?: number | null;
  desiredTone?: string | null;
  requestedDimensions?: Prisma.InputJsonValue | null;
  previewEmphasisNotes?: string | null;
  reportEmphasisNotes?: string | null;
  sourcePrompt?: string | null;
  generationPrompt?: string | null;
  generationStatus?: AssessmentDraftGenerationStatus;
  reviewStatus?: AssessmentDraftReviewStatus;
  publishStatus?: AssessmentDraftPublishStatus;
  draftVersion?: number;
  notes?: string | null;
  createdByUserId?: string | null;
};

export type UpdateAssessmentDraftMetadataInput = {
  title?: string;
  slug?: string;
  topicFamily?: string | null;
  targetAudience?: string | null;
  emotionalGoal?: string | null;
  requestedQuestionCount?: number | null;
  desiredTone?: string | null;
  requestedDimensions?: Prisma.InputJsonValue | null;
  previewEmphasisNotes?: string | null;
  reportEmphasisNotes?: string | null;
  sourcePrompt?: string | null;
  generationPrompt?: string | null;
  generationStatus?: AssessmentDraftGenerationStatus;
  reviewStatus?: AssessmentDraftReviewStatus;
  publishStatus?: AssessmentDraftPublishStatus;
  draftVersion?: number;
  notes?: string | null;
  createdByUserId?: string | null;
};

export type AssessmentDraftDimensionInput = {
  key: string;
  label: string;
  description?: string | null;
  order: number;
  scoringNotes?: string | null;
  interpretationNotes?: string | null;
};

export type AssessmentDraftQuestionInput = {
  dimensionKey?: string | null;
  questionType: string;
  prompt: string;
  optionSchema?: Prisma.InputJsonValue | null;
  scoringMapping?: Prisma.InputJsonValue | null;
  reverseScored?: boolean;
  order: number;
  status?: AssessmentDraftQuestionStatus;
  notes?: string | null;
};

export type AssessmentDraftIssuePageInput = {
  issueSlug: string;
  pageTitle: string;
  headline: string;
  subheadline?: string | null;
  introCopy?: string | null;
  ctaCopy?: string | null;
  emotionalHook?: string | null;
  faqItems?: Prisma.InputJsonValue | null;
  trustCopy?: Prisma.InputJsonValue | null;
};

export type AssessmentDraftPreviewBlueprintInput = {
  previewTitle?: string | null;
  summaryFraming?: string | null;
  strongestSignalLabels?: Prisma.InputJsonValue | null;
  graphFraming?: string | null;
  whyThisMatters?: string | null;
  whatOpensInFullReport?: string | null;
  pricingFraming?: string | null;
  urgencyNotes?: string | null;
};

export type AssessmentDraftReportBlueprintInput = {
  executiveSummaryFraming?: string | null;
  sectionOrder?: Prisma.InputJsonValue | null;
  sectionIntents?: Prisma.InputJsonValue | null;
  sectionRoleBoundaries?: Prisma.InputJsonValue | null;
  reflectionActionFraming?: string | null;
  relatedInsightsLogic?: string | null;
};

export type CreateAssessmentDraftGenerationJobInput = {
  draftId: string;
  requestedByUserId?: string | null;
  status?: AssessmentDraftJobStatus;
  model?: string | null;
  promptSnapshot?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
};

type ListAssessmentDraftsInput = {
  query?: string;
  reviewStatus?: AssessmentDraftReviewStatus;
  publishStatus?: AssessmentDraftPublishStatus;
  generationStatus?: AssessmentDraftGenerationStatus;
};

export async function createEmptyAssessmentDraft(input: CreateEmptyAssessmentDraftInput) {
  return prisma.assessmentDraft.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      topicFamily: normalizeNullableString(input.topicFamily),
      targetAudience: normalizeNullableString(input.targetAudience),
      emotionalGoal: normalizeNullableString(input.emotionalGoal),
      requestedQuestionCount: input.requestedQuestionCount ?? null,
      desiredTone: normalizeNullableString(input.desiredTone),
      requestedDimensions: input.requestedDimensions ?? undefined,
      previewEmphasisNotes: normalizeNullableString(input.previewEmphasisNotes),
      reportEmphasisNotes: normalizeNullableString(input.reportEmphasisNotes),
      sourcePrompt: normalizeNullableString(input.sourcePrompt),
      generationPrompt: normalizeNullableString(input.generationPrompt),
      generationStatus: input.generationStatus ?? "EMPTY",
      reviewStatus: input.reviewStatus ?? "DRAFT",
      publishStatus: input.publishStatus ?? "DRAFT",
      draftVersion: input.draftVersion ?? 1,
      notes: normalizeNullableString(input.notes),
      createdByUserId: input.createdByUserId ?? null
    },
    include: assessmentDraftInclude
  });
}

export async function getAssessmentDraftById(id: string) {
  return prisma.assessmentDraft.findUnique({
    where: { id },
    include: assessmentDraftInclude
  });
}

export async function getAssessmentDraftBySlug(slug: string) {
  return prisma.assessmentDraft.findUnique({
    where: { slug },
    include: assessmentDraftInclude
  });
}

export async function listAssessmentDrafts(input: ListAssessmentDraftsInput = {}) {
  const query = input.query?.trim();

  return prisma.assessmentDraft.findMany({
    where: {
      ...(query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive"
                }
              },
              {
                slug: {
                  contains: query,
                  mode: "insensitive"
                }
              },
              {
                topicFamily: {
                  contains: query,
                  mode: "insensitive"
                }
              }
            ]
          }
        : {}),
      ...(input.reviewStatus ? { reviewStatus: input.reviewStatus } : {}),
      ...(input.publishStatus ? { publishStatus: input.publishStatus } : {}),
      ...(input.generationStatus ? { generationStatus: input.generationStatus } : {})
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      },
      _count: {
        select: {
          dimensions: true,
          questions: true,
          generationJobs: true
        }
      }
    },
    orderBy: [
      { updatedAt: "desc" },
      { createdAt: "desc" }
    ]
  });
}

export async function updateAssessmentDraftMetadata(
  draftId: string,
  input: UpdateAssessmentDraftMetadataInput
) {
  return prisma.assessmentDraft.update({
    where: { id: draftId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
      ...(input.topicFamily !== undefined
        ? { topicFamily: normalizeNullableString(input.topicFamily) }
        : {}),
      ...(input.targetAudience !== undefined
        ? { targetAudience: normalizeNullableString(input.targetAudience) }
        : {}),
      ...(input.emotionalGoal !== undefined
        ? { emotionalGoal: normalizeNullableString(input.emotionalGoal) }
        : {}),
      ...(input.requestedQuestionCount !== undefined
        ? { requestedQuestionCount: input.requestedQuestionCount ?? null }
        : {}),
      ...(input.desiredTone !== undefined
        ? { desiredTone: normalizeNullableString(input.desiredTone) }
        : {}),
      ...(input.requestedDimensions !== undefined
        ? { requestedDimensions: input.requestedDimensions ?? Prisma.JsonNull }
        : {}),
      ...(input.previewEmphasisNotes !== undefined
        ? { previewEmphasisNotes: normalizeNullableString(input.previewEmphasisNotes) }
        : {}),
      ...(input.reportEmphasisNotes !== undefined
        ? { reportEmphasisNotes: normalizeNullableString(input.reportEmphasisNotes) }
        : {}),
      ...(input.sourcePrompt !== undefined
        ? { sourcePrompt: normalizeNullableString(input.sourcePrompt) }
        : {}),
      ...(input.generationPrompt !== undefined
        ? { generationPrompt: normalizeNullableString(input.generationPrompt) }
        : {}),
      ...(input.generationStatus !== undefined
        ? { generationStatus: input.generationStatus }
        : {}),
      ...(input.reviewStatus !== undefined ? { reviewStatus: input.reviewStatus } : {}),
      ...(input.publishStatus !== undefined ? { publishStatus: input.publishStatus } : {}),
      ...(input.draftVersion !== undefined ? { draftVersion: input.draftVersion } : {}),
      ...(input.notes !== undefined ? { notes: normalizeNullableString(input.notes) } : {}),
      ...(input.createdByUserId !== undefined ? { createdByUserId: input.createdByUserId } : {})
    },
    include: assessmentDraftInclude
  });
}

export async function replaceAssessmentDraftDimensions(
  draftId: string,
  dimensions: AssessmentDraftDimensionInput[]
) {
  await prisma.$transaction([
    prisma.assessmentDraftDimension.deleteMany({
      where: { draftId }
    }),
    ...(dimensions.length > 0
      ? [
          prisma.assessmentDraftDimension.createMany({
            data: dimensions.map((dimension) => ({
              draftId,
              key: dimension.key.trim(),
              label: dimension.label.trim(),
              description: normalizeNullableString(dimension.description),
              order: dimension.order,
              scoringNotes: normalizeNullableString(dimension.scoringNotes),
              interpretationNotes: normalizeNullableString(dimension.interpretationNotes)
            }))
          })
        ]
      : [])
  ]);

  return getAssessmentDraftById(draftId);
}

export async function replaceAssessmentDraftQuestions(
  draftId: string,
  questions: AssessmentDraftQuestionInput[]
) {
  await prisma.$transaction([
    prisma.assessmentDraftQuestion.deleteMany({
      where: { draftId }
    }),
    ...(questions.length > 0
      ? [
          prisma.assessmentDraftQuestion.createMany({
            data: questions.map((question) => ({
              draftId,
              dimensionKey: normalizeNullableString(question.dimensionKey),
              questionType: question.questionType.trim(),
              prompt: question.prompt.trim(),
              optionSchema: question.optionSchema ?? undefined,
              scoringMapping: question.scoringMapping ?? undefined,
              reverseScored: question.reverseScored ?? false,
              order: question.order,
              status: question.status ?? "DRAFT",
              notes: normalizeNullableString(question.notes)
            }))
          })
        ]
      : [])
  ]);

  return getAssessmentDraftById(draftId);
}

export async function upsertAssessmentDraftIssuePage(
  draftId: string,
  input: AssessmentDraftIssuePageInput
) {
  return prisma.assessmentDraftIssuePage.upsert({
    where: { draftId },
    create: {
      draftId,
      issueSlug: input.issueSlug.trim(),
      pageTitle: input.pageTitle.trim(),
      headline: input.headline.trim(),
      subheadline: normalizeNullableString(input.subheadline),
      introCopy: normalizeNullableString(input.introCopy),
      ctaCopy: normalizeNullableString(input.ctaCopy),
      emotionalHook: normalizeNullableString(input.emotionalHook),
      faqItems: input.faqItems ?? undefined,
      trustCopy: input.trustCopy ?? undefined
    },
    update: {
      issueSlug: input.issueSlug.trim(),
      pageTitle: input.pageTitle.trim(),
      headline: input.headline.trim(),
      subheadline: normalizeNullableString(input.subheadline),
      introCopy: normalizeNullableString(input.introCopy),
      ctaCopy: normalizeNullableString(input.ctaCopy),
      emotionalHook: normalizeNullableString(input.emotionalHook),
      faqItems: input.faqItems ?? undefined,
      trustCopy: input.trustCopy ?? undefined
    }
  });
}

export async function upsertAssessmentDraftPreviewBlueprint(
  draftId: string,
  input: AssessmentDraftPreviewBlueprintInput
) {
  return prisma.assessmentDraftPreviewBlueprint.upsert({
    where: { draftId },
    create: {
      draftId,
      previewTitle: normalizeNullableString(input.previewTitle),
      summaryFraming: normalizeNullableString(input.summaryFraming),
      strongestSignalLabels: input.strongestSignalLabels ?? undefined,
      graphFraming: normalizeNullableString(input.graphFraming),
      whyThisMatters: normalizeNullableString(input.whyThisMatters),
      whatOpensInFullReport: normalizeNullableString(input.whatOpensInFullReport),
      pricingFraming: normalizeNullableString(input.pricingFraming),
      urgencyNotes: normalizeNullableString(input.urgencyNotes)
    },
    update: {
      previewTitle: normalizeNullableString(input.previewTitle),
      summaryFraming: normalizeNullableString(input.summaryFraming),
      strongestSignalLabels: input.strongestSignalLabels ?? undefined,
      graphFraming: normalizeNullableString(input.graphFraming),
      whyThisMatters: normalizeNullableString(input.whyThisMatters),
      whatOpensInFullReport: normalizeNullableString(input.whatOpensInFullReport),
      pricingFraming: normalizeNullableString(input.pricingFraming),
      urgencyNotes: normalizeNullableString(input.urgencyNotes)
    }
  });
}

export async function upsertAssessmentDraftReportBlueprint(
  draftId: string,
  input: AssessmentDraftReportBlueprintInput
) {
  return prisma.assessmentDraftReportBlueprint.upsert({
    where: { draftId },
    create: {
      draftId,
      executiveSummaryFraming: normalizeNullableString(input.executiveSummaryFraming),
      sectionOrder: input.sectionOrder ?? undefined,
      sectionIntents: input.sectionIntents ?? undefined,
      sectionRoleBoundaries: input.sectionRoleBoundaries ?? undefined,
      reflectionActionFraming: normalizeNullableString(input.reflectionActionFraming),
      relatedInsightsLogic: normalizeNullableString(input.relatedInsightsLogic)
    },
    update: {
      executiveSummaryFraming: normalizeNullableString(input.executiveSummaryFraming),
      sectionOrder: input.sectionOrder ?? undefined,
      sectionIntents: input.sectionIntents ?? undefined,
      sectionRoleBoundaries: input.sectionRoleBoundaries ?? undefined,
      reflectionActionFraming: normalizeNullableString(input.reflectionActionFraming),
      relatedInsightsLogic: normalizeNullableString(input.relatedInsightsLogic)
    }
  });
}

export async function createAssessmentDraftGenerationJob(
  input: CreateAssessmentDraftGenerationJobInput
) {
  return prisma.assessmentDraftGenerationJob.create({
    data: {
      draftId: input.draftId,
      requestedByUserId: input.requestedByUserId ?? null,
      status: input.status ?? "QUEUED",
      model: normalizeNullableString(input.model),
      promptSnapshot: normalizeNullableString(input.promptSnapshot),
      metadata: input.metadata ?? undefined,
      errorMessage: normalizeNullableString(input.errorMessage),
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null
    }
  });
}

export async function updateAssessmentDraftGenerationJob(
  jobId: string,
  data: Prisma.AssessmentDraftGenerationJobUpdateInput
) {
  return prisma.assessmentDraftGenerationJob.update({
    where: { id: jobId },
    data
  });
}
