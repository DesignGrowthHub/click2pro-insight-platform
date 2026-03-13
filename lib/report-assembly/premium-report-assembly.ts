import { createAiNarrativePlaceholderBlock } from "@/lib/ai/payloads/build-ai-insight-payload";
import {
  runAIInsightEngineSync,
  runAIInsightEngineWithProvider
} from "@/lib/ai/reporting/insight-engine";
import type { AIReportProvider } from "@/lib/ai/reporting/provider";
import type {
  AIGeneratedNarrativeSection,
  AssessmentDefinition,
  AssessmentResultProfile,
  ComposedReportSection,
  PremiumReport,
  ReportContentBlock,
  ReportSectionDefinition,
  ReportSectionFormat
} from "@/lib/types/assessment-domain";

function formatStyleForSection(sectionId: string): ReportSectionFormat {
  switch (sectionId) {
    case "pattern-summary":
      return "summary";
    case "what-responses-suggest":
      return "analysis";
    case "emotional-drivers":
      return "drivers";
    case "daily-life-impact":
      return "impact";
    case "stability-suggestions":
      return "guidance";
    case "related-next-insights":
      return "cross_sell";
    default:
      return "analysis";
  }
}

function buildDominantMetricBlocks(resultProfile: AssessmentResultProfile) {
  return resultProfile.dimensionScores.slice(0, 3).map((dimension) => ({
    label: dimension.label,
    value: `${dimension.normalizedScore}%`,
    band: dimension.band
  }));
}

function joinBodies(values: string[]) {
  return values.filter(Boolean).join(" ");
}

function truncate(value: string, limit = 180) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}...`;
}

function uniqueItems(values: string[], limit = values.length) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, limit);
}

function joinWithAnd(values: string[]) {
  const filtered = values.filter(Boolean);

  if (filtered.length <= 1) {
    return filtered[0] ?? "";
  }

  if (filtered.length === 2) {
    return `${filtered[0]} and ${filtered[1]}`;
  }

  return `${filtered.slice(0, -1).join(", ")}, and ${filtered[filtered.length - 1]}`;
}

function buildPatternSignature(resultProfile: AssessmentResultProfile) {
  const leadingDimensions = resultProfile.dimensionScores
    .slice(0, 2)
    .map((dimension) => dimension.label);
  const clusterLabel =
    resultProfile.patternClusters[0]?.label ?? resultProfile.summaryLabel;

  return `The clearest signature in this result combines ${joinWithAnd(
    leadingDimensions
  ).toLowerCase()} inside a broader ${clusterLabel.toLowerCase()} pattern.`;
}

function buildPatternRead(resultProfile: AssessmentResultProfile) {
  const dominant = resultProfile.dominantTendencies
    .slice(0, 2)
    .map((tendency) => tendency.description);
  const friction = resultProfile.frictionAreas[0]?.description;

  return joinBodies([
    buildPatternSignature(resultProfile),
    dominant.length
      ? `The response set consistently points toward ${joinWithAnd(dominant).toLowerCase()}.`
      : "",
    friction
      ? `The main tension appears where ${friction.charAt(0).toLowerCase()}${friction.slice(1)}`
      : ""
  ]);
}

function buildPressureNarrative(resultProfile: AssessmentResultProfile) {
  const topPressure = resultProfile.dimensionScores
    .slice(0, 2)
    .map((dimension) => `${dimension.label.toLowerCase()} (${dimension.band})`);

  return `The strongest pressure in this result appears around ${joinWithAnd(
    topPressure
  )}, which helps explain why the pattern may intensify quickly once it is activated.`;
}

function buildResponseNarrative(resultProfile: AssessmentResultProfile) {
  const tendencies = resultProfile.dominantTendencies
    .slice(0, 2)
    .map((tendency) => tendency.label.toLowerCase());

  return tendencies.length
    ? `Once the pattern is active, the report suggests a response style organized around ${joinWithAnd(
        tendencies
      )}.`
    : "Once the pattern is active, the report focuses on how it changes interpretation, reaction, and outward behavior.";
}

function buildFrictionNarrative(resultProfile: AssessmentResultProfile) {
  const friction = resultProfile.frictionAreas
    .slice(0, 2)
    .map((area) => area.description);

  return friction.length
    ? `The hidden difficulty is less about one obvious mistake and more about how ${joinWithAnd(
        friction
      ).toLowerCase()}.`
    : "The hidden difficulty is usually not the surface feeling alone, but the quieter loops that keep the pattern active underneath it.";
}

function buildStabilityNarrative(resultProfile: AssessmentResultProfile) {
  const anchors = resultProfile.protectiveTendencies
    .slice(0, 2)
    .map((tendency) => tendency.label.toLowerCase());

  return anchors.length
    ? `The most useful stabilizing moves usually build on ${joinWithAnd(
        anchors
      )}, rather than trying to overpower the whole pattern at once.`
    : "The most useful stabilizing moves usually come from slowing the loop, naming what intensifies it, and creating more room before reacting.";
}

function aiLabels(sectionId: string) {
  switch (sectionId) {
    case "what-responses-suggest":
      return {
        synopsis: "Personalized pattern interpretation",
        bullets: "Response tendencies"
      };
    case "emotional-drivers":
      return {
        synopsis: "Emotional drivers",
        bullets: "What may be reinforcing the pattern"
      };
    case "daily-life-impact":
      return {
        synopsis: "What this may look like in real life",
        bullets: "Likely lived effects"
      };
    case "blind-spots-or-tension-areas":
      return {
        synopsis: "Hidden friction areas",
        bullets: "Tension points to watch"
      };
    case "stability-suggestions":
      return {
        synopsis: "Stability suggestions",
        bullets: "Grounding moves"
      };
    default:
      return {
        synopsis: "Personalized narrative",
        bullets: "Supporting detail"
      };
  }
}

function buildNarrativeBlocks(
  sectionId: string,
  narrative: AIGeneratedNarrativeSection,
  revealLevel: "preview" | "full"
): ReportContentBlock[] {
  const labels = aiLabels(sectionId);
  const visibleParagraphs =
    revealLevel === "preview" ? narrative.paragraphs.slice(0, 1) : narrative.paragraphs;
  const visibleBullets =
    revealLevel === "preview" ? narrative.bullets.slice(0, 2) : narrative.bullets;

  return [
    {
      id: `${sectionId}-ai-synopsis`,
      type: "callout",
      label: labels.synopsis,
      content: narrative.synopsis
    },
    ...visibleParagraphs.map((paragraph, index) => ({
      id: `${sectionId}-ai-paragraph-${index + 1}`,
      type: "paragraph" as const,
      label: index === 0 ? "Narrative interpretation" : undefined,
      content: paragraph
    })),
    ...(visibleBullets.length
      ? [
          {
            id: `${sectionId}-ai-bullets`,
            type: "bullet_list" as const,
            label: labels.bullets,
            items: visibleBullets
          }
        ]
      : []),
    ...(revealLevel === "full" && narrative.callout
      ? [
          {
            id: `${sectionId}-ai-callout`,
            type: "callout" as const,
            label: "Interpretive emphasis",
            content: narrative.callout
          }
        ]
      : [])
  ];
}

function buildSectionIntro(sectionId: string) {
  switch (sectionId) {
    case "pattern-summary":
      return "This section pulls together the clearest scored signals so the overall shape of the pattern becomes visible before the report moves into deeper interpretation.";
    case "what-responses-suggest":
      return "This section translates the pattern into practical meaning across interpretation, emotion, and everyday response style.";
    case "emotional-drivers":
      return "This section looks at the situations, sensitivities, and internal pressures that appear to make the pattern stronger.";
    case "daily-life-impact":
      return "This section shows how the pattern tends to appear internally and externally once it becomes active.";
    case "blind-spots-or-tension-areas":
      return "This section explores the subtler difficulties, interpretation traps, or pressure loops that may be keeping the pattern active.";
    case "stability-suggestions":
      return "This section offers reflective guidance for creating more steadiness and clarity without forcing a dramatic shift.";
    case "related-next-insights":
      return "This section points to adjacent assessments that may help clarify connected patterns rather than treating this result in isolation.";
    default:
      return "This section expands one part of the report into a more readable and practical interpretation.";
  }
}

function buildAssessmentSpecificSectionCopy(
  assessment: AssessmentDefinition
) {
  switch (assessment.slug) {
    case "condescending-behavior-decoder":
      return {
        interpretation:
          "In practical terms, this pattern is often less about one openly rude moment and more about repeated credibility shifts that make you edit yourself, second-guess your read, or work too hard to stay on solid ground.",
        interpretationContexts: [
          "The dynamic may be strongest when authority, expertise, or audience are already in the room.",
          "You may leave the interaction still trying to decide whether what happened was real enough to count.",
          "The pattern often affects self-trust before it becomes easy to explain to someone else."
        ],
        drivers:
          "This pattern tends to be reinforced by deniability, subtle status shifts, and the difficulty of answering behavior that never becomes explicit enough on its face.",
        pressurePoints: [
          "Public correction, subtle one-upmanship, or being talked over in front of other people",
          "Moments when you are already vulnerable, uncertain, or asking for help",
          "Situations where rank, expertise, age, or audience increase the other person's leverage"
        ],
        impact:
          "When this dynamic repeats, it can change how freely you speak, how much detail you share, and how quickly you start pre-editing your own reactions.",
        responseTendencies: [
          "Replaying the interaction later to work out what actually happened",
          "Overexplaining, tightening up, or trying to secure basic respect through performance",
          "Pulling back, becoming guarded, or bracing before contact even begins"
        ],
        blindSpots:
          "One of the hardest parts of this pattern is that you can keep searching for better proof while your body and self-trust have already recognized the cost.",
        frictionPoints: [
          "Misreading the problem as sensitivity when the deeper issue is repeated diminishment",
          "Waiting for cleaner proof while the relational cost keeps accumulating",
          "Normalizing subtle disrespect because the tone stays polished enough to deny"
        ],
        stabilityIntro:
          "Stability here usually starts with trusting the cost of the interaction sooner, rather than waiting for perfect proof.",
        stability: [
          "Track whether the strain is strongest around specific topics, audiences, or credibility shifts.",
          "Separate the question of whether the behavior is provable from the question of whether it is affecting you.",
          "Notice whether you leave the interaction clearer, smaller, or more self-editing than before."
        ],
        related:
          "The most useful next reports usually clarify whether this pattern belongs inside a broader red-flag dynamic, an attachment loop, or an emerging boundary problem."
      };
    case "imposter-syndrome-deep-report":
      return {
        interpretation:
          "In practical terms, this pattern often means competence is visible on the outside while legitimacy still feels unstable on the inside. That gap can shape work rhythms, self-evaluation, and how much pressure praise creates.",
        interpretationContexts: [
          "The pattern often sharpens around evaluation, visibility, or responsibility rather than in low-stakes settings.",
          "A strong outcome can briefly calm the pressure, then quickly become a new standard to maintain.",
          "You may work harder not only to do well, but to reduce the fear of being seen as less capable than expected."
        ],
        drivers:
          "This pattern is often maintained by the gap between external evidence and internal permission to let that evidence count. Visibility then turns into pressure instead of grounding.",
        pressurePoints: [
          "High-visibility work, delayed feedback, or responsibility that puts your judgment on display",
          "Praise or trust that increases the sense that you now have more to live up to",
          "Comparison moments that make other people's ease feel more believable than your own evidence"
        ],
        impact:
          "In daily life, the loop tends to show up as overpreparation, difficulty absorbing praise, reluctance to relax after good work, and a sense that certainty must be earned again.",
        responseTendencies: [
          "Double-checking, overpreparing, or staying in revision mode longer than the work requires",
          "Discounting success quickly while staying vividly aware of possible flaws",
          "Treating rest as risky because relief never feels fully earned"
        ],
        blindSpots:
          "A major blind spot in imposter patterns is how easily high standards can disguise emotional protection as professionalism.",
        frictionPoints: [
          "Mistaking pressure-driven overwork for the only responsible way to function",
          "Treating other people's confidence as more valid than your own repeated evidence",
          "Letting praise raise the stakes instead of letting it settle your footing"
        ],
        stabilityIntro:
          "Stability here usually comes from changing how evidence is absorbed, not from demanding that confidence arrive all at once.",
        stability: [
          "Notice where competence is being treated as temporary instead of cumulative.",
          "Separate honest refinement from work that is mainly trying to prevent imagined exposure.",
          "Let completed evidence stay visible long enough to register before immediately moving the standard."
        ],
        related:
          "The most useful next reports often clarify whether this pressure is also touching identity strain, burnout, or the way you organize self-worth around performance."
      };
    case "relationship-infatuation-obsession-analysis":
      return {
        interpretation:
          "In practical terms, this pattern often means attention is being organized around ambiguity, imagined meaning, or the hope of resolution. The loop can feel relational on the surface while also becoming a structure for mood, focus, and self-alignment.",
        interpretationContexts: [
          "The pattern often intensifies around silence, mixed signals, or partial contact rather than around steady closeness.",
          "Small moments can carry a disproportionate amount of meaning because your mind is trying to resolve the uncertainty.",
          "The difficulty is often not only the feeling itself, but how much of daily life starts moving around it."
        ],
        drivers:
          "This kind of attachment loop is often reinforced by ambiguity, unfinished meaning, and repeated mental return. The uncertainty itself can become emotionally activating.",
        pressurePoints: [
          "Mixed signals, delayed replies, or warmth that appears briefly and then disappears again",
          "Moments that invite hope without creating real clarity",
          "Unresolved endings that make distance feel emotionally incomplete"
        ],
        impact:
          "When the pattern deepens, it can reshape attention, checking, mood, routine, and the amount of ordinary life that still feels fully yours.",
        responseTendencies: [
          "Checking, rereading, or monitoring more than you want to admit",
          "Building meaning from fragments, brief signals, or imagined future versions of the relationship",
          "Rearranging mood, pace, or routine around the possibility of contact or clarity"
        ],
        blindSpots:
          "The loop can feel like it is only about the other person when part of the real mechanism is the meaning, hope, or unanswered storyline attached to them.",
        frictionPoints: [
          "Treating small signals as larger evidence than they can really support",
          "Confusing emotional activation with actual movement in the relationship",
          "Struggling to loosen the loop because distance also feels like losing meaning"
        ],
        stabilityIntro:
          "Stability here usually starts with reducing the fuel around the loop rather than demanding that the feeling disappear immediately.",
        stability: [
          "Notice whether the loop grows around ambiguity, private fantasy, or direct contact.",
          "Track what it is costing in attention, self-respect, routine, and emotional steadiness.",
          "Measure relief by how much life comes back into view, not only by whether the feeling disappears immediately."
        ],
        related:
          "The most useful next reports often help separate attachment style, closure difficulty, and repeated relationship loops that might otherwise blur together."
      };
    default:
      return {
        interpretation:
          "This section translates the scored pattern into practical meaning across daily life, relationships, and self-interpretation.",
        interpretationContexts: [
          "The strongest scored tendencies usually shape interpretation before they shape visible behavior.",
          "Patterns become more costly when they start reorganizing attention, emotion, or choice.",
          "Clearer reflection often comes from noticing the repeat loop, not from judging one isolated moment."
        ],
        drivers:
          "The premium report will later expand the internal mechanics keeping this pattern active.",
        pressurePoints: [
          "Situations that raise uncertainty, pressure, or emotional interpretation",
          "Moments where the scored pattern becomes easier to feel than to explain",
          "Contexts that create more internal activation than the situation alone would suggest"
        ],
        impact:
          "The report will translate the scored pattern into recognizable everyday effects across relationships, work, or ordinary life.",
        responseTendencies: [
          "Interpretive looping once the pattern is active",
          "Behavior shifts that make the pattern easier to sustain",
          "Attempts to stabilize that only partly solve the real issue"
        ],
        blindSpots:
          "The report will surface contradictions, protective blind spots, or tension areas that are harder to see from the inside.",
        frictionPoints: [
          "Missing the repeat loop because each moment is treated in isolation",
          "Confusing emotional activation with reliable evidence",
          "Staying with a familiar pattern longer than it deserves"
        ],
        stabilityIntro:
          "The goal of this section is to suggest grounded ways to create more clarity without overcorrecting.",
        stability: [
          "Identify what strengthens the pattern.",
          "Map where the daily-life cost is showing up first.",
          "Create calmer next-step structure without overreacting."
        ],
        related:
          "Related reports are positioned to clarify adjacent patterns when one result is unlikely to explain the full picture on its own."
      };
  }
}

function buildSectionMetrics(
  sectionId: string,
  resultProfile: AssessmentResultProfile
) {
  switch (sectionId) {
    case "emotional-drivers":
      return resultProfile.dimensionScores.slice(0, 3).map((dimension) => ({
        label: dimension.label,
        value: `${dimension.normalizedScore}%`,
        band: dimension.band
      }));
    case "daily-life-impact":
      return resultProfile.dimensionScores.slice(0, 2).map((dimension) => ({
        label: dimension.shortLabel,
        value: `${dimension.normalizedScore}%`,
        band: dimension.band
      }));
    default:
      return buildDominantMetricBlocks(resultProfile);
  }
}

function buildPreviewSectionBlocks(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  narrative: AIGeneratedNarrativeSection | undefined
): ReportContentBlock[] {
  const copy = buildAssessmentSpecificSectionCopy(assessment);

  if (section.id === "pattern-summary") {
    return [
      {
        id: "pattern-summary-narrative",
        type: "paragraph",
        label: "Pattern summary",
        content: resultProfile.summaryNarrative
      },
      {
        id: "pattern-summary-signature",
        type: "callout",
        label: "Consistent pattern signature",
        content: buildPatternSignature(resultProfile)
      },
      {
        id: "pattern-summary-metrics",
        type: "signal_grid",
        label: "Strongest scored dimensions",
        metrics: buildDominantMetricBlocks(resultProfile)
      },
      {
        id: "pattern-summary-themes",
        type: "bullet_list",
        label: "Key themes in this result",
        items: uniqueItems(
          [
            ...resultProfile.dominantTendencies
              .slice(0, 2)
              .map((tendency) => tendency.description),
            resultProfile.patternClusters[0]?.description ?? ""
          ],
          3
        )
      },
      {
        id: "pattern-summary-cluster",
        type: "callout",
        label: "Interpretive note",
        content:
          resultProfile.patternClusters[0]?.description ??
          "The scored dimensions form a coherent pattern cluster rather than a random set of isolated signals."
      },
      {
        id: "pattern-summary-read",
        type: "paragraph",
        label: "What this pattern is beginning to suggest",
        visibility: "full_report_only",
        content: buildPatternRead(resultProfile)
      },
      {
        id: "pattern-summary-dominant",
        type: "bullet_list",
        label: "Behavioral themes the full report names more directly",
        visibility: "full_report_only",
        items: uniqueItems(
          [
            ...resultProfile.dominantTendencies
              .slice(0, 3)
              .map((tendency) => tendency.description),
            resultProfile.protectiveTendencies[0]?.description ?? ""
          ],
          4
        )
      },
      {
        id: "pattern-summary-preview-boundary",
        type: "callout",
        label: "Why the preview stops here",
        visibility: "full_report_only",
        content:
          "The preview is meant to establish that the pattern is coherent. The full report then shows where that pattern tends to intensify, how it behaves in real life, and where the hidden friction actually sits."
      }
    ];
  }

  if (section.id === "what-responses-suggest") {
    return [
      {
        id: "responses-suggest-intro",
        type: "paragraph",
        label: "Early interpretation",
        content: joinBodies(
          resultProfile.previewInsights.slice(0, 2).map((insight) => insight.body)
        )
      },
      ...(narrative ? buildNarrativeBlocks(section.id, narrative, "preview") : []),
      {
        id: "responses-suggest-dominant",
        type: "bullet_list",
        label: "Early tendency read",
        items: uniqueItems(
          resultProfile.dominantTendencies
            .slice(0, 2)
            .map((tendency) => tendency.description),
          2
        )
      },
      {
        id: "responses-suggest-full-context",
        type: "paragraph",
        label: "Deeper interpretation",
        visibility: "full_report_only",
        content: copy.interpretation
      },
      {
        id: "responses-suggest-contexts",
        type: "bullet_list",
        label: "Where the pattern may become more visible",
        visibility: "full_report_only",
        items: copy.interpretationContexts
      },
      {
        id: "responses-suggest-practical",
        type: "callout",
        label: "Practical meaning",
        visibility: "full_report_only",
        content:
          "This section moves the report from recognition into lived meaning, so the result can be understood in terms of relationships, decision making, emotional reactions, and self-evaluation rather than as a single label."
      },
      {
        id: "responses-suggest-protective",
        type: "callout",
        label: "Protective or stabilizing signal",
        visibility: "full_report_only",
        content:
          resultProfile.protectiveTendencies[0]?.description ??
          "A stabilizing signal is still visible in the pattern, even if it is not the loudest part of the result."
      }
    ];
  }

  return [
    {
      id: `${section.id}-related-intro`,
      type: "paragraph",
      label: "Why these next steps fit",
      content:
        copy.related
    },
    {
      id: `${section.id}-related-list`,
      type: "bullet_list",
      label: "Related insight opportunities",
      items: resultProfile.relatedRecommendations
        .filter((recommendation) => recommendation.slug !== "membership")
        .map((recommendation) => recommendation.reason)
    },
    {
      id: `${section.id}-bundle`,
      type: "callout",
      label: resultProfile.bundleSuggestion?.title ?? "Membership path",
      content:
        resultProfile.bundleSuggestion?.description ??
        assessment.subscriptionUpsellNote
    },
    {
      id: `${section.id}-membership`,
      type: "paragraph",
      label: "Full-report continuation",
      visibility: "full_report_only",
      content: resultProfile.membershipUpsell.description
    }
  ];
}

function buildPremiumSectionBlocks(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  narrative: AIGeneratedNarrativeSection | undefined
): ReportContentBlock[] {
  const copy = buildAssessmentSpecificSectionCopy(assessment);

  if (section.id === "emotional-drivers") {
    return [
      {
        id: "drivers-intro",
        type: "paragraph",
        label: "What appears to intensify the pattern",
        content: copy.drivers
      },
      {
        id: "drivers-pressure-read",
        type: "callout",
        label: "Pressure pattern",
        content: buildPressureNarrative(resultProfile)
      },
      {
        id: "drivers-metrics",
        type: "signal_grid",
        label: "Primary pressure markers",
        metrics: buildSectionMetrics(section.id, resultProfile)
      },
      ...(narrative ? buildNarrativeBlocks(section.id, narrative, "full") : []),
      {
        id: "drivers-pressure-points",
        type: "bullet_list",
        label: "Emotional pressure points",
        items: copy.pressurePoints
      },
      {
        id: "drivers-tensions",
        type: "callout",
        label: "Why this matters",
        content:
          resultProfile.frictionAreas[0]?.description ??
          "The emotional cost usually grows where the pattern becomes both personally activating and difficult to slow down."
      },
      {
        id: "drivers-readiness",
        type: "paragraph",
        label: "What this section is helping clarify",
        content:
          "The goal is not to overstate the result, but to show which situations and internal pressures seem to make the pattern more likely to take over."
      }
    ];
  }

  if (section.id === "daily-life-impact") {
    return [
      {
        id: "impact-intro",
        type: "paragraph",
        label: "How the pattern tends to show up",
        content: copy.impact
      },
      {
        id: "impact-response-read",
        type: "callout",
        label: "Response style",
        content: buildResponseNarrative(resultProfile)
      },
      {
        id: "impact-metrics",
        type: "signal_grid",
        label: "Behavioral emphasis",
        metrics: buildSectionMetrics(section.id, resultProfile)
      },
      ...(narrative ? buildNarrativeBlocks(section.id, narrative, "full") : []),
      {
        id: "impact-patterns",
        type: "bullet_list",
        label: "Response tendencies",
        items: copy.responseTendencies
      },
      {
        id: "impact-protective",
        type: "bullet_list",
        label: "Signals that may help stabilize the pattern",
        items: uniqueItems(
          resultProfile.protectiveTendencies
            .slice(0, 2)
            .map((area) => area.description),
          2
        )
      },
      {
        id: "impact-context-note",
        type: "paragraph",
        label: "Why this section matters",
        content:
          "A pattern becomes more actionable when it can be recognized in ordinary life. This section is meant to show how the response style may already be shaping interpretation, behavior, and relationships."
      }
    ];
  }

  if (section.id === "blind-spots-or-tension-areas") {
    return [
      {
        id: "blindspots-intro",
        type: "paragraph",
        label: "Where friction may be building",
        content: copy.blindSpots
      },
      {
        id: "blindspots-friction-read",
        type: "callout",
        label: "Friction read",
        content: buildFrictionNarrative(resultProfile)
      },
      ...(narrative ? buildNarrativeBlocks(section.id, narrative, "full") : []),
      {
        id: "blindspots-list",
        type: "bullet_list",
        label: "Hidden friction areas",
        items: uniqueItems(
          [
            ...copy.frictionPoints,
            ...resultProfile.frictionAreas
              .slice(0, 2)
              .map((area) => area.description)
          ],
          4
        )
      },
      {
        id: "blindspots-note",
        type: "callout",
        label: "Respectful reading",
        content:
          "These friction areas are meant to clarify where the pattern creates strain, not to act as a judgment about your character or intentions."
      },
      {
        id: "blindspots-why-hidden",
        type: "paragraph",
        label: "Why these areas can be hard to see",
        content:
          "Friction areas often stay hidden because they are built into familiar reactions, protective habits, or interpretations that have started to feel normal from the inside."
      }
    ];
  }

  if (section.id === "stability-suggestions") {
    return [
      {
        id: "stability-intro",
        type: "paragraph",
        label: "How to use this section",
        content: copy.stabilityIntro
      },
      {
        id: "stability-orientation",
        type: "callout",
        label: "Stability orientation",
        content: buildStabilityNarrative(resultProfile)
      },
      ...(narrative ? buildNarrativeBlocks(section.id, narrative, "full") : []),
      {
        id: "stability-list",
        type: "bullet_list",
        label: "Stability and clarity suggestions",
        items: copy.stability
      },
      {
        id: "stability-anchors",
        type: "bullet_list",
        label: "What to notice first",
        items: uniqueItems(
          resultProfile.protectiveTendencies
            .slice(0, 2)
            .map((tendency) => tendency.description),
          2
        )
      },
      {
        id: "stability-note",
        type: "paragraph",
        label: "How this guidance is meant to help",
        content:
          "These suggestions are meant to create more room, recognition, and steadiness around the pattern. They are not rigid rules or a demand to change everything at once."
      }
    ];
  }

  return narrative
    ? buildNarrativeBlocks(section.id, narrative, "full")
    : [
        {
          id: `${section.id}-premium-intro`,
          type: "paragraph",
          label: "Premium section",
          content:
            "This section is reserved for the full report and will later combine deterministic interpretation with AI-generated narrative depth."
        }
      ];
}

function buildSectionOverview(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  narrative: AIGeneratedNarrativeSection | undefined
) {
  if (narrative) {
    return narrative.synopsis;
  }

  const copy = buildAssessmentSpecificSectionCopy(assessment);

  switch (section.id) {
    case "pattern-summary":
      return resultProfile.summaryNarrative;
    case "what-responses-suggest":
      return buildAssessmentSpecificSectionCopy(assessment).interpretation;
    case "emotional-drivers":
      return copy.drivers;
    case "daily-life-impact":
      return copy.impact;
    case "blind-spots-or-tension-areas":
      return copy.blindSpots;
    case "stability-suggestions":
      return copy.stability[0] ?? "Practical stability guidance will be layered here.";
    case "related-next-insights":
      return resultProfile.bundleSuggestion?.description ?? assessment.subscriptionUpsellNote;
    default:
      return section.description;
  }
}

function buildPreviewTeaser(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  narrative: AIGeneratedNarrativeSection | undefined
) {
  if (section.access === "preview") {
    if (section.id === "pattern-summary") {
      return "The preview surfaces the clearest scored pattern, strongest dimensions, and the first interpretive signal.";
    }

    if (section.id === "what-responses-suggest") {
      return "The preview translates the pattern into an early read while holding back the fuller contextual interpretation.";
    }

    return narrative
      ? truncate(narrative.paragraphs[0] ?? narrative.synopsis)
      : "Visible in the pre-purchase report preview.";
  }

  if (narrative) {
    return truncate(narrative.callout ?? narrative.synopsis);
  }

  const copy = buildAssessmentSpecificSectionCopy(assessment);

  switch (section.id) {
    case "emotional-drivers":
      return "Explores the emotional pressure points and situations that appear to strengthen the pattern.";
    case "daily-life-impact":
      return "Shows how the pattern tends to appear in attention, behavior, relationships, or self-evaluation.";
    case "blind-spots-or-tension-areas":
      return "Highlights the subtler friction areas and interpretation traps that may be keeping the pattern active.";
    case "stability-suggestions":
      return "Offers reflective guidance for creating more steadiness and clarity once the full report is unlocked.";
    case "related-next-insights":
      return "Points to adjacent assessments that may help clarify connected patterns after this result.";
    default:
      return "Reserved for the paid report experience.";
  }
}

function composeSection(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  narrative: AIGeneratedNarrativeSection | undefined
): ComposedReportSection {
  const state = section.access === "preview" ? "visible" : "locked";
  const baseBlocks =
    section.access === "preview"
      ? buildPreviewSectionBlocks(section, assessment, resultProfile, narrative)
      : buildPremiumSectionBlocks(section, assessment, resultProfile, narrative);
  const blocks =
    section.generationMode === "deterministic" || narrative
      ? baseBlocks
      : [
          ...baseBlocks,
          createAiNarrativePlaceholderBlock(
            {
              id: section.id,
              title: section.title,
              description: section.description,
              sectionIntro: buildSectionIntro(section.id),
              access: section.access,
              state,
              generationMode: section.generationMode,
              formatStyle: formatStyleForSection(section.id),
              narrativeIntent: section.narrativeIntent,
              requiredDimensionKeys: section.requiredDimensionKeys,
              overview: "",
              previewTeaser: "",
              blocks: []
            },
            resultProfile
          )
        ];

  return {
    id: section.id,
    title: section.title,
    description: section.description,
    sectionIntro: buildSectionIntro(section.id),
    access: section.access,
    state,
    generationMode: section.generationMode,
    formatStyle: formatStyleForSection(section.id),
    narrativeIntent: section.narrativeIntent,
    requiredDimensionKeys: section.requiredDimensionKeys,
    overview: buildSectionOverview(section, assessment, resultProfile, narrative),
    previewTeaser: buildPreviewTeaser(section, assessment, resultProfile, narrative),
    blocks
  };
}

function buildAssemblyMeta(
  narrativeMode: PremiumReport["assemblyMeta"]["narrativeMode"],
  aiNarrativeSections: AIGeneratedNarrativeSection[]
) {
  return {
    engineName: "click2pro-ai-insight-engine",
    engineVersion: "v1-foundation",
    narrativeMode,
    generatedAt: new Date().toISOString(),
    narrativeSectionCount: aiNarrativeSections.length,
    validatedSectionCount: aiNarrativeSections.filter(
      (section) => section.status !== "validation_fallback"
    ).length,
    sectionGenerationMode: "sectional" as const,
    followUpReady: true,
    validationState: "ready" as const
  };
}

function buildPremiumReportFromNarrative(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  aiPayload: PremiumReport["aiPayload"],
  aiNarrativeSections: AIGeneratedNarrativeSection[],
  narrativeMode: PremiumReport["assemblyMeta"]["narrativeMode"]
): PremiumReport {
  const aiNarrativeLookup = Object.fromEntries(
    aiNarrativeSections.map((section) => [section.sectionId, section] as const)
  );
  const sections = assessment.reportBlueprint.sections.map((section) =>
    composeSection(
      section,
      assessment,
      resultProfile,
      aiNarrativeLookup[section.id]
    )
  );
  const visibleSections = sections.filter((section) => section.state === "visible");
  const lockedSections = sections.filter((section) => section.state === "locked");

  return {
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    title: assessment.reportBlueprint.title,
    subtitle: assessment.reportBlueprint.subtitle,
    summaryLabel: resultProfile.summaryLabel,
    summaryTitle: resultProfile.summaryTitle,
    summaryNarrative: resultProfile.summaryNarrative,
    previewInsights: resultProfile.previewInsights,
    dominantTendencies: resultProfile.dominantTendencies,
    protectiveTendencies: resultProfile.protectiveTendencies,
    frictionAreas: resultProfile.frictionAreas,
    patternClusters: resultProfile.patternClusters,
    sections,
    visibleSections,
    lockedSections,
    relatedRecommendations: resultProfile.relatedRecommendations,
    bundleSuggestion: resultProfile.bundleSuggestion,
    membershipUpsell: resultProfile.membershipUpsell,
    lockCtaLabel: assessment.reportBlueprint.lockCtaLabel,
    pdfOutline: {
      title: assessment.reportBlueprint.title,
      bookmarkTitles: sections.map((section) => section.title),
      plannedPageCount: Math.max(6, sections.length + 2)
    },
    aiPayload,
    aiNarrativeSections,
    subscriptionFollowUp: aiPayload.followUpBlueprint,
    assemblyMeta: buildAssemblyMeta(narrativeMode, aiNarrativeSections)
  };
}

export function assemblePremiumReport(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile
): PremiumReport {
  const aiEngine = runAIInsightEngineSync(assessment, resultProfile);

  return buildPremiumReportFromNarrative(
    assessment,
    resultProfile,
    aiEngine.payload,
    aiEngine.sections,
    "mock"
  );
}

export async function assemblePremiumReportWithProvider(
  provider: AIReportProvider,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile
): Promise<PremiumReport> {
  const aiEngine = await runAIInsightEngineWithProvider(
    provider,
    assessment,
    resultProfile
  );

  return buildPremiumReportFromNarrative(
    assessment,
    resultProfile,
    aiEngine.payload,
    aiEngine.sections,
    provider.mode
  );
}
