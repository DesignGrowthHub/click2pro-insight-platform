"use client";

import { startTransition, useEffect, useState } from "react";

import { AssessmentIntroPanel } from "@/components/assessment-flow/assessment-intro-panel";
import { QuestionCard } from "@/components/assessment-flow/question-card";
import { AnalyzingTransition } from "@/components/results/analyzing-transition";
import { ResultPreviewShell } from "@/components/results/result-preview-shell";
import { ReportBlueprintPreview } from "@/components/reports/report-blueprint-preview";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAssessmentProgressMessage,
  getTransitionSummary,
  type AssessmentFlowStage
} from "@/lib/assessment-engine/flow";
import { saveAssessmentSession } from "@/lib/reports/report-session";
import type { AssessmentResponseMap } from "@/lib/scoring/assessment-scoring";
import type { Assessment as AssessmentSummary } from "@/lib/assessments";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type AssessmentFlowShellProps = {
  assessment: AssessmentDefinition;
  relatedAssessments: AssessmentSummary[];
  devPreviewState?: PersistedCompletionPreview | null;
  serverCanAccessFullReport?: boolean;
};

type PersistedCompletionPreview = {
  sessionId: string | null;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport;
};

export function AssessmentFlowShell({
  assessment,
  relatedAssessments,
  devPreviewState = null,
  serverCanAccessFullReport = false
}: AssessmentFlowShellProps) {
  const [responses, setResponses] = useState<AssessmentResponseMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stage, setStage] = useState<AssessmentFlowStage>(
    devPreviewState ? "preview" : "intro"
  );
  const [persistedPreview, setPersistedPreview] =
    useState<PersistedCompletionPreview | null>(devPreviewState);
  const [transitionReady, setTransitionReady] = useState(false);

  useEffect(() => {
    if (stage !== "preview" || Object.keys(responses).length !== assessment.questions.length) {
      return;
    }

    saveAssessmentSession(assessment.slug, responses);
  }, [assessment.questions.length, assessment.slug, responses, stage]);

  useEffect(() => {
    if (stage !== "transition") {
      return;
    }

    let cancelled = false;

    async function persistCompletion() {
      try {
        const response = await fetch(`/api/assessments/${assessment.slug}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answers: responses
          })
        });

        if (!response.ok) {
          throw new Error("Unable to save the completed assessment session.");
        }

        const payload = (await response.json()) as {
          sessionId: string;
          resultProfile: AssessmentResultProfile;
          premiumReport: PremiumReport;
        };

        if (cancelled) {
          return;
        }

        setPersistedPreview({
          sessionId: payload.sessionId,
          resultProfile: payload.resultProfile,
          premiumReport: payload.premiumReport
        });
      } catch {
        if (cancelled) {
          return;
        }

        const { generateAssessmentOutcome } = await import(
          "@/lib/results/assessment-outcome"
        );
        const fallbackOutcome = generateAssessmentOutcome(assessment, responses);

        setPersistedPreview({
          sessionId: null,
          resultProfile: fallbackOutcome.resultProfile,
          premiumReport: fallbackOutcome.premiumReport
        });
      }
    }

    void persistCompletion();

    return () => {
      cancelled = true;
    };
  }, [assessment, responses, stage]);

  useEffect(() => {
    if (stage !== "transition" || !transitionReady || !persistedPreview) {
      return;
    }

    startTransition(() => {
      setStage("preview");
    });
  }, [persistedPreview, stage, transitionReady]);

  if (assessment.buildStatus !== "deep_seeded" || assessment.questions.length === 0) {
    return (
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="raised">
          <CardHeader className="space-y-5">
            <Badge variant="accent">Architecture ready</Badge>
            <CardTitle className="text-[1.8rem]">
              This assessment already has its scoring and report structure, but the full question bank has not been seeded yet.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="body-md">
              The platform can already store topic metadata, dimensions, report
              blueprint structure, related-assessment logic, and future deeper
              reporting inputs for this product.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-block px-4 py-4">
                <p className="insight-label">Planned question count</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.questionCount} questions
                </p>
              </div>
              <div className="surface-block px-4 py-4">
                <p className="insight-label">Estimated time</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {assessment.estimatedTimeLabel}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <LinkButton href={`/assessments/${assessment.slug}`} variant="outline" size="lg">
                Return To Assessment Intro
              </LinkButton>
              <LinkButton href={`/reports/${assessment.slug}`} size="lg">
                Open Report Blueprint
              </LinkButton>
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <Badge variant="outline">Report blueprint</Badge>
            <CardTitle className="text-[1.45rem]">
              Preview and premium section plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportBlueprintPreview blueprint={assessment.reportBlueprint} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round(
    (answeredCount / Math.max(assessment.questions.length, 1)) * 100
  );
  const progressMessage = getAssessmentProgressMessage(
    answeredCount,
    assessment.questions.length
  );
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const currentSection = currentQuestion
    ? assessment.sections.find((section) => section.id === currentQuestion.sectionId)
    : null;
  const selectedOptionId = currentQuestion ? responses[currentQuestion.id] : undefined;
  const transitionSummary = getTransitionSummary(assessment);
  const resultProfile = persistedPreview?.resultProfile ?? null;
  const premiumReport = persistedPreview?.premiumReport ?? null;

  const sectionAnsweredCount = currentSection
    ? currentSection.questionIds.filter((questionId) => responses[questionId]).length
    : 0;
  const currentSectionIndex = currentSection
    ? assessment.sections.findIndex((section) => section.id === currentSection.id)
    : -1;
  const currentSectionQuestionCount = currentSection?.questionIds.length ?? 0;
  const currentSectionProgressPercent = currentSectionQuestionCount
    ? Math.round((sectionAnsweredCount / currentSectionQuestionCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {stage === "intro" ? (
        <div className="reveal-soft">
          <AssessmentIntroPanel
            assessment={assessment}
            action={
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="xl"
                  onClick={() => setStage("questions")}
                  className="w-full sm:w-auto"
                >
                  Begin Insight Assessment
                </Button>
                <LinkButton href={`/assessments/${assessment.slug}`} variant="ghost" size="lg">
                  Back to overview
                </LinkButton>
              </div>
            }
          />
        </div>
      ) : null}

      {stage === "questions" && currentQuestion ? (
        <div className="assessment-session-stack preview-reveal">
          <Card variant="raised" className="assessment-mode-shell overflow-hidden">
            <CardContent className="space-y-5 p-4 sm:p-5 lg:p-6">
              <div className="assessment-progress-shell px-4 py-4 sm:px-5 sm:py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">
                        Question {currentQuestionIndex + 1} of {assessment.questions.length}
                      </Badge>
                      {currentSectionIndex >= 0 ? (
                        <Badge variant="outline">
                          {currentSection?.title ?? "Focused reflection"}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-muted">
                      {currentSectionIndex >= 0
                        ? `Section ${currentSectionIndex + 1} of ${assessment.sections.length} · ${sectionAnsweredCount} of ${currentSectionQuestionCount} answered`
                        : progressMessage}
                    </p>
                  </div>
                  <div className="space-y-1 text-left sm:text-right">
                    <p className="insight-label">Progress</p>
                    <p className="text-sm font-medium text-foreground/90">
                      {progressPercent}% complete
                    </p>
                  </div>
                </div>

                <div className="mt-3 assessment-progress-track">
                  <div
                    className="assessment-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm leading-6 text-muted">
                  <p className="min-w-0 flex-1">
                    {currentSection?.intent ??
                      "Move with your first honest reaction. The pattern becomes clearer one answer at a time."}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <p className="text-foreground/72">
                      Usually {assessment.estimatedTimeLabel}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                      onClick={() => setStage("intro")}
                    >
                      Return to intro
                    </button>
                  </div>
                </div>
              </div>

              <div className="assessment-question-context">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Current reflection</Badge>
                    <Badge variant="outline">{assessment.category}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    No right answers. Just the closest fit.
                  </p>
                </div>
                {currentSection ? (
                  <p className="mt-2 reading-column-tight text-sm leading-6 text-muted">
                    {currentSection.description}
                  </p>
                ) : null}
              </div>

              <div key={currentQuestion.id} className="assessment-stage-reveal">
                <QuestionCard
                  question={currentQuestion}
                  selectedOptionId={selectedOptionId}
                  onSelect={(optionId) =>
                    setResponses((current) => ({
                      ...current,
                      [currentQuestion.id]: optionId
                    }))
                  }
                />
              </div>

              <div className="assessment-nav-shell border-t border-white/8 pt-4">
                <div className="flex flex-col gap-3">
                  <p className="text-sm leading-6 text-muted">
                    {selectedOptionId
                      ? "Response saved. Continue whenever you are ready."
                      : "Choose the response that feels closest to continue."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
                      }
                      disabled={currentQuestionIndex === 0}
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        if (!selectedOptionId) {
                          return;
                        }

                        if (currentQuestionIndex === assessment.questions.length - 1) {
                          setPersistedPreview(null);
                          setTransitionReady(false);
                          setStage("transition");
                          return;
                        }

                        setCurrentQuestionIndex((current) => current + 1);
                      }}
                      disabled={!selectedOptionId}
                    >
                      {currentQuestionIndex === assessment.questions.length - 1
                        ? "Continue To Preview"
                        : "Next Question"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {stage === "transition" ? (
        <div className="assessment-session-stack preview-reveal">
          <AnalyzingTransition
            {...transitionSummary}
            onComplete={() => {
              setTransitionReady(true);
            }}
          />
        </div>
      ) : null}

      {stage === "preview" && resultProfile ? (
        <div className="preview-reveal">
          <ResultPreviewShell
            assessment={assessment}
            assessmentSessionId={persistedPreview?.sessionId ?? null}
            resultProfile={resultProfile}
            premiumReport={premiumReport}
            relatedAssessments={relatedAssessments}
            serverCanAccessFullReport={serverCanAccessFullReport}
            onReviewAnswers={() => setStage("questions")}
          />
        </div>
      ) : null}
    </div>
  );
}
