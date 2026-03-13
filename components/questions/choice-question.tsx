import type { AssessmentQuestion } from "@/lib/types/assessment-domain";
import { cn } from "@/lib/utils";

import { QuestionOptionCard } from "@/components/questions/question-option-card";

type ChoiceQuestionProps = {
  question: AssessmentQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function ChoiceQuestion({
  question,
  selectedOptionId,
  onSelect
}: ChoiceQuestionProps) {
  const isForcedChoice = question.type === "forced_choice";

  return (
    <div
      className={cn(
        "grid gap-3.5",
        isForcedChoice ? "lg:grid-cols-2" : question.optionLayout === "grid" ? "sm:grid-cols-2" : "grid-cols-1"
      )}
    >
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
  );
}
