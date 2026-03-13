import { buildReportSectionPromptBundle } from "@/lib/ai/prompts/report-section-prompts";
import { generateMockNarrativeSectionSync } from "@/lib/ai/reporting/mock-provider";
import type {
  AIReportProvider,
  AISectionGenerationInput
} from "@/lib/ai/reporting/provider";
import { sanitizeNarrativeSection } from "@/lib/ai/reporting/validation";
import type {
  AIGeneratedNarrativeSection,
  AIReportInputPayload,
  AssessmentDefinition,
  AssessmentResultProfile
} from "@/lib/types/assessment-domain";

function buildGenerationInput(
  payload: AIReportInputPayload,
  request: AIReportInputPayload["narrativeSectionsToGenerate"][number],
  previousSections: AIGeneratedNarrativeSection[]
): AISectionGenerationInput {
  const previousSectionSummaries = previousSections.map((section) => section.synopsis);

  return {
    payload,
    request,
    promptBundle: buildReportSectionPromptBundle(
      payload,
      request,
      previousSectionSummaries
    ),
    previousSections
  };
}

function buildRetryPromptBundle(input: AISectionGenerationInput) {
  const retryNote = [
    "",
    "Retry instruction:",
    "- The previous draft was too generic, too repetitive, or not grounded enough.",
    "- Name the strongest scored signals directly.",
    "- Make this section distinct from earlier sections.",
    "- Avoid reusing phrasing from previous chapter summaries."
  ].join("\n");

  return {
    ...input.promptBundle,
    userPrompt: `${input.promptBundle.userPrompt}\n${retryNote}`
  };
}

export function generateAIInsightSectionsSync(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  payload: AIReportInputPayload = resultProfile.aiPayload
) {
  void assessment;

  const sections: AIGeneratedNarrativeSection[] = [];

  for (const request of payload.narrativeSectionsToGenerate) {
    const input = buildGenerationInput(payload, request, sections);
    const generated = generateMockNarrativeSectionSync(input);
    sections.push(sanitizeNarrativeSection(generated, sections));
  }

  return sections;
}

export async function generateAIInsightSectionsWithProvider(
  provider: AIReportProvider,
  payload: AIReportInputPayload
) {
  const sections: AIGeneratedNarrativeSection[] = [];

  for (const request of payload.narrativeSectionsToGenerate) {
    const input = buildGenerationInput(payload, request, sections);
    // Future OpenAI integration belongs inside provider.generateSection so the
    // rest of the app can stay focused on prompt construction, validation, and
    // report assembly rather than transport details.
    const generated = await provider.generateSection(input);
    const sanitized = sanitizeNarrativeSection(generated, sections);

    if (sanitized.status === "validation_fallback" && provider.mode === "openai") {
      const retried = await provider.generateSection({
        ...input,
        promptBundle: buildRetryPromptBundle(input)
      });
      sections.push(sanitizeNarrativeSection(retried, sections));
      continue;
    }

    sections.push(sanitized);
  }

  return sections;
}

export function buildNarrativeLookup(
  sections: AIGeneratedNarrativeSection[]
): Record<string, AIGeneratedNarrativeSection> {
  return Object.fromEntries(sections.map((section) => [section.sectionId, section]));
}
