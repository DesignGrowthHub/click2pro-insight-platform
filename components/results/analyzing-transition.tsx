"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightIcon, SparkIcon } from "@/components/ui/icons";
import type { AssessmentTransitionStep } from "@/lib/assessment-engine/flow";
import { cn } from "@/lib/utils";

type AnalyzingTransitionProps = {
  title: string;
  description: string;
  note: string;
  steps: AssessmentTransitionStep[];
  durationMs: number;
  onComplete: () => void;
};

export function AnalyzingTransition({
  title,
  description,
  note,
  steps,
  durationMs,
  onComplete
}: AnalyzingTransitionProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const displaySteps = steps.slice(0, 3);
  const progressPercent = Math.min(100, Math.round((elapsedMs / durationMs) * 100));
  const stageDurationMs = durationMs / Math.max(displaySteps.length, 1);
  const activeStepIndex = Math.min(
    displaySteps.length - 1,
    Math.floor(elapsedMs / Math.max(stageDurationMs, 1))
  );
  const activeStep = displaySteps[activeStepIndex] ?? displaySteps[0];
  const completionEstimate = useMemo(
    () => `${Math.round(durationMs / 1000)} second guided analysis`,
    [durationMs]
  );

  useEffect(() => {
    const tickInterval = window.setInterval(() => {
      setElapsedMs((current) => Math.min(current + 120, durationMs));
    }, 120);

    const completionTimeout = window.setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      window.clearInterval(tickInterval);
      window.clearTimeout(completionTimeout);
    };
  }, [durationMs, onComplete]);

  return (
    <Card variant="raised" className="assessment-mode-shell overflow-hidden">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Pattern analysis</Badge>
            <Badge variant="outline">{completionEstimate}</Badge>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
            <SparkIcon className="h-5 w-5" />
          </span>
        </div>
        <div className="space-y-3 text-center">
          <CardTitle className="text-[2rem] sm:text-[2.4rem]">{title}</CardTitle>
          <p className="mx-auto max-w-3xl reading-column-tight text-base leading-8 text-muted">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex max-w-[260px] justify-center">
            <div
              className="analysis-ring relative flex h-[228px] w-[228px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(rgba(59,130,246,0.96) ${progressPercent}%, rgba(255,255,255,0.08) ${progressPercent}% 100%)`
              }}
            >
              <div className="absolute inset-[14px] rounded-full bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
              <div className="relative z-10 space-y-3 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
                  <InsightIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[2.2rem] font-semibold tracking-[-0.05em] text-foreground">
                    {progressPercent}%
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted">
                    Guided report preparation
                  </p>
                </div>
                <p className="px-6 text-xs uppercase tracking-[0.22em] text-primary/80">
                  {activeStep ? `Stage ${activeStepIndex + 1} of ${displaySteps.length}` : "Analyzing"}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-block-strong mx-auto max-w-[720px] p-5 sm:p-6">
            <p className="insight-label">Current stage</p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {activeStep?.label}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {activeStep?.detail}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {displaySteps.map((step, index) => {
            const isComplete = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "surface-block relative overflow-hidden px-4 py-3.5 transition-all duration-500 sm:px-5 sm:py-4",
                  isCurrent && "border-primary/24 bg-primary/[0.08] shadow-[0_16px_34px_rgba(59,130,246,0.12)]",
                  isComplete && "border-success/18 bg-success/[0.06]"
                )}
              >
                {isCurrent ? (
                  <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                ) : null}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-300",
                        isComplete &&
                          "border-success/24 bg-success/12 text-success",
                        isCurrent &&
                          "border-primary/24 bg-primary/12 text-primary shadow-[0_0_0_6px_rgba(59,130,246,0.08)]",
                        !isComplete &&
                          !isCurrent &&
                          "border-white/10 bg-white/[0.04] text-muted"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {isComplete ? "Done" : isCurrent ? "Now" : "Next"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground sm:text-[0.96rem]">
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="analysis-bar h-full rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.92),rgba(96,165,250,0.98),rgba(34,197,94,0.72))]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mx-auto max-w-3xl reading-column-tight text-center text-sm leading-7 text-muted">
          {note}
        </p>
      </CardContent>
    </Card>
  );
}
