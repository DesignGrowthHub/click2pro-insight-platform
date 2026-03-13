import { getAssessmentPromptContext } from "@/lib/ai/prompts/assessment-contexts";
import type {
  AIReportProvider,
  AISectionGenerationInput
} from "@/lib/ai/reporting/provider";
import type { AIGeneratedNarrativeSection } from "@/lib/types/assessment-domain";

function sentenceCaseList(values: string[]) {
  return values.filter(Boolean).join(", ");
}

function firstOrFallback(values: string[], fallback: string) {
  return values[0] ?? fallback;
}

function prettifyContextMarker(value: string) {
  return value.replace(/_/g, " ");
}

function buildGenericParagraphs(input: AISectionGenerationInput) {
  const { payload, request, promptBundle } = input;
  const context = getAssessmentPromptContext(payload.assessmentSlug);
  const dominant = firstOrFallback(
    request.dominantDimensionLabels,
    payload.resultSummary.label
  );
  const topSignals = promptBundle.groundingSignals.slice(0, 2).join(" and ");
  const priorBoundary =
    input.previousSections.length > 0
      ? `This section should add a new layer beyond ${input.previousSections
          .slice(-1)
          .map((section) => section.title.toLowerCase())
          .join(", ")}.`
      : "";

  return [
    `${payload.resultSummary.narrative} In this section, the strongest thread appears to center on ${dominant.toLowerCase()}, with ${topSignals || dominant.toLowerCase()} giving the pattern a more measurable shape.`,
    `The responses suggest that ${request.anchorSummary.charAt(0).toLowerCase()}${request.anchorSummary.slice(
      1
    )} ${
      payload.contextMarkers.length
        ? `The pattern appears more active around ${sentenceCaseList(
            payload.contextMarkers.slice(0, 2).map(prettifyContextMarker)
          )}.`
        : ""
    }`.trim(),
    `${priorBoundary} What gives the pattern weight is not only intensity, but the way it begins to shape interpretation, attention, and the amount of steadiness available in ordinary life. This matches the assessment lens around ${context.contextPriorities.join(", ")}.`
      .trim()
  ];
}

function buildGenericBullets(input: AISectionGenerationInput) {
  const { payload, request, promptBundle } = input;

  return [
    payload.previewInsights[0]?.body ??
      "The section should carry forward the clearest signal from the preview.",
    payload.tensionAreas[0]?.description ??
      "One tension area should stay visible so the interpretation does not feel flattened.",
    promptBundle.groundingSignals[0]
      ? `Keep the section tied to ${promptBundle.groundingSignals[0].toLowerCase()}.`
      : "",
    request.promptFocus[0] ? `Keep attention on ${request.promptFocus[0].toLowerCase()}.` : ""
  ].filter(Boolean);
}

function buildAssessmentSpecificNarrative(input: AISectionGenerationInput) {
  const { payload, request } = input;

  switch (payload.assessmentSlug) {
    case "condescending-behavior-decoder":
      if (request.sectionId === "emotional-drivers") {
        return {
          synopsis:
            "The emotional force in this pattern often comes from deniable power shifts rather than openly hostile behavior.",
          paragraphs: [
            "Your responses point toward a dynamic that can feel emotionally costly precisely because it stays subtle. The behavior does not need to become overtly aggressive to change how much space you take up, how freely you speak, or how quickly you start editing yourself.",
            "What appears to keep the pattern active is the combination of status signaling and uncertainty. When the interaction can still be explained away on the surface, the emotional burden often shifts onto you to prove that something is off, even while your responses are already showing the strain.",
            "That mix of deniability and impact is what makes this pattern harder to resolve cleanly than a straightforward disagreement."
          ],
          bullets: [
            "Small credibility shifts can accumulate into real self-trust erosion.",
            "You may stay in interpretation mode longer because the behavior is difficult to pin down cleanly.",
            "Boundary strain often shows up before explicit confrontation does."
          ],
          callout:
            "The difficult part is not only what the other person is doing, but how much work it creates inside you."
        };
      }

      if (request.sectionId === "blind-spots-or-tension-areas") {
        return {
          synopsis:
            "The main tension usually sits between wanting stronger proof and already feeling the relational cost.",
          paragraphs: [
            "One of the harder blind spots in this pattern is the hope that more evidence will finally make the situation simple. In practice, the pattern may already be affecting your confidence, speech, or posture long before certainty arrives.",
            "That can create an internal split: one part of you recognizes the diminishment, while another keeps negotiating with ambiguity because the behavior still looks explainable from the outside."
          ],
          bullets: [
            "Waiting for proof can delay attention to impact.",
            "Politeness can hide how much caution the interaction is already creating.",
            "The pattern may be easier to feel than to defend."
          ],
          callout:
            "Self-trust often weakens when impact is treated as less valid than proof."
        };
      }

      break;
    case "imposter-syndrome-deep-report":
      if (request.sectionId === "emotional-drivers") {
        return {
          synopsis:
            "This pattern often persists because internal permission lags behind external evidence.",
          paragraphs: [
            "Your scored profile suggests that self-doubt is not simply a lack of confidence. It appears more tied to a pressure system in which evidence counts less than the need to stay ahead of imagined exposure.",
            "That means achievement can bring relief briefly, then quickly turn into a new standard to maintain. The result is a cycle where competence is repeatedly proven but rarely allowed to settle fully.",
            "Comparison sensitivity can make the loop sharper by turning other people's progress into a moving reference point instead of neutral information."
          ],
          bullets: [
            "High standards may function as emotional protection as much as performance guidance.",
            "Praise can feel unstable if it does not change the underlying pressure story.",
            "Visibility often carries more strain than reassurance."
          ],
          callout:
            "The pattern is often less about lacking ability and more about lacking enough internal permission to let ability count."
        };
      }

      if (request.sectionId === "stability-suggestions") {
        return {
          synopsis:
            "Stability comes less from forcing confidence and more from letting evidence accumulate without immediately moving the standard.",
          paragraphs: [
            "The steadier path here is usually not to argue with every doubtful thought one by one. It is to interrupt the habit of treating competence as temporary while treating pressure as permanent.",
            "That often means building more deliberate evidence integration into ordinary work rhythms, especially after moments that normally trigger comparison or exposure strain."
          ],
          bullets: [
            "Keep completed evidence visible long enough to register.",
            "Notice where extra work is serving imagined exposure more than actual quality.",
            "Separate honest refinement from pressure-driven compensation."
          ],
          callout:
            "Relief tends to grow when evidence stays in view longer than the old pressure reflex."
        };
      }

      break;
    case "relationship-infatuation-obsession-analysis":
      if (request.sectionId === "emotional-drivers") {
        return {
          synopsis:
            "The loop often gains strength from ambiguity and unfinished meaning more than from direct relationship reality alone.",
          paragraphs: [
            "Your responses suggest an attachment pattern that keeps returning because the emotional system is trying to resolve uncertainty, not simply because the feeling is intense. Mixed signals, incomplete meaning, and imagined future clarity can keep attention locked in place.",
            "That is why the pattern may feel persistent even when there is little concrete movement externally. The internal loop is being reinforced by possibility, interpretation, and the difficulty of arriving at closure on your own terms.",
            "When that happens, preoccupation can start to compete with ordinary life for mental space, making the pattern feel larger than the relationship facts alone would suggest."
          ],
          bullets: [
            "Ambiguity can be emotionally activating, not only frustrating.",
            "The mind may return to the pattern to finish a story that still feels unresolved.",
            "Intensity can be partly attached to meaning, not only to the person."
          ],
          callout:
            "The loop often stays active when uncertainty itself has become emotionally charged."
        };
      }

      if (request.sectionId === "daily-life-impact") {
        return {
          synopsis:
            "This pattern tends to change attention first, then mood, routine, and the feeling of having your own life fully in view.",
          paragraphs: [
            "In real life, this kind of preoccupation often shows up as attention drift: checking, replaying, anticipating, or mentally returning to the same person or storyline even when you would rather be elsewhere.",
            "That repeated return can affect mood and steadiness more quietly than people expect. The issue is not only emotional intensity, but how much of daily life remains organized around waiting, interpreting, or imagining resolution."
          ],
          bullets: [
            "The pattern may consume more mental space than is visible from the outside.",
            "Routine often becomes thinner when ambiguity takes center stage.",
            "Clarity is often measured by internal calm, not only by contact outcomes."
          ],
          callout:
            "A useful marker of recovery is how much of the rest of life comes back into focus."
        };
      }

      break;
    default:
      break;
  }

  const context = getAssessmentPromptContext(payload.assessmentSlug);

  return {
    synopsis: request.anchorSummary,
    paragraphs: buildGenericParagraphs(input),
    bullets: [
      ...buildGenericBullets(input).slice(0, 2),
      `Interpretive emphasis: ${context.interpretiveLens}`,
      input.promptBundle.roleBoundaries[0]
    ].slice(0, 4),
    callout:
      payload.patternClusters[0]?.description ??
      "The report should keep the strongest pattern cluster visible without overclaiming certainty."
  };
}

export function generateMockNarrativeSectionSync(
  input: AISectionGenerationInput
): AIGeneratedNarrativeSection {
  const narrative = buildAssessmentSpecificNarrative(input);

  return {
    id: `${input.request.sectionId}-mock-narrative`,
    sectionId: input.request.sectionId,
    title: input.request.title,
    providerMode: "mock",
    status: "mock_ready",
    synopsis: narrative.synopsis,
    paragraphs: narrative.paragraphs,
    bullets: narrative.bullets,
    callout: narrative.callout,
    promptBundle: input.promptBundle,
    validationNotes: [
      "Generated by the mock narrative provider until live OpenAI integration is added.",
      "Section generated independently so future providers can retry or QA one section at a time."
    ]
  };
}

export function createMockAIReportProvider(): AIReportProvider {
  return {
    mode: "mock",
    async generateSection(input) {
      return generateMockNarrativeSectionSync(input);
    }
  };
}
