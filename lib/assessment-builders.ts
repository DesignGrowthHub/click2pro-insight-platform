import type {
  AnswerOption,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentSection,
  QuestionScaleKey
} from "@/lib/types/assessment-domain";

type ScaleTemplateOption = {
  id: string;
  label: string;
  description?: string;
  value: number;
};

type ScaleQuestionConfig = {
  id: string;
  sectionId: string;
  prompt: string;
  scaleKey: QuestionScaleKey;
  dimensionWeights: Record<string, number>;
  helperText?: string;
  reverseScored?: boolean;
  tags?: string[];
  optionLayout?: "stack" | "grid";
  moderateValueContextMarkers?: string[];
  highValueContextMarkers?: string[];
};

type ChoiceOptionSeed = {
  id: string;
  label: string;
  description?: string;
  value: number;
  dimensionWeights: Record<string, number>;
  contextMarkers?: string[];
};

type ChoiceQuestionConfig = {
  id: string;
  sectionId: string;
  prompt: string;
  type: Extract<
    AssessmentQuestionType,
    "multiple_choice" | "situational" | "forced_choice"
  >;
  options: ChoiceOptionSeed[];
  helperText?: string;
  tags?: string[];
  optionLayout?: "stack" | "grid";
};

type SectionSeed = Omit<AssessmentSection, "questionIds">;

const scaleTemplates: Record<QuestionScaleKey, ScaleTemplateOption[]> = {
  agreement: [
    { id: "strongly-disagree", label: "Strongly disagree", value: 0 },
    { id: "disagree", label: "Disagree", value: 1 },
    { id: "mixed", label: "Mixed / unsure", value: 2 },
    { id: "agree", label: "Agree", value: 3 },
    { id: "strongly-agree", label: "Strongly agree", value: 4 }
  ],
  frequency: [
    { id: "never", label: "Never or almost never", value: 0 },
    { id: "rarely", label: "Rarely", value: 1 },
    { id: "sometimes", label: "Sometimes", value: 2 },
    { id: "often", label: "Often", value: 3 },
    { id: "very-often", label: "Very often", value: 4 }
  ],
  impact: [
    { id: "not-at-all", label: "Not at all", value: 0 },
    { id: "slightly", label: "Slightly", value: 1 },
    { id: "somewhat", label: "Somewhat", value: 2 },
    { id: "strongly", label: "Strongly", value: 3 },
    { id: "extremely", label: "Extremely", value: 4 }
  ],
  truth: [
    { id: "not-like-me", label: "Not like me at all", value: 0 },
    { id: "a-little", label: "A little like me", value: 1 },
    { id: "somewhat", label: "Somewhat like me", value: 2 },
    { id: "mostly", label: "Mostly like me", value: 3 },
    { id: "very-much", label: "Very much like me", value: 4 }
  ],
  likelihood: [
    { id: "very-unlikely", label: "Very unlikely", value: 0 },
    { id: "unlikely", label: "Unlikely", value: 1 },
    { id: "uncertain", label: "Hard to tell", value: 2 },
    { id: "likely", label: "Likely", value: 3 },
    { id: "very-likely", label: "Very likely", value: 4 }
  ]
};

function buildScaleOptions({
  id,
  dimensionWeights,
  scaleKey,
  reverseScored = false,
  moderateValueContextMarkers = [],
  highValueContextMarkers = []
}: Pick<
  ScaleQuestionConfig,
  | "id"
  | "dimensionWeights"
  | "scaleKey"
  | "reverseScored"
  | "moderateValueContextMarkers"
  | "highValueContextMarkers"
>): AnswerOption[] {
  return scaleTemplates[scaleKey].map((template) => {
    const effectiveValue = reverseScored ? 4 - template.value : template.value;
    const optionContextMarkers =
      template.value >= 4
        ? highValueContextMarkers
        : template.value >= 3
          ? moderateValueContextMarkers
          : [];

    return {
      id: `${id}-${template.id}`,
      label: template.label,
      description: template.description,
      value: template.value,
      dimensionWeights: Object.fromEntries(
        Object.entries(dimensionWeights).map(([dimensionKey, weight]) => [
          dimensionKey,
          Number((effectiveValue * weight).toFixed(2))
        ])
      ),
      contextMarkers: optionContextMarkers
    };
  });
}

export function createScaleQuestion(config: ScaleQuestionConfig): AssessmentQuestion {
  return {
    id: config.id,
    sectionId: config.sectionId,
    prompt: config.prompt,
    type: "scale",
    scaleKey: config.scaleKey,
    helperText: config.helperText,
    reverseScored: config.reverseScored ?? false,
    optionLayout: config.optionLayout ?? "stack",
    dimensionKeys: Object.keys(config.dimensionWeights),
    tags: config.tags,
    options: buildScaleOptions(config)
  };
}

export function createChoiceQuestion(config: ChoiceQuestionConfig): AssessmentQuestion {
  return {
    id: config.id,
    sectionId: config.sectionId,
    prompt: config.prompt,
    type: config.type,
    helperText: config.helperText,
    optionLayout: config.optionLayout ?? "stack",
    dimensionKeys: Array.from(
      new Set(
        config.options.flatMap((option) => Object.keys(option.dimensionWeights))
      )
    ),
    tags: config.tags,
    options: config.options.map((option) => ({
      ...option,
      id: `${config.id}-${option.id}`
    }))
  };
}

export function attachQuestionIdsToSections(
  sectionSeeds: SectionSeed[],
  questions: AssessmentQuestion[]
): AssessmentSection[] {
  return sectionSeeds.map((section) => ({
    ...section,
    questionIds: questions
      .filter((question) => question.sectionId === section.id)
      .map((question) => question.id)
  }));
}
