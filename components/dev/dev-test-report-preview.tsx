"use client";

import { useRouter } from "next/navigation";

import type { Assessment as AssessmentSummary } from "@/lib/assessments";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

import { ResultPreviewShell } from "@/components/results/result-preview-shell";

type DevTestReportPreviewProps = {
  assessment: AssessmentDefinition;
  assessmentSessionId: string;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport;
  relatedAssessments: AssessmentSummary[];
};

export function DevTestReportPreview({
  assessment,
  assessmentSessionId,
  resultProfile,
  premiumReport,
  relatedAssessments
}: DevTestReportPreviewProps) {
  const router = useRouter();

  return (
    <ResultPreviewShell
      assessment={assessment}
      assessmentSessionId={assessmentSessionId}
      resultProfile={resultProfile}
      premiumReport={premiumReport}
      relatedAssessments={relatedAssessments}
      onReviewAnswers={() => {
        router.push(`/assessments/${assessment.slug}/take`);
      }}
    />
  );
}
