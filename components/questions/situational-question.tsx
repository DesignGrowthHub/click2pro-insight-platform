import type { AssessmentQuestion } from "@/lib/types/assessment-domain";

import { QuestionOptionCard } from "@/components/questions/question-option-card";

type SituationalQuestionProps = {
  question: AssessmentQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function SituationalQuestion({
  question,
  selectedOptionId,
  onSelect
}: SituationalQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-sm leading-6 text-muted">
          Choose the response that feels closest to how you actually react.
        </p>
      </div>
      <div className="grid gap-3.5">
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
