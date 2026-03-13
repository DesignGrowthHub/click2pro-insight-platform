import { composePremiumReport } from "@/lib/reports/report-composer";
import {
  scoreAssessment,
  type AssessmentResponseMap
} from "@/lib/scoring/assessment-scoring";
import type { AssessmentDefinition } from "@/lib/types/assessment-domain";

export function generateAssessmentOutcome(
  assessment: AssessmentDefinition,
  responses: AssessmentResponseMap
) {
  const resultProfile = scoreAssessment(assessment, responses);
  const premiumReport = composePremiumReport(assessment, resultProfile);

  return {
    resultProfile,
    premiumReport
  };
}
