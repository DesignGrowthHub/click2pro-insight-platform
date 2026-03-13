import type { AssessmentDefinition } from "@/lib/types/assessment-domain";
import type { AssessmentResponseMap } from "@/lib/scoring/assessment-scoring";

const scenarioTargets: Record<string, Record<string, number>> = {
  "condescending-behavior-decoder": {
    dismissive_delivery: 1.3,
    self_trust_erosion: 1.2,
    boundary_pressure: 1.05,
    status_signaling: 0.95
  },
  "imposter-syndrome-deep-report": {
    exposure_fear: 1.25,
    achievement_discounting: 1.2,
    overpreparation_loop: 1.1,
    praise_resistance: 0.95,
    comparison_pressure: 0.8
  },
  "relationship-infatuation-obsession-analysis": {
    uncertainty_reinforcement: 1.25,
    intrusive_focus: 1.15,
    release_resistance: 1,
    fantasy_projection: 0.95,
    self_abandonment: 0.9
  }
};

function scoreOption(
  option: AssessmentDefinition["questions"][number]["options"][number],
  targets: Record<string, number>,
  useSofterSelection: boolean
) {
  const weightedValue = Object.entries(option.dimensionWeights).reduce(
    (total, [dimensionKey, weight]) =>
      total + weight * (targets[dimensionKey] ?? 0.45),
    0
  );

  // Keep demo profiles believable by occasionally preferring a slightly less extreme option.
  return useSofterSelection ? weightedValue - option.value * 0.08 : weightedValue;
}

export function buildDemoAssessmentResponses(
  assessment: AssessmentDefinition
): AssessmentResponseMap {
  const targets = scenarioTargets[assessment.slug] ?? {};

  return Object.fromEntries(
    assessment.questions.map((question, index) => {
      const sortedOptions = [...question.options].sort((left, right) => {
        const useSofterSelection = index % 3 === 1;

        return (
          scoreOption(right, targets, useSofterSelection) -
          scoreOption(left, targets, useSofterSelection)
        );
      });
      const selectedOption =
        sortedOptions[index % 4 === 2 && sortedOptions[1] ? 1 : 0] ??
        question.options[0];

      return [question.id, selectedOption.id];
    })
  );
}
