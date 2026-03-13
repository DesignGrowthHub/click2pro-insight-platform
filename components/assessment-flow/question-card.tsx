import { ChoiceQuestion } from "@/components/questions/choice-question";
import { ScaleQuestion } from "@/components/questions/scale-question";
import { SituationalQuestion } from "@/components/questions/situational-question";
import type { AssessmentQuestion } from "@/lib/types/assessment-domain";

type QuestionCardProps = {
  question: AssessmentQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

function questionTypeLabel(question: AssessmentQuestion) {
  if (question.type === "scale") {
    return question.scaleKey === "frequency"
      ? "Reflection scale"
      : question.scaleKey === "impact"
        ? "Impact scale"
        : question.scaleKey === "likelihood"
          ? "Likelihood scale"
          : question.scaleKey === "truth"
            ? "Self-read"
            : "Agreement scale";
  }

  if (question.type === "forced_choice") {
    return "Closest fit";
  }

  if (question.type === "situational") {
    return "Scenario response";
  }

  return "Response choice";
}

export function QuestionCard({
  question,
  selectedOptionId,
  onSelect
}: QuestionCardProps) {
  const questionInput =
    question.type === "scale" ? (
      <ScaleQuestion
        question={question}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
      />
    ) : question.type === "situational" ? (
      <SituationalQuestion
        question={question}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
      />
    ) : (
      <ChoiceQuestion
        question={question}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
      />
    );

  return (
    <div className="space-y-3.5">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="assessment-question-tag">
            {questionTypeLabel(question)}
          </span>
        </div>
        <div className="space-y-1.5">
          <h2 className="max-w-4xl text-[1.82rem] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground sm:text-[2.16rem] lg:text-[2.32rem]">
            {question.prompt}
          </h2>
          {question.helperText ? (
            <div className="assessment-question-note">
              <p className="reading-column-tight text-sm leading-6 text-muted">
                {question.helperText}
              </p>
            </div>
          ) : (
            <p className="reading-column-tight text-[0.94rem] leading-6 text-muted">
              Answer from your first honest reaction rather than the most polished one.
            </p>
          )}
        </div>
      </div>
      {questionInput}
    </div>
  );
}
