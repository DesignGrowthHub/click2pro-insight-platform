import "server-only";

import OpenAI from "openai";

import { getOpenAIEnvironment } from "@/lib/config/env";
import type {
  AIReportProvider,
  AISectionGenerationInput
} from "@/lib/ai/reporting/provider";
import type { AIGeneratedNarrativeSection } from "@/lib/types/assessment-domain";

type OpenAIReportProviderSettings = {
  apiKey: string | null;
  model: string;
};

type OpenAISectionPayload = {
  synopsis?: unknown;
  main_mechanism?: unknown;
  real_world_expression?: unknown;
  interpretation?: unknown;
  watch_for?: unknown;
  action_focus?: unknown;
  paragraphs?: unknown;
  bullets?: unknown;
  callout?: unknown;
};

let cachedClient: OpenAI | null = null;

function getSettings(): OpenAIReportProviderSettings {
  const environment = getOpenAIEnvironment();

  return {
    apiKey: environment.apiKey,
    model: environment.model
  };
}

export function hasOpenAIReportProviderConfig() {
  return Boolean(getSettings().apiKey);
}

function getOpenAIClient(apiKey: string) {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeParagraphField(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return normalizeStringArray(value);
}

function parseSectionPayload(content: string | null | undefined): OpenAISectionPayload | null {
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as OpenAISectionPayload;
  } catch {
    return null;
  }
}

function buildValidationFallback(
  input: AISectionGenerationInput,
  reason: string
): AIGeneratedNarrativeSection {
  return {
    id: `${input.request.sectionId}-openai-fallback`,
    sectionId: input.request.sectionId,
    title: input.request.title,
    providerMode: "openai",
    status: "validation_fallback",
    synopsis:
      "This section is ready for personalized narrative interpretation, but the provider response was reduced to keep the saved report reliable and structurally valid.",
    paragraphs: [
      "The deterministic result profile remains intact. When the narrative layer does not return a safe structured section, the report falls back to a bounded placeholder instead of saving unstable output."
    ],
    bullets: [
      "Scoring remains the source of truth.",
      "Narrative output must pass structure and tone validation before it is saved.",
      "This section can be retried later without changing the underlying result profile."
    ],
    callout: "Narrative validation fallback applied.",
    promptBundle: input.promptBundle,
    validationNotes: [reason]
  };
}

function buildUserPrompt(input: AISectionGenerationInput) {
  return `${input.promptBundle.userPrompt}

Return strict JSON with this shape:
{
  "synopsis": "one sentence",
  "main_mechanism": "one grounded paragraph-length sentence or two",
  "real_world_expression": "one grounded paragraph-length sentence or two",
  "interpretation": ["paragraph one", "paragraph two"],
  "watch_for": ["bullet one", "bullet two"],
  "action_focus": "one short stabilizing or interpretive emphasis line",
  "callout": "optional short emphasis"
}

Do not include markdown fences or any text outside the JSON object.`;
}

export function createOpenAIReportProvider(): AIReportProvider {
  const settings = getSettings();

  if (!settings.apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return {
    mode: "openai",
    async generateSection(input) {
      const client = getOpenAIClient(settings.apiKey as string);
      const completion = await client.chat.completions.create({
        model: settings.model,
        temperature: 0.7,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: input.promptBundle.systemPrompt
          },
          {
            role: "user",
            content: buildUserPrompt(input)
          }
        ]
      });

      const content = completion.choices[0]?.message?.content;
      const parsed = parseSectionPayload(content);

      if (!parsed || typeof parsed.synopsis !== "string") {
        return buildValidationFallback(
          input,
          "OpenAI provider returned invalid JSON for the narrative section."
        );
      }

      const legacyParagraphs = normalizeStringArray(parsed.paragraphs);
      const interpretationParagraphs = normalizeParagraphField(parsed.interpretation);
      const structuredParagraphs = [
        typeof parsed.main_mechanism === "string" ? parsed.main_mechanism.trim() : "",
        typeof parsed.real_world_expression === "string"
          ? parsed.real_world_expression.trim()
          : "",
        ...interpretationParagraphs
      ].filter(Boolean);
      const paragraphs =
        structuredParagraphs.length > 0 ? structuredParagraphs : legacyParagraphs;

      if (paragraphs.length === 0) {
        return buildValidationFallback(
          input,
          "OpenAI provider returned an empty narrative paragraph array."
        );
      }

      const watchFor = normalizeStringArray(parsed.watch_for);
      const legacyBullets = normalizeStringArray(parsed.bullets);
      const actionFocus =
        typeof parsed.action_focus === "string" && parsed.action_focus.trim().length > 0
          ? parsed.action_focus.trim()
          : undefined;

      return {
        id: `${input.request.sectionId}-openai-generated`,
        sectionId: input.request.sectionId,
        title: input.request.title,
        providerMode: "openai",
        status: "generated",
        synopsis: parsed.synopsis.trim(),
        paragraphs,
        bullets: watchFor.length > 0 ? watchFor : legacyBullets,
        callout:
          typeof parsed.callout === "string" && parsed.callout.trim().length > 0
            ? parsed.callout.trim()
            : actionFocus,
        promptBundle: input.promptBundle,
        validationNotes: [
          `Generated with OpenAI model ${settings.model}.`,
          "Response parsed from strict JSON output before validation.",
          watchFor.length > 0
            ? "Structured watch_for bullets were parsed successfully."
            : "Legacy bullet parsing path used."
        ]
      };
    }
  };
}

export function createOpenAIReportProviderPlaceholder() {
  return createOpenAIReportProvider();
}
