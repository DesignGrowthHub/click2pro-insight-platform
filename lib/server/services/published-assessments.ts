import "server-only";

import type { Prisma } from "@prisma/client";

import type { Assessment } from "@/lib/assessments";
import { getAssessmentDefinitionBySlug } from "@/lib/assessments";
import {
  getIssuePageBySlug,
  type IssuePageContent,
  type IssuePageFaqItem
} from "@/lib/content/issue-pages";
import { prisma } from "@/lib/db/prisma";
import { createStandardReportBlueprint } from "@/lib/reports/blueprints";
import { getAssessmentDraftById, updateAssessmentDraftMetadata } from "@/lib/server/services/assessment-drafts";
import type {
  AnswerOption,
  AssessmentDefinition,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentSection,
  PublishedPreviewBlueprintContext,
  PublishedReportBlueprintContext,
  PreviewSectionDefinition,
  ReportSectionState,
  ScoreBand,
  ScoreDimension
} from "@/lib/types/assessment-domain";

type DraftRecord = NonNullable<Awaited<ReturnType<typeof getAssessmentDraftById>>>;

type PublishedAssessmentRecord = Awaited<
  ReturnType<typeof prisma.publishedAssessment.findUnique>
>;

type PublishedIssuePageRecord = Awaited<
  ReturnType<typeof prisma.publishedIssuePage.findUnique>
>;

type PublishAssessmentDraftInput = {
  draftId: string;
  publishedByUserId: string;
};

const REPORT_BLUEPRINT_SECTION_SLOTS = [
  {
    index: 0,
    canonicalKey: "core_pattern",
    sectionId: "pattern-summary",
    fallbackTitle: "Core Pattern"
  },
  {
    index: 1,
    canonicalKey: "pressure_points",
    sectionId: "emotional-drivers",
    fallbackTitle: "Pressure Points"
  },
  {
    index: 2,
    canonicalKey: "performance_tendencies",
    sectionId: "daily-life-impact",
    fallbackTitle: "Performance Tendencies"
  },
  {
    index: 3,
    canonicalKey: "hidden_friction",
    sectionId: "blind-spots-or-tension-areas",
    fallbackTitle: "Hidden Friction"
  },
  {
    index: 4,
    canonicalKey: "stabilizing_signals",
    sectionId: "stability-suggestions",
    fallbackTitle: "Stabilizing Signals"
  }
] as const;

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeDimensionKey(value: string) {
  return sanitizeSlug(value).replace(/-/g, "_");
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalText(value: unknown) {
  const normalized = cleanText(value);
  return normalized || null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function toTitleCase(value: string) {
  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pickShortLabel(label: string) {
  const first = label.split(/\s+/)[0]?.trim();
  return first && first.length <= 14 ? first : label.slice(0, 14).trim();
}

function buildBandDescriptions(label: string, description: string | null) {
  const clause =
    description && description.length > 12
      ? description
      : `${label.toLowerCase()} is actively shaping the pattern`;

  return {
    low: `Little evidence suggests ${clause}.`,
    moderate: `Some signs suggest ${clause}.`,
    elevated: `Clear signs suggest ${clause}.`,
    high: `${label} appears to be one of the strongest forces in this pattern.`
  } satisfies Record<ScoreBand, string>;
}

function estimateMinutes(questionCount: number) {
  return Math.max(6, Math.min(20, Math.ceil(questionCount / 5)));
}

function buildIssueFaqItems(value: unknown): IssuePageFaqItem[] {
  const items = Array.isArray(value) ? value : [];

  return items
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const question = cleanText((entry as { question?: unknown }).question);
        const answer = cleanText((entry as { answer?: unknown }).answer);

        if (question && answer) {
          return { question, answer };
        }
      }

      const line = cleanText(entry);

      if (!line) {
        return null;
      }

      const dashSplit = line.split(/\s+(?:—|–|-|:)\s+/);
      if (dashSplit.length >= 2) {
        return {
          question: dashSplit[0].trim(),
          answer: dashSplit.slice(1).join(" — ").trim()
        };
      }

      const questionMarkIndex = line.indexOf("?");
      if (questionMarkIndex !== -1 && questionMarkIndex < line.length - 1) {
        return {
          question: line.slice(0, questionMarkIndex + 1).trim(),
          answer: line.slice(questionMarkIndex + 1).trim()
        };
      }

      return {
        question: line,
        answer:
          "This assessment is designed to help you read the pattern more clearly before going deeper."
      };
    })
    .filter((item): item is IssuePageFaqItem => Boolean(item));
}

function buildClarifiesItems(draft: DraftRecord) {
  const dimensionDerived = draft.dimensions
    .slice(0, 4)
    .map((dimension) => dimension.description || `How ${dimension.label.toLowerCase()} may be shaping the pattern`);
  const previewSignals = normalizeStringArray(
    draft.previewBlueprint?.strongestSignalLabels ?? null
  ).map((label) => `Whether ${label.toLowerCase()} is one of the strongest signals in your responses`);

  return Array.from(new Set([...dimensionDerived, ...previewSignals])).slice(0, 4);
}

function mapDraftQuestionType(questionType: string): AssessmentQuestionType {
  switch (questionType) {
    case "likert_scale":
      return "scale";
    case "situational_choice":
      return "situational";
    case "forced_choice":
      return "forced_choice";
    case "binary_choice":
    case "multiple_choice":
    default:
      return "multiple_choice";
  }
}

function normalizeWeights(
  rawMapping: unknown,
  fallbackDimensionKey: string | null
): Record<string, number> {
  if (!rawMapping || typeof rawMapping !== "object") {
    return fallbackDimensionKey ? { [fallbackDimensionKey]: 0 } : {};
  }

  const entries = Object.entries(rawMapping as Record<string, unknown>)
    .map(([rawKey, rawValue]) => {
      const normalizedKey =
        rawKey === "dimension_key" && fallbackDimensionKey
          ? fallbackDimensionKey
          : sanitizeDimensionKey(rawKey);
      const numericValue =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : NaN;

      return Number.isFinite(numericValue)
        ? [normalizedKey, numericValue] as const
        : null;
    })
    .filter((entry): entry is readonly [string, number] => Boolean(entry));

  if (entries.length === 0 && fallbackDimensionKey) {
    return { [fallbackDimensionKey]: 0 };
  }

  return Object.fromEntries(entries);
}

function buildOptionsForDraftQuestion(
  question: DraftRecord["questions"][number]
): AnswerOption[] {
  const optionSchema =
    question.optionSchema && typeof question.optionSchema === "object"
      ? (question.optionSchema as { options?: Array<Record<string, unknown>> })
      : null;
  const scoringMapping =
    question.scoringMapping && typeof question.scoringMapping === "object"
      ? (question.scoringMapping as Record<string, unknown>)
      : {};
  const optionSeeds = Array.isArray(optionSchema?.options) ? optionSchema.options : [];

  const normalizedOptions = optionSeeds
    .map((option, index) => {
      const rawValue = cleanText(option.value ?? option.id ?? option.label ?? `option_${index + 1}`);
      const optionId = sanitizeSlug(rawValue || `option-${index + 1}`);
      const label = cleanText(option.label) || toTitleCase(optionId);
      const dimensionWeights = normalizeWeights(
        scoringMapping[rawValue] ?? scoringMapping[optionId] ?? scoringMapping[index.toString()],
        question.dimensionKey
      );

      return {
        id: optionId,
        label,
        description: cleanOptionalText(option.description),
        value: typeof option.value === "number" ? option.value : index,
        dimensionWeights,
        contextMarkers: normalizeStringArray((option as { contextMarkers?: unknown }).contextMarkers)
      } satisfies AnswerOption;
    })
    .filter((option) => option.label);

  if (normalizedOptions.length > 0) {
    return normalizedOptions;
  }

  const fallbackKeys = Object.keys(scoringMapping);

  return fallbackKeys.map((key, index) => ({
    id: sanitizeSlug(key || `option-${index + 1}`),
    label: toTitleCase(key || `option-${index + 1}`),
    value: index,
    dimensionWeights: normalizeWeights(scoringMapping[key], question.dimensionKey)
  }));
}

function buildAssessmentSections(
  slug: string,
  draft: DraftRecord
): AssessmentSection[] {
  const dimensionSections = draft.dimensions.map((dimension) => {
    const sectionId = `${slug}-${dimension.key}`;

    return {
      id: sectionId,
      title: dimension.label,
      description:
        dimension.description ??
        `Signals related to ${dimension.label.toLowerCase()} across the assessment.`,
      intent:
        dimension.scoringNotes ??
        dimension.interpretationNotes ??
        `Understand how ${dimension.label.toLowerCase()} contributes to the broader pattern.`,
      questionIds: [] as string[]
    };
  });

  return dimensionSections.length > 0
    ? dimensionSections
    : [
        {
          id: `${slug}-core-pattern`,
          title: "Core Pattern",
          description: "Primary signals captured across the assessment.",
          intent: "Read the strongest version of the pattern first.",
          questionIds: []
        }
      ];
}

function buildRuntimeQuestions(
  slug: string,
  draft: DraftRecord,
  sections: AssessmentSection[]
): AssessmentQuestion[] {
  const fallbackSectionId = sections[0]?.id ?? `${slug}-core-pattern`;
  const sectionByDimensionKey = new Map(
    draft.dimensions.map((dimension) => [dimension.key, `${slug}-${dimension.key}`] as const)
  );

  return draft.questions
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((question, index) => {
      const questionId = `${slug}-q${index + 1}`;
      const sectionId =
        (question.dimensionKey && sectionByDimensionKey.get(question.dimensionKey)) ??
        fallbackSectionId;
      const options = buildOptionsForDraftQuestion(question);
      const dimensionKeys = Array.from(
        new Set(
          options.flatMap((option) => Object.keys(option.dimensionWeights)).filter(Boolean)
        )
      );

      return {
        id: questionId,
        sectionId,
        prompt: question.prompt,
        type: mapDraftQuestionType(question.questionType),
        scaleKey: question.questionType === "likert_scale" ? "truth" : undefined,
        helperText: question.notes ?? undefined,
        reverseScored: question.reverseScored,
        optionLayout:
          question.questionType === "forced_choice" || question.questionType === "binary_choice"
            ? "grid"
            : "stack",
        dimensionKeys,
        options
      } satisfies AssessmentQuestion;
    });
}

function applyQuestionIdsToSections(
  sections: AssessmentSection[],
  questions: AssessmentQuestion[]
) {
  const questionsBySection = new Map<string, string[]>();

  questions.forEach((question) => {
    const existing = questionsBySection.get(question.sectionId) ?? [];
    existing.push(question.id);
    questionsBySection.set(question.sectionId, existing);
  });

  return sections.map((section) => ({
    ...section,
    questionIds: questionsBySection.get(section.id) ?? []
  }));
}

function buildRuntimeDimensions(draft: DraftRecord): ScoreDimension[] {
  return draft.dimensions
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      shortLabel: pickShortLabel(dimension.label),
      description:
        dimension.description ??
        `${dimension.label} is one of the important pattern signals in this topic.`,
      bandDescriptions: buildBandDescriptions(dimension.label, dimension.description)
    }));
}

function mapSectionOrderLabel(value: string | undefined, fallback: string) {
  const cleaned = cleanText(value);
  return cleaned ? toTitleCase(cleaned) : fallback;
}

function pickDraftBlueprintValue(
  record: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const rawValue = record[key];
    const value = Array.isArray(rawValue)
      ? normalizeStringArray(rawValue).join(" ").trim() || null
      : cleanOptionalText(rawValue);

    if (value) {
      return value;
    }
  }

  return null;
}

function buildPublishedPreviewContext(
  draft: DraftRecord
): PublishedPreviewBlueprintContext | null {
  const previewBlueprint = draft.previewBlueprint;

  if (!previewBlueprint) {
    return null;
  }

  return {
    previewTitle: cleanOptionalText(previewBlueprint.previewTitle),
    openingReadFraming: cleanOptionalText(previewBlueprint.summaryFraming),
    strongestSignalLabels: normalizeStringArray(previewBlueprint.strongestSignalLabels),
    graphLabelFraming: cleanOptionalText(previewBlueprint.graphFraming),
    whyThisMatters: cleanOptionalText(previewBlueprint.whyThisMatters),
    whatOpensInFullReport: cleanOptionalText(previewBlueprint.whatOpensInFullReport),
    pricingFraming: cleanOptionalText(previewBlueprint.pricingFraming),
    urgencyNotes: cleanOptionalText(previewBlueprint.urgencyNotes)
  };
}

function buildPublishedReportContext(
  draft: DraftRecord
): PublishedReportBlueprintContext | null {
  const reportBlueprint = draft.reportBlueprint;

  if (!reportBlueprint) {
    return null;
  }

  const sectionOrder = normalizeStringArray(reportBlueprint.sectionOrder);
  const sectionIntentRecord =
    reportBlueprint.sectionIntents &&
    typeof reportBlueprint.sectionIntents === "object"
      ? (reportBlueprint.sectionIntents as Record<string, unknown>)
      : {};
  const roleBoundaryRecord =
    reportBlueprint.sectionRoleBoundaries &&
    typeof reportBlueprint.sectionRoleBoundaries === "object"
      ? (reportBlueprint.sectionRoleBoundaries as Record<string, unknown>)
      : {};

  return {
    executiveSummaryFraming: cleanOptionalText(
      reportBlueprint.executiveSummaryFraming
    ),
    sectionOrder,
    sectionIntents: Object.fromEntries(
      REPORT_BLUEPRINT_SECTION_SLOTS.map((slot) => {
        const sectionTitle = sectionOrder[slot.index] ?? slot.fallbackTitle;
        const value = pickDraftBlueprintValue(sectionIntentRecord, [
          slot.canonicalKey,
          slot.sectionId,
          sectionTitle,
          sanitizeSlug(sectionTitle),
          sanitizeDimensionKey(sectionTitle)
        ]);

        return value ? [slot.sectionId, value] : null;
      }).filter(
        (entry): entry is [string, string] => Array.isArray(entry) && Boolean(entry[1])
      )
    ),
    sectionRoleBoundaries: Object.fromEntries(
      REPORT_BLUEPRINT_SECTION_SLOTS.map((slot) => {
        const sectionTitle = sectionOrder[slot.index] ?? slot.fallbackTitle;
        const value = pickDraftBlueprintValue(roleBoundaryRecord, [
          slot.canonicalKey,
          slot.sectionId,
          sectionTitle,
          sanitizeSlug(sectionTitle),
          sanitizeDimensionKey(sectionTitle)
        ]);

        return value ? [slot.sectionId, value] : null;
      }).filter(
        (entry): entry is [string, string] => Array.isArray(entry) && Boolean(entry[1])
      )
    ),
    reflectionActionFraming: cleanOptionalText(
      reportBlueprint.reflectionActionFraming
    ),
    relatedInsightsLogic: cleanOptionalText(reportBlueprint.relatedInsightsLogic)
  };
}

function buildPreviewSections(draft: DraftRecord): PreviewSectionDefinition[] {
  const strongestSignalLabels = normalizeStringArray(
    draft.previewBlueprint?.strongestSignalLabels ?? null
  );

  return [
    {
      sectionId: "pattern-summary",
      label: "Pattern Summary",
      promise:
        draft.previewBlueprint?.summaryFraming ??
        "See the strongest pattern taking shape before deciding whether to unlock the full report."
    },
    {
      sectionId: "what-responses-suggest",
      label: "What Your Responses Suggest",
      promise:
        strongestSignalLabels.length > 0
          ? `See how ${strongestSignalLabels.slice(0, 3).join(", ")} appear in your responses.`
          : "Review the strongest signals before opening the deeper interpretation."
    },
    {
      sectionId: "related-next-insights",
      label: "What Opens In The Full Report",
      promise:
        draft.previewBlueprint?.whatOpensInFullReport ??
        "Unlock the deeper report to see the fuller mechanism, pressure points, and stabilizing guidance."
    }
  ];
}

function buildRuntimeReportBlueprint(
  draft: DraftRecord,
  slug: string,
  title: string
) {
  const publishedContext = buildPublishedReportContext(draft);
  const sectionOrder = publishedContext?.sectionOrder ?? [];
  const blueprint = createStandardReportBlueprint({
    assessmentSlug: slug,
    title: draft.previewBlueprint?.previewTitle ?? `${title} report`,
    subtitle:
      publishedContext?.executiveSummaryFraming ??
      "A structured paid report that expands the preview into a deeper behavioral reading.",
    previewPromises: buildPreviewSections(draft),
    sectionTitles: {
      patternSummary: mapSectionOrderLabel(sectionOrder[0], "Core Pattern"),
      emotionalDrivers: mapSectionOrderLabel(sectionOrder[1], "Pressure Points"),
      dailyLifeImpact: mapSectionOrderLabel(
        sectionOrder[2],
        "Performance Tendencies"
      ),
      blindSpots: mapSectionOrderLabel(sectionOrder[3], "Hidden Friction"),
      stabilitySuggestions: mapSectionOrderLabel(
        sectionOrder[4],
        "Stabilizing Signals"
      )
    },
    sectionDescriptions: {
      patternSummary:
        publishedContext?.sectionIntents["pattern-summary"] ??
        "The strongest version of the pattern and how it appears at a high level.",
      emotionalDrivers:
        publishedContext?.sectionIntents["emotional-drivers"] ??
        "The pressure and emotional sensitivity keeping the pattern active.",
      dailyLifeImpact:
        publishedContext?.sectionIntents["daily-life-impact"] ??
        "How the pattern tends to show up in everyday behavior and response style.",
      blindSpots:
        publishedContext?.sectionIntents["blind-spots-or-tension-areas"] ??
        "The friction, contradiction, or blind spots that can make the pattern harder to read.",
      stabilitySuggestions:
        publishedContext?.sectionIntents["stability-suggestions"] ??
        "Grounded guidance on what helps the pattern feel steadier or clearer."
    }
  });

  blueprint.sections = blueprint.sections.map((section) => ({
    ...section,
    narrativeIntent:
      publishedContext?.sectionIntents[section.id] || section.narrativeIntent,
    roleBoundary:
      publishedContext?.sectionRoleBoundaries[section.id] ?? null
  }));
  blueprint.publishedContext = publishedContext;

  return blueprint;
}

function buildAssessmentSummaryFromDefinition(assessment: AssessmentDefinition): Assessment {
  return {
    slug: assessment.slug,
    title: assessment.title,
    category: assessment.category,
    descriptor: assessment.subtitle,
    tagline: assessment.subtitle,
    summary: assessment.targetPainPoint,
    questionCount: `${assessment.questionCount} questions`,
    timeEstimate: assessment.estimatedTimeLabel,
    privacy: assessment.privacyNote,
    reportLabel: assessment.reportLabel,
    discoveryCategories: [assessment.category],
    problemTags: assessment.dimensions.map((dimension) => dimension.label),
    issuePhrases: [assessment.targetPainPoint, assessment.previewPromise],
    searchKeywords: Array.from(
      new Set(
        [
          assessment.slug,
          assessment.topicKey,
          assessment.title,
          assessment.category,
          ...assessment.dimensions.map((dimension) => dimension.label),
          ...assessment.categoryTags,
          ...assessment.bundleTags
        ]
          .join(" ")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
      )
    ),
    featured: false,
    focusPoints: assessment.focusAreas,
    outcomes: assessment.outcomeHighlights,
    reportSections: assessment.reportBlueprint.sections.map((section) => ({
      title: section.title,
      description: section.description,
      state: (section.access === "preview" ? "open" : "locked") as ReportSectionState
    })),
    recommendedSlugs: assessment.relatedAssessments.map((item) => item.slug),
    buildStatus: assessment.buildStatus
  };
}

function buildIssuePageContentFromDraft(
  draft: DraftRecord,
  linkedAssessmentSlug: string
): IssuePageContent {
  const issuePage = draft.issuePage;
  const trustCopy = normalizeStringArray(issuePage?.trustCopy ?? null);

  return {
    slug: issuePage?.issueSlug ?? draft.slug,
    publicTopicTitle: issuePage?.headline ?? draft.title,
    publicTopicSubtitle:
      issuePage?.subheadline ??
      issuePage?.introCopy ??
      draft.targetAudience ??
      draft.emotionalGoal ??
      "A structured issue page that guides the user into the assessment.",
    heroCtaLabel: issuePage?.ctaCopy ?? "Start Assessment",
    heroTrustNote:
      trustCopy[0] ?? "Private, structured, and designed to help clarify the pattern quickly.",
    heroImageType: "abstract_pattern",
    heroImageUrl: null,
    heroImageAlt: null,
    reassuranceTitle:
      issuePage?.emotionalHook ??
      "If this pattern already feels close, you do not need a perfect label before starting.",
    reassuranceBody:
      issuePage?.introCopy ??
      draft.emotionalGoal ??
      "This assessment is designed to turn a familiar but hard-to-name issue into a clearer pattern read.",
    reflections: [],
    clarifiesTitle: "What this helps clarify",
    clarifiesItems: buildClarifiesItems(draft),
    faqTitle: "Questions people usually have before starting",
    faqItems: buildIssueFaqItems(issuePage?.faqItems ?? null),
    finalCtaTitle:
      issuePage?.headline ??
      `If ${draft.title.toLowerCase()} feels active, start the assessment now.`,
    finalCtaBody:
      draft.previewBlueprint?.whyThisMatters ??
      "The assessment is meant to give you a fast, private read on whether the deeper report will actually feel worth opening.",
    finalCtaLabel: issuePage?.ctaCopy ?? "Start Assessment",
    linkedAssessmentSlug,
    seoTitle: issuePage?.pageTitle ?? draft.title,
    metaDescription:
      issuePage?.subheadline ??
      issuePage?.introCopy ??
      draft.targetAudience ??
      draft.emotionalGoal ??
      `${draft.title} issue page for Click2Pro Insight.`
  };
}

function buildAssessmentDefinitionFromDraft(draft: DraftRecord): AssessmentDefinition {
  const slug = draft.slug;
  const questionCount = draft.questions.length;
  const estimatedTimeMinutes = estimateMinutes(questionCount);
  const sections = buildAssessmentSections(slug, draft);
  const questions = buildRuntimeQuestions(slug, draft, sections);
  const populatedSections = applyQuestionIdsToSections(sections, questions);
  const dimensions = buildRuntimeDimensions(draft);
  const title = draft.title;
  const subtitle =
    draft.issuePage?.subheadline ??
    draft.targetAudience ??
    draft.emotionalGoal ??
    "A structured behavioral insight assessment.";
  const topicFamily = cleanText(draft.topicFamily) || "Behavioral Insight";
  const previewPromise =
    draft.previewBlueprint?.summaryFraming ??
    draft.previewBlueprint?.previewTitle ??
    "A clearer view of the strongest pattern before you decide whether to unlock the deeper report.";
  const previewExperience = buildPublishedPreviewContext(draft);

  return {
    id: `published-${draft.id}`,
    slug,
    topicKey: sanitizeSlug(draft.topicFamily ?? draft.slug),
    title,
    subtitle,
    category: toTitleCase(topicFamily),
    buildStatus: "deep_seeded",
    estimatedTimeMinutes,
    estimatedTimeLabel: `${estimatedTimeMinutes} minutes`,
    questionCount,
    privacyNote: "Private and confidential",
    targetPainPoint:
      draft.emotionalGoal ??
      draft.issuePage?.introCopy ??
      `A structured read on whether ${title.toLowerCase()} is the right issue to focus on.`,
    previewPromise,
    reportLabel: `${title} insight report`,
    focusAreas: draft.dimensions
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((dimension) => dimension.label)
      .slice(0, 5),
    outcomeHighlights: buildClarifiesItems(draft),
    introBullets: normalizeStringArray(draft.issuePage?.trustCopy ?? null).slice(0, 3),
    bundleTags: [sanitizeSlug(topicFamily)],
    categoryTags: [sanitizeSlug(topicFamily)],
    dimensions,
    sections: populatedSections,
    questions,
    relatedAssessments: [],
    reportBlueprint: buildRuntimeReportBlueprint(draft, slug, title),
    subscriptionUpsellNote:
      draft.previewBlueprint?.whatOpensInFullReport ??
      "Unlock the deeper report if the opening read already feels accurate enough to matter.",
    previewExperience
  };
}

function parsePublishedAssessmentRecord(record: PublishedAssessmentRecord) {
  if (!record) {
    return null;
  }

  const assessmentDefinition = record.assessmentDefinition as AssessmentDefinition;
  const assessmentSummary = record.assessmentSummary as Assessment;

  if (
    !assessmentDefinition?.slug ||
    !assessmentDefinition?.title ||
    !Array.isArray(assessmentDefinition.dimensions) ||
    !Array.isArray(assessmentDefinition.questions) ||
    !assessmentDefinition.reportBlueprint ||
    !assessmentSummary?.slug ||
    !assessmentSummary?.title
  ) {
    return null;
  }

  return {
    assessmentDefinition,
    assessmentSummary
  };
}

function parsePublishedIssuePageRecord(record: PublishedIssuePageRecord) {
  if (!record) {
    return null;
  }

  const issuePageContent = record.issuePageContent as IssuePageContent;

  if (
    !issuePageContent?.slug ||
    !issuePageContent?.linkedAssessmentSlug ||
    !issuePageContent?.publicTopicTitle ||
    !issuePageContent?.seoTitle
  ) {
    return null;
  }

  return issuePageContent;
}

function assertPublishableDraftContent(
  draft: DraftRecord,
  assessmentDefinition: AssessmentDefinition,
  issuePageContent: IssuePageContent
) {
  if (!sanitizeSlug(draft.slug)) {
    throw new Error("Draft slug must be set before publishing.");
  }

  if (!cleanText(draft.title)) {
    throw new Error("Draft title must be set before publishing.");
  }

  if (!sanitizeSlug(issuePageContent.slug)) {
    throw new Error("Issue-page slug must be set before publishing.");
  }

  if (!cleanText(issuePageContent.publicTopicTitle)) {
    throw new Error("Issue-page headline must be set before publishing.");
  }

  if (!cleanText(issuePageContent.seoTitle)) {
    throw new Error("Issue-page page title must be set before publishing.");
  }

  const dimensionKeys = assessmentDefinition.dimensions.map((dimension) => dimension.key);
  const uniqueDimensionKeys = new Set(dimensionKeys);

  if (uniqueDimensionKeys.size !== dimensionKeys.length) {
    throw new Error("Published dimensions must have unique keys.");
  }

  if (dimensionKeys.some((key) => !cleanText(key))) {
    throw new Error("Every published dimension must have a valid key.");
  }

  if (
    assessmentDefinition.dimensions.some((dimension) => !cleanText(dimension.label))
  ) {
    throw new Error("Every published dimension must have a label.");
  }

  if (assessmentDefinition.questions.length < 10) {
    throw new Error("Published assessments must include at least 10 valid questions.");
  }

  if (
    assessmentDefinition.questions.some(
      (question) => !cleanText(question.prompt) || question.options.length < 2
    )
  ) {
    throw new Error(
      "Every published question must include a prompt and at least two answer options."
    );
  }
}

async function assertPublishConflictsClear(
  draft: DraftRecord,
  issueSlug: string
) {
  if (getAssessmentDefinitionBySlug(draft.slug)) {
    throw new Error(
      `The assessment slug "${draft.slug}" already belongs to a seeded live assessment. Use a different slug before publishing.`
    );
  }

  if (getIssuePageBySlug(issueSlug)) {
    throw new Error(
      `The issue slug "${issueSlug}" already belongs to a seeded live issue page. Use a different issue slug before publishing.`
    );
  }

  const conflictingPublishedAssessment = await prisma.publishedAssessment.findFirst({
    where: {
      slug: draft.slug,
      sourceDraftId: {
        not: draft.id
      }
    },
    select: {
      id: true
    }
  });

  if (conflictingPublishedAssessment) {
    throw new Error(
      `Another published assessment already uses the slug "${draft.slug}".`
    );
  }

  const conflictingPublishedIssuePage = await prisma.publishedIssuePage.findFirst({
    where: {
      issueSlug,
      sourceDraftId: {
        not: draft.id
      }
    },
    select: {
      id: true
    }
  });

  if (conflictingPublishedIssuePage) {
    throw new Error(
      `Another published issue page already uses the slug "${issueSlug}".`
    );
  }
}

export async function publishAssessmentDraft({
  draftId,
  publishedByUserId
}: PublishAssessmentDraftInput) {
  const draft = await getAssessmentDraftById(draftId);

  if (!draft) {
    throw new Error("Assessment draft not found.");
  }

  if (draft.reviewStatus !== "APPROVED") {
    throw new Error("Only approved drafts can be published.");
  }

  if (!draft.issuePage) {
    throw new Error("Add issue-page content before publishing.");
  }

  if (!draft.previewBlueprint) {
    throw new Error("Add the preview blueprint before publishing.");
  }

  if (!draft.reportBlueprint) {
    throw new Error("Add the report blueprint before publishing.");
  }

  if (draft.dimensions.length < 3) {
    throw new Error("Add at least three dimensions before publishing.");
  }

  if (draft.questions.length < 10) {
    throw new Error("Add the question bank before publishing.");
  }

  const issueSlug = draft.issuePage.issueSlug;
  await assertPublishConflictsClear(draft, issueSlug);

  const assessmentDefinition = buildAssessmentDefinitionFromDraft(draft);
  const assessmentSummary = buildAssessmentSummaryFromDefinition(assessmentDefinition);
  const issuePageContent = buildIssuePageContentFromDraft(
    draft,
    assessmentDefinition.slug
  );
  assertPublishableDraftContent(draft, assessmentDefinition, issuePageContent);

  const [publishedAssessment, publishedIssuePage] = await prisma.$transaction([
    prisma.publishedAssessment.upsert({
      where: {
        sourceDraftId: draft.id
      },
      update: {
        slug: assessmentDefinition.slug,
        title: assessmentDefinition.title,
        topicFamily: draft.topicFamily ?? null,
        assessmentSummary: assessmentSummary as unknown as Prisma.InputJsonValue,
        assessmentDefinition:
          assessmentDefinition as unknown as Prisma.InputJsonValue,
        publishVersion: draft.draftVersion,
        publishedByUserId,
        publishedAt: new Date()
      },
      create: {
        sourceDraftId: draft.id,
        slug: assessmentDefinition.slug,
        title: assessmentDefinition.title,
        topicFamily: draft.topicFamily ?? null,
        assessmentSummary: assessmentSummary as unknown as Prisma.InputJsonValue,
        assessmentDefinition:
          assessmentDefinition as unknown as Prisma.InputJsonValue,
        publishVersion: draft.draftVersion,
        publishedByUserId,
        publishedAt: new Date()
      }
    }),
    prisma.publishedIssuePage.upsert({
      where: {
        sourceDraftId: draft.id
      },
      update: {
        issueSlug: issuePageContent.slug,
        linkedAssessmentSlug: issuePageContent.linkedAssessmentSlug,
        pageTitle: issuePageContent.seoTitle,
        issuePageContent: issuePageContent as unknown as Prisma.InputJsonValue,
        publishVersion: draft.draftVersion,
        publishedByUserId,
        publishedAt: new Date()
      },
      create: {
        sourceDraftId: draft.id,
        issueSlug: issuePageContent.slug,
        linkedAssessmentSlug: issuePageContent.linkedAssessmentSlug,
        pageTitle: issuePageContent.seoTitle,
        issuePageContent: issuePageContent as unknown as Prisma.InputJsonValue,
        publishVersion: draft.draftVersion,
        publishedByUserId,
        publishedAt: new Date()
      }
    })
  ]);

  const updatedDraft = await updateAssessmentDraftMetadata(draft.id, {
    publishStatus: "PUBLISHED"
  });

  return {
    draft: updatedDraft,
    publishedAssessment,
    publishedIssuePage
  };
}

export async function getPublishedAssessmentBySlug(slug: string) {
  const record = await prisma.publishedAssessment.findUnique({
    where: {
      slug
    }
  });

  return parsePublishedAssessmentRecord(record);
}

export async function getPublishedAssessmentDefinitionBySlug(slug: string) {
  const assessment = await getPublishedAssessmentBySlug(slug);
  return assessment?.assessmentDefinition ?? null;
}

export async function getRuntimeAssessmentDefinitionBySlug(slug: string) {
  return (
    (await getPublishedAssessmentDefinitionBySlug(slug)) ??
    getAssessmentDefinitionBySlug(slug)
  );
}

export async function getPublishedAssessmentSummaryBySlug(slug: string) {
  const assessment = await getPublishedAssessmentBySlug(slug);
  return assessment?.assessmentSummary ?? null;
}

export async function getPublishedAssessmentsBySlugs(slugs: string[]) {
  const records = await prisma.publishedAssessment.findMany({
    where: {
      slug: {
        in: slugs
      }
    }
  });

  const bySlug = new Map(
    records
      .map((record) => parsePublishedAssessmentRecord(record))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => [item.assessmentSummary.slug, item.assessmentSummary] as const)
  );

  return slugs.map((slug) => bySlug.get(slug)).filter((item): item is Assessment => Boolean(item));
}

export async function getPublishedIssuePageBySlug(issueSlug: string) {
  const record = await prisma.publishedIssuePage.findUnique({
    where: {
      issueSlug
    }
  });

  return parsePublishedIssuePageRecord(record);
}
