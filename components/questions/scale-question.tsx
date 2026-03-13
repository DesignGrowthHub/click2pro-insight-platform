import type { AssessmentQuestion } from "@/lib/types/assessment-domain";

import { QuestionOptionCard } from "@/components/questions/question-option-card";

type ScaleQuestionProps = {
  question: AssessmentQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function ScaleQuestion({
  question,
  selectedOptionId,
  onSelect
}: ScaleQuestionProps) {
  const firstOption = question.options[0];
  const lastOption = question.options[question.options.length - 1];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
        <p className="text-sm leading-6 text-muted">
          Move toward the response that feels closest.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            {firstOption?.label}
          </span>
          <span className="text-white/20">to</span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            {lastOption?.label}
          </span>
        </div>
      </div>
      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <QuestionOptionCard
            key={option.id}
            index={index}
            label={option.label}
            description={option.description}
            selected={selectedOptionId === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
