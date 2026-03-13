import "server-only";

import OpenAI from "openai";

import { getOpenAIEnvironment } from "@/lib/config/env";
import {
  createAssessmentDraftGenerationJob,
  getAssessmentDraftById,
  replaceAssessmentDraftDimensions,
  replaceAssessmentDraftQuestions,
  updateAssessmentDraftGenerationJob,
  updateAssessmentDraftMetadata,
  upsertAssessmentDraftIssuePage,
  upsertAssessmentDraftPreviewBlueprint,
  upsertAssessmentDraftReportBlueprint
} from "@/lib/server/services/assessment-drafts";

type DraftGenerationSection =
  | "all"
  | "dimensions"
  | "questions"
  | "issuePage"
  | "previewBlueprint"
  | "reportBlueprint";

type DraftRecord = NonNullable<Awaited<ReturnType<typeof getAssessmentDraftById>>>;

type DimensionSeed = {
  key: string;
  label: string;
  description: string | null;
  scoringNotes: string | null;
  interpretationNotes: string | null;
};

type QuestionSeed = {
  dimensionKey: string;
  questionType: string;
  prompt: string;
  optionSchema: unknown;
  scoringMapping: unknown;
  reverseScored?: boolean;
  notes?: string | null;
};

type IssuePageSeed = {
  issueSlug: string;
  pageTitle: string;
  headline: string;
  subheadline?: string | null;
  introCopy?: string | null;
  ctaCopy?: string;
  emotionalHook?: string | null;
  faqItems?: string[];
  trustCopy?: string[];
};

type PreviewBlueprintSeed = {
  previewTitle?: string | null;
  summaryFraming?: string | null;
  strongestSignalLabels?: string[];
  graphFraming?: string | null;
  whyThisMatters?: string | null;
  whatOpensInFullReport?: string | null;
  pricingFraming?: string | null;
  urgencyNotes?: string | null;
};

type ReportBlueprintSeed = {
  executiveSummaryFraming?: string | null;
  sectionOrder?: string[];
  sectionIntents?: Record<string, string> | null;
  sectionRoleBoundaries?: Record<string, string | string[]> | null;
  reflectionActionFraming?: string | null;
  relatedInsightsLogic?: string | null;
};

type GeneratedDraftPayload = {
  issuePage?: IssuePageSeed;
  dimensions?: DimensionSeed[];
  questions?: QuestionSeed[];
  previewBlueprint?: PreviewBlueprintSeed;
  reportBlueprint?: ReportBlueprintSeed;
};

type GenerateAssessmentDraftWithAIInput = {
  draftId: string;
  requestedByUserId: string;
  section: DraftGenerationSection;
};

type OpenAIDraftSectionResponse = {
  issuePage?: IssuePageSeed;
  dimensions?: DimensionSeed[];
  questions?: QuestionSeed[];
  previewBlueprint?: PreviewBlueprintSeed;
  reportBlueprint?: ReportBlueprintSeed;
};

const supportedQuestionTypes = [
  "likert_scale",
  "multiple_choice",
  "situational_choice",
  "binary_choice",
  "forced_choice"
] as const;

let cachedClient: OpenAI | null = null;

function getOpenAIClient() {
  const env = getOpenAIEnvironment();

  if (!env.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is required to generate assessment drafts with AI."
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: env.apiKey });
  }

  return {
    client: cachedClient,
    model: env.model
  };
}

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function clampRequestedQuestionCount(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return 42;
  }

  return Math.min(Math.max(value, 35), 60);
}

function parseRequestedDimensions(value: unknown) {
  return normalizeStringArray(value);
}

function buildDraftContext(draft: DraftRecord, dimensionSeeds?: DimensionSeed[]) {
  const requestedDimensions = parseRequestedDimensions(draft.requestedDimensions);
  const effectiveDimensions =
    dimensionSeeds && dimensionSeeds.length > 0
      ? dimensionSeeds.map((dimension) => `${dimension.key}: ${dimension.label}`)
      : draft.dimensions.map((dimension) => `${dimension.key}: ${dimension.label}`);

  return [
    `Title: ${draft.title}`,
    `Slug: ${draft.slug}`,
    `Topic family: ${draft.topicFamily ?? "Not specified"}`,
    `Target audience: ${draft.targetAudience ?? "Not specified"}`,
    `Emotional goal: ${draft.emotionalGoal ?? "Not specified"}`,
    `Desired tone: ${draft.desiredTone ?? "calm, analytical, premium"}`,
    `Requested question count: ${clampRequestedQuestionCount(draft.requestedQuestionCount)}`,
    `Requested dimensions: ${
      requestedDimensions.length > 0 ? requestedDimensions.join(", ") : "Not specified"
    }`,
    `Preview emphasis notes: ${draft.previewEmphasisNotes ?? "Not specified"}`,
    `Report emphasis notes: ${draft.reportEmphasisNotes ?? "Not specified"}`,
    `Source prompt: ${draft.sourcePrompt ?? "Not specified"}`,
    `Generation prompt: ${draft.generationPrompt ?? "Not specified"}`,
    `Admin notes: ${draft.notes ?? "Not specified"}`,
    `Existing dimensions: ${
      effectiveDimensions.length > 0 ? effectiveDimensions.join(" | ") : "None yet"
    }`
  ].join("\n");
}

function buildSystemPrompt() {
  return [
    "You create premium assessment draft content for a paid behavioral insight product.",
    "Write with emotional precision, strong self-reflection value, and non-clinical seriousness.",
    "Avoid generic quiz language, fluff, diagnosis, treatment language, or legal advice.",
    "For relationship breakup/divorce/limerence/abuse-adjacent topics, stay focused on pattern clarification and self-reflection rather than instruction or legal guidance.",
    "Return strict JSON only.",
    "Make the output strong enough for a human editor to refine into a paid assessment product."
  ].join("\n");
}

function buildSectionPrompt(
  draft: DraftRecord,
  section: Exclude<DraftGenerationSection, "all">,
  dimensionSeeds?: DimensionSeed[]
) {
  const context = buildDraftContext(draft, dimensionSeeds);
  const requestedQuestionCount = clampRequestedQuestionCount(draft.requestedQuestionCount);
  const dimensionList =
    dimensionSeeds && dimensionSeeds.length > 0
      ? dimensionSeeds
      : draft.dimensions.map((dimension) => ({
          key: dimension.key,
          label: dimension.label,
          description: dimension.description ?? "",
          scoringNotes: dimension.scoringNotes ?? "",
          interpretationNotes: dimension.interpretationNotes ?? ""
        }));

  switch (section) {
    case "issuePage":
      return `${context}

Generate an issue-page draft for blog/search traffic.

Return JSON:
{
  "issuePage": {
    "issueSlug": "kebab-case issue slug",
    "pageTitle": "SEO-friendly issue page title",
    "headline": "clear emotional headline",
    "subheadline": "short premium subheadline",
    "introCopy": "2-4 sentence intro",
    "ctaCopy": "Start Assessment",
    "emotionalHook": "1-2 sentence emotional hook",
    "faqItems": ["question and short answer in one line", "..."],
    "trustCopy": ["short trust line", "..."]
  }
}

Quality rules:
- Make the page feel search-intent aligned, emotionally real, and premium.
- Keep FAQ items concise and useful.
- Do not sound clinical or generic.`;

    case "dimensions":
      return `${context}

Generate 5 to 8 assessment dimensions.

Return JSON:
{
  "dimensions": [
    {
      "key": "snake_case_key",
      "label": "Dimension label",
      "description": "what this dimension captures",
      "scoringNotes": "how higher/lower scores should generally be interpreted",
      "interpretationNotes": "what this dimension helps clarify in reports"
    }
  ]
}

Quality rules:
- Dimensions must feel specific to the draft topic, not generic personality traits.
- Keys must be clean snake_case and usable for question mapping.
- Labels should feel premium and readable.`;

    case "questions":
      return `${context}

Use these dimensions:
${dimensionList
  .map(
    (dimension, index) =>
      `${index + 1}. ${dimension.key} — ${dimension.label}: ${dimension.description}`
  )
  .join("\n")}

Generate exactly ${requestedQuestionCount} questions grouped across those dimensions.

Supported question types:
- likert_scale
- multiple_choice
- situational_choice
- binary_choice
- forced_choice

Return JSON:
{
  "questions": [
    {
      "dimensionKey": "one of the provided dimension keys",
      "questionType": "likert_scale",
      "prompt": "question text",
      "optionSchema": {
        "options": [
          { "label": "Strongly disagree", "value": "strongly_disagree" },
          { "label": "Disagree", "value": "disagree" },
          { "label": "Neutral", "value": "neutral" },
          { "label": "Agree", "value": "agree" },
          { "label": "Strongly agree", "value": "strongly_agree" }
        ]
      },
      "scoringMapping": {
        "strongly_disagree": { "dimension_key": 0 },
        "disagree": { "dimension_key": 1 },
        "neutral": { "dimension_key": 2 },
        "agree": { "dimension_key": 3 },
        "strongly_agree": { "dimension_key": 4 }
      },
      "reverseScored": false,
      "notes": "why this question matters"
    }
  ]
}

Quality rules:
- Questions must feel psychologically sharp, topic-specific, and emotionally believable.
- Vary wording and situation type so the set does not feel repetitive.
- Use reverse scoring only where it genuinely improves signal quality.
- Make answer choice schemas and scoring mappings practical draft suggestions, not placeholders.
- Do not output filler or obvious quiz junk.`;

    case "previewBlueprint":
      return `${context}

Generate the locked-preview blueprint for the paid insight flow.

Return JSON:
{
  "previewBlueprint": {
    "previewTitle": "headline interpretation",
    "summaryFraming": "short opening read",
    "strongestSignalLabels": ["signal one", "signal two", "signal three"],
    "graphFraming": "how the graph should be framed",
    "whyThisMatters": "short consequence framing",
    "whatOpensInFullReport": "what unlock gives the user",
    "pricingFraming": "single-report premium framing",
    "urgencyNotes": "measured conversion note"
  }
}

Quality rules:
- Make the preview feel personal, premium, and conversion-worthy without overexposing the full report.
- Keep the language concise and emotionally precise.`;

    case "reportBlueprint":
      return `${context}

Generate the deeper report blueprint for a paid behavioral insight product.

Return JSON:
{
  "reportBlueprint": {
    "executiveSummaryFraming": "how the executive summary should work",
    "sectionOrder": ["core_pattern", "pressure_points", "performance_tendencies", "hidden_friction", "stabilizing_signals"],
    "sectionIntents": {
      "core_pattern": "section job",
      "pressure_points": "section job"
    },
    "sectionRoleBoundaries": {
      "core_pattern": ["do not repeat ...", "focus on ..."],
      "pressure_points": ["do not drift into ..."]
    },
    "reflectionActionFraming": "how reflection/action prompts should feel",
    "relatedInsightsLogic": "how adjacent insights should be suggested"
  }
}

Quality rules:
- Build 4 to 6 clear sections with distinct roles.
- Make section intents and role boundaries genuinely useful for later generation.
- Keep the blueprint premium, structured, and non-clinical.`;
  }
}

async function generateSectionFromOpenAI(
  draft: DraftRecord,
  section: Exclude<DraftGenerationSection, "all">,
  dimensionSeeds?: DimensionSeed[]
) {
  const { client, model } = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: {
      type: "json_object"
    },
    messages: [
      {
        role: "system",
        content: buildSystemPrompt()
      },
      {
        role: "user",
        content: buildSectionPrompt(draft, section, dimensionSeeds)
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error(`OpenAI returned an empty response while generating ${section}.`);
  }

  try {
    return JSON.parse(content) as OpenAIDraftSectionResponse;
  } catch {
    throw new Error(`OpenAI returned invalid JSON while generating ${section}.`);
  }
}

function normalizeDimensions(response: OpenAIDraftSectionResponse) {
  const items = Array.isArray(response.dimensions) ? response.dimensions : [];

  const normalized = items
    .map((dimension, index) => ({
      key: sanitizeSlug(cleanText(dimension.key)).replace(/-/g, "_"),
      label: cleanText(dimension.label),
      description: cleanOptionalText(dimension.description),
      order: index + 1,
      scoringNotes: cleanOptionalText(dimension.scoringNotes),
      interpretationNotes: cleanOptionalText(dimension.interpretationNotes)
    }))
    .filter((dimension) => dimension.key && dimension.label);

  if (normalized.length < 3) {
    throw new Error("AI generation returned too few valid dimensions.");
  }

  return normalized.slice(0, 8);
}

function normalizeQuestions(
  response: OpenAIDraftSectionResponse,
  dimensionKeys: string[]
) {
  const items = Array.isArray(response.questions) ? response.questions : [];

  const normalized = items
    .map((question, index) => {
      const rawType = cleanText(question.questionType);
      const normalizedType = supportedQuestionTypes.includes(
        rawType as (typeof supportedQuestionTypes)[number]
      )
        ? rawType
        : "likert_scale";
      const dimensionKey = cleanText(question.dimensionKey);

      return {
        dimensionKey: dimensionKeys.includes(dimensionKey) ? dimensionKey : dimensionKeys[0] ?? null,
        questionType: normalizedType,
        prompt: cleanText(question.prompt),
        optionSchema:
          question.optionSchema && typeof question.optionSchema === "object"
            ? question.optionSchema
            : null,
        scoringMapping:
          question.scoringMapping && typeof question.scoringMapping === "object"
            ? question.scoringMapping
            : null,
        reverseScored: Boolean(question.reverseScored),
        order: index + 1,
        status: "DRAFT" as const,
        notes: cleanOptionalText(question.notes)
      };
    })
    .filter((question) => question.prompt);

  if (normalized.length < 10) {
    throw new Error("AI generation returned too few valid questions.");
  }

  return normalized;
}

function normalizeIssuePage(
  response: OpenAIDraftSectionResponse,
  draft: DraftRecord
) {
  const issuePage = response.issuePage;

  if (!issuePage) {
    throw new Error("AI generation did not return issue page content.");
  }

  const issueSlug = sanitizeSlug(issuePage.issueSlug || draft.slug || draft.title);
  const pageTitle = cleanText(issuePage.pageTitle) || draft.title;
  const headline = cleanText(issuePage.headline) || draft.title;

  if (!issueSlug || !pageTitle || !headline) {
    throw new Error("AI generation returned invalid issue-page metadata.");
  }

  return {
    issueSlug,
    pageTitle,
    headline,
    subheadline: cleanOptionalText(issuePage.subheadline),
    introCopy: cleanOptionalText(issuePage.introCopy),
    ctaCopy: cleanOptionalText(issuePage.ctaCopy) ?? "Start Assessment",
    emotionalHook: cleanOptionalText(issuePage.emotionalHook),
    faqItems: normalizeStringArray(issuePage.faqItems),
    trustCopy: normalizeStringArray(issuePage.trustCopy)
  };
}

function normalizePreviewBlueprint(response: OpenAIDraftSectionResponse) {
  const preview = response.previewBlueprint;

  if (!preview) {
    throw new Error("AI generation did not return preview blueprint content.");
  }

  return {
    previewTitle: cleanOptionalText(preview.previewTitle),
    summaryFraming: cleanOptionalText(preview.summaryFraming),
    strongestSignalLabels: normalizeStringArray(preview.strongestSignalLabels),
    graphFraming: cleanOptionalText(preview.graphFraming),
    whyThisMatters: cleanOptionalText(preview.whyThisMatters),
    whatOpensInFullReport: cleanOptionalText(preview.whatOpensInFullReport),
    pricingFraming: cleanOptionalText(preview.pricingFraming),
    urgencyNotes: cleanOptionalText(preview.urgencyNotes)
  };
}

function normalizeReportBlueprint(response: OpenAIDraftSectionResponse) {
  const blueprint = response.reportBlueprint;

  if (!blueprint) {
    throw new Error("AI generation did not return report blueprint content.");
  }

  return {
    executiveSummaryFraming: cleanOptionalText(blueprint.executiveSummaryFraming),
    sectionOrder: normalizeStringArray(blueprint.sectionOrder),
    sectionIntents:
      blueprint.sectionIntents && typeof blueprint.sectionIntents === "object"
        ? blueprint.sectionIntents
        : null,
    sectionRoleBoundaries:
      blueprint.sectionRoleBoundaries &&
      typeof blueprint.sectionRoleBoundaries === "object"
        ? blueprint.sectionRoleBoundaries
        : null,
    reflectionActionFraming: cleanOptionalText(blueprint.reflectionActionFraming),
    relatedInsightsLogic: cleanOptionalText(blueprint.relatedInsightsLogic)
  };
}

async function generateAndSaveSection(
  draft: DraftRecord,
  section: Exclude<DraftGenerationSection, "all">,
  dimensionSeeds?: DimensionSeed[]
) {
  const response = await generateSectionFromOpenAI(draft, section, dimensionSeeds);

  switch (section) {
    case "dimensions": {
      const dimensions = normalizeDimensions(response);
      await replaceAssessmentDraftDimensions(draft.id, dimensions);
      return { dimensions };
    }
    case "questions": {
      const effectiveDimensions =
        dimensionSeeds && dimensionSeeds.length > 0
          ? dimensionSeeds
          : draft.dimensions.map((dimension) => ({
              key: dimension.key,
              label: dimension.label,
              description: dimension.description ?? "",
              scoringNotes: dimension.scoringNotes ?? "",
              interpretationNotes: dimension.interpretationNotes ?? ""
            }));

      if (effectiveDimensions.length === 0) {
        throw new Error(
          "Generate or add dimensions before generating questions for this draft."
        );
      }

      const questions = normalizeQuestions(
        response,
        effectiveDimensions.map((dimension) => dimension.key)
      );
      await replaceAssessmentDraftQuestions(draft.id, questions);
      return { questions };
    }
    case "issuePage": {
      const issuePage = normalizeIssuePage(response, draft);
      await upsertAssessmentDraftIssuePage(draft.id, issuePage);
      return { issuePage };
    }
    case "previewBlueprint": {
      const previewBlueprint = normalizePreviewBlueprint(response);
      await upsertAssessmentDraftPreviewBlueprint(draft.id, previewBlueprint);
      return { previewBlueprint };
    }
    case "reportBlueprint": {
      const reportBlueprint = normalizeReportBlueprint(response);
      await upsertAssessmentDraftReportBlueprint(draft.id, reportBlueprint);
      return { reportBlueprint };
    }
  }
}

export async function generateAssessmentDraftWithAI({
  draftId,
  requestedByUserId,
  section
}: GenerateAssessmentDraftWithAIInput) {
  const draft = await getAssessmentDraftById(draftId);

  if (!draft) {
    throw new Error("Assessment draft not found.");
  }

  await updateAssessmentDraftMetadata(draftId, {
    generationStatus: "GENERATING"
  });

  const job = await createAssessmentDraftGenerationJob({
    draftId,
    requestedByUserId,
    status: "RUNNING",
    model: getOpenAIEnvironment().model,
    promptSnapshot: JSON.stringify({
      section,
      title: draft.title,
      slug: draft.slug,
      targetAudience: draft.targetAudience,
      emotionalGoal: draft.emotionalGoal,
      requestedQuestionCount: draft.requestedQuestionCount,
      requestedDimensions: draft.requestedDimensions
    }),
    metadata: {
      section
    },
    startedAt: new Date()
  });

  try {
    const generated: GeneratedDraftPayload = {};

    if (section === "all") {
      const { dimensions } = await generateAndSaveSection(draft, "dimensions");
      if (dimensions) {
        generated.dimensions = dimensions;
      }

      const refreshedDraft = (await getAssessmentDraftById(draftId)) ?? draft;

      const { questions } = await generateAndSaveSection(
        refreshedDraft,
        "questions",
        generated.dimensions
      );
      if (questions) {
        generated.questions = questions;
      }

      const { issuePage } = await generateAndSaveSection(refreshedDraft, "issuePage");
      if (issuePage) {
        generated.issuePage = issuePage;
      }

      const { previewBlueprint } = await generateAndSaveSection(
        refreshedDraft,
        "previewBlueprint",
        generated.dimensions
      );
      if (previewBlueprint) {
        generated.previewBlueprint = previewBlueprint;
      }

      const { reportBlueprint } = await generateAndSaveSection(
        refreshedDraft,
        "reportBlueprint",
        generated.dimensions
      );
      if (reportBlueprint) {
        generated.reportBlueprint = reportBlueprint;
      }
    } else {
      Object.assign(
        generated,
        await generateAndSaveSection(draft, section)
      );
    }

    await updateAssessmentDraftMetadata(draftId, {
      generationStatus: "GENERATED"
    });

    await updateAssessmentDraftGenerationJob(job.id, {
      status: "SUCCEEDED",
      completedAt: new Date(),
      metadata: {
        section,
        generatedSections:
          section === "all" ? Object.keys(generated) : [section]
      }
    });

    const updatedDraft = await getAssessmentDraftById(draftId);

    if (!updatedDraft) {
      throw new Error("The generated draft could not be reloaded.");
    }

    return updatedDraft;
  } catch (error) {
    await updateAssessmentDraftMetadata(draftId, {
      generationStatus: "FAILED"
    });

    await updateAssessmentDraftGenerationJob(job.id, {
      status: "FAILED",
      completedAt: new Date(),
      errorMessage:
        error instanceof Error
          ? error.message
          : "The AI draft generation request failed."
    });

    throw error;
  }
}

export type { DraftGenerationSection };
