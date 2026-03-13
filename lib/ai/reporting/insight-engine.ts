import { buildAIInsightPayload } from "@/lib/ai/payloads/build-ai-insight-payload";
import {
  buildNarrativeLookup,
  generateAIInsightSectionsSync,
  generateAIInsightSectionsWithProvider
} from "@/lib/ai/reporting/section-generator";
import type { AIReportProvider } from "@/lib/ai/reporting/provider";
import type {
  AssessmentDefinition,
  AssessmentResultProfile
} from "@/lib/types/assessment-domain";

export function runAIInsightEngineSync(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile
) {
  const payload =
    resultProfile.aiPayload && resultProfile.aiPayload.assessmentSlug
      ? resultProfile.aiPayload
      : buildAIInsightPayload(assessment, resultProfile);
  const sections = generateAIInsightSectionsSync(assessment, resultProfile, payload);

  return {
    payload,
    sections,
    lookup: buildNarrativeLookup(sections)
  };
}

export async function runAIInsightEngineWithProvider(
  provider: AIReportProvider,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile
) {
  const payload =
    resultProfile.aiPayload && resultProfile.aiPayload.assessmentSlug
      ? resultProfile.aiPayload
      : buildAIInsightPayload(assessment, resultProfile);
  const sections = await generateAIInsightSectionsWithProvider(provider, payload);

  return {
    payload,
    sections,
    lookup: buildNarrativeLookup(sections)
  };
}

