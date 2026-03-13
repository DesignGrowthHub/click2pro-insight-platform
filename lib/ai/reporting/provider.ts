import type {
  AIGeneratedNarrativeSection,
  AIProviderMode,
  AIReportInputPayload,
  AIReportNarrativeRequest,
  AIReportPromptBundle
} from "@/lib/types/assessment-domain";

export type AISectionGenerationInput = {
  payload: AIReportInputPayload;
  request: AIReportNarrativeRequest;
  promptBundle: AIReportPromptBundle;
  previousSections: AIGeneratedNarrativeSection[];
};

export type AIReportProvider = {
  mode: AIProviderMode;
  generateSection(
    input: AISectionGenerationInput
  ): Promise<AIGeneratedNarrativeSection>;
};
