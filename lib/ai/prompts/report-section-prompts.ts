import { getAssessmentPromptContext } from "@/lib/ai/prompts/assessment-contexts";
import type {
  AIInsightSectionPlan,
  AIReportInputPayload,
  AIReportNarrativeRequest,
  AIReportPromptBundle,
  AIReportToneGuardrails,
  AISectionPromptTemplate
} from "@/lib/types/assessment-domain";

const baseGuardrails: AIReportToneGuardrails = {
  voice:
    "Write like a premium behavioral insight report: calm, serious, emotionally precise, readable, and non-clinical.",
  include: [
    "Use plain English for a US reader.",
    "Keep the writing reflective, specific, and psychologically intelligent.",
    "Translate scored patterns into recognizable lived behavior.",
    "Stay grounded in the deterministic scoring profile rather than inventing unsupported detail.",
    "Make the interpretation feel substantial enough for a paid report."
  ],
  avoid: [
    "Do not diagnose or imply a mental disorder.",
    "Do not use therapist, treatment, or crisis language.",
    "Do not fabricate research validation, statistics, or scientific certainty.",
    "Do not use hype, self-help cliches, or motivational fluff.",
    "Do not create manipulative urgency or fear-heavy framing."
  ],
  uncertaintyStyle: [
    "Use bounded phrasing such as appears, suggests, may, tends to, or often.",
    "Keep the report tied to response patterns, not universal truths.",
    "Name tensions respectfully and avoid absolute conclusions."
  ]
};

function formatDimensionSnapshot(payload: AIReportInputPayload) {
  return payload.dimensionSnapshot
    .map(
      (dimension) =>
        `${dimension.label}: ${dimension.normalizedScore}% (${dimension.band}) - ${dimension.interpretation}`
    )
    .join("\n");
}

function formatRequestFocus(request: AIReportNarrativeRequest) {
  return request.promptFocus.map((item) => `- ${item}`).join("\n");
}

function formatOutputContract(plan: AIInsightSectionPlan) {
  return [
    `- Synopsis sentence required: ${plan.outputContract.synopsisRequired ? "yes" : "no"}`,
    `- Paragraph range: ${plan.outputContract.paragraphRange.min}-${plan.outputContract.paragraphRange.max}`,
    `- Bullet range: ${plan.outputContract.bulletRange.min}-${plan.outputContract.bulletRange.max}`,
    `- Optional callout allowed: ${plan.outputContract.calloutOptional ? "yes" : "no"}`,
    `- Required structured fields: ${plan.outputContract.requiredFields.join(", ")}`
  ];
}

function buildSectionPromptInstructions(
  template: AISectionPromptTemplate
) {
  switch (template) {
    case "pattern_summary":
      return [
        "Summarize the clearest behavioral pattern emerging from the scored result.",
        "Keep the section oriented around coherence, signature, and why the pattern appears consistent.",
        "This section should establish the main mechanism rather than retelling every downstream consequence."
      ];
    case "pattern_interpretation":
      return [
        "Explain what the scored pattern means in practical life contexts.",
        "Connect internal tendencies to relationships, decisions, or everyday interpretation.",
        "This section should explain the mechanism, not drift into stabilizing advice."
      ];
    case "real_life_expression":
      return [
        "Translate the pattern into what it may look like in real life.",
        "Focus on recognizable behaviors, reactions, and outward effects.",
        "This section should emphasize outward and lived expression, not the hidden mechanism alone."
      ];
    case "emotional_pressure_points":
      return [
        "Explain the situations, triggers, or emotional conditions that intensify the pattern.",
        "Keep the pressure framing specific but non-clinical.",
        "This section should focus on intensifiers and internal load, not general summary."
      ];
    case "hidden_friction_areas":
      return [
        "Surface contradictions, blind spots, or quiet loops that make the pattern harder to resolve.",
        "Describe tension respectfully and without judgment.",
        "This section should surface hidden friction, not repeat the pattern summary."
      ];
    case "stability_and_clarity":
      return [
        "Offer reflective guidance that helps slow the loop and create steadier interpretation.",
        "Avoid rigid advice; focus on stabilization, pacing, and clarity.",
        "This section should identify stabilizing direction without sounding like coaching or therapy."
      ];
    case "related_insight_recommendations":
      return [
        "Recommend adjacent insights that logically deepen or widen the current pattern map.",
        "Explain why each suggestion fits rather than sounding like generic upsell."
      ];
    default:
      return [
        "Translate the scored profile into a premium, readable report section.",
        "Keep the section coherent, specific, and bounded to the assessment result."
      ];
  }
}

function getSectionRole(template: AISectionPromptTemplate) {
  switch (template) {
    case "pattern_summary":
      return "Establish the primary pattern signature and why the scored result forms a coherent loop.";
    case "pattern_interpretation":
      return "Explain the core mechanism and what the scored pattern means beneath the surface.";
    case "real_life_expression":
      return "Translate the pattern into daily-life expression, visible behavior, and recognizable response style.";
    case "emotional_pressure_points":
      return "Explain what emotionally intensifies the pattern and why pressure rises when it does.";
    case "hidden_friction_areas":
      return "Name the contradictions, blind spots, and self-reinforcing tension points that keep the loop active.";
    case "stability_and_clarity":
      return "Offer the most grounded stabilizing direction without drifting into coaching, therapy, or generic advice.";
    case "related_insight_recommendations":
      return "Recommend adjacent reports only where they logically extend the current scored pattern.";
    default:
      return "Interpret the scored section with a calm, specific, premium narrative voice.";
  }
}

function getRoleBoundaries(template: AISectionPromptTemplate) {
  switch (template) {
    case "pattern_summary":
      return [
        "Do not spend most of the section on practical advice.",
        "Do not over-explain daily-life behaviors that belong in later sections."
      ];
    case "pattern_interpretation":
      return [
        "Do not turn this into a generic summary of all signals.",
        "Do not spend most of the section on trigger lists or stabilizing guidance."
      ];
    case "real_life_expression":
      return [
        "Do not re-explain the same mechanism language used in the core pattern section.",
        "Keep the section anchored in lived expression, reactions, and visible effects."
      ];
    case "emotional_pressure_points":
      return [
        "Do not simply repeat the top dimensions without showing what intensifies them.",
        "Keep the focus on triggers, pressure, and intensification."
      ];
    case "hidden_friction_areas":
      return [
        "Do not collapse the section into broad summary or motivational language.",
        "Name hidden contradictions, misread cues, or loops that quietly sustain the pattern."
      ];
    case "stability_and_clarity":
      return [
        "Do not sound like a coach, therapist, or treatment plan.",
        "Do not repeat the whole report summary before offering stabilizing direction."
      ];
    case "related_insight_recommendations":
      return [
        "Do not sound like generic upsell copy.",
        "Tie each recommendation directly back to a visible scored pattern."
      ];
    default:
      return ["Keep the section distinct from adjacent chapters."];
  }
}

function buildGroundingSignals(
  payload: AIReportInputPayload,
  request: AIReportNarrativeRequest
) {
  const required = payload.dimensionSnapshot.filter((dimension) =>
    request.requiredDimensionKeys.includes(dimension.key)
  );
  const primaryDimensions =
    required.length > 0 ? required.slice(0, 3) : payload.dimensionSnapshot.slice(0, 3);

  return primaryDimensions.map(
    (dimension) =>
      `${dimension.label} at ${dimension.normalizedScore}% (${dimension.band})`
  );
}

function buildGroundingEvidence(
  payload: AIReportInputPayload,
  request: AIReportNarrativeRequest
) {
  return [
    request.anchorSummary,
    ...payload.previewInsights.slice(0, 2).map((insight) => insight.title),
    ...payload.dominantTendencies.slice(0, 2).map((item) => item.label),
    ...payload.tensionAreas.slice(0, 2).map((item) => item.label),
    ...payload.patternClusters.slice(0, 1).map((item) => item.label),
    ...(payload.contextMarkers.length
      ? [`Context markers: ${payload.contextMarkers.join(", ")}`]
      : [])
  ].filter(Boolean);
}

function getSectionPlan(
  payload: AIReportInputPayload,
  sectionId: string
) {
  return payload.sectionGenerationPlan.find((plan) => plan.sectionId === sectionId);
}

export function buildAIInsightSafetyGuardrails() {
  return baseGuardrails;
}

export function buildReportSystemPrompt(payload: AIReportInputPayload) {
  const context = getAssessmentPromptContext(payload.assessmentSlug);

  return [
    "You are writing a premium behavioral insight report section.",
    `Source of truth: ${payload.sourceOfTruth.replace(/_/g, " ")}.`,
    `AI role: ${payload.aiRole.replace(/_/g, " ")}.`,
    `Assessment lens: ${context.interpretiveLens}`,
    `Subscriber value frame: ${context.subscriberValueFrame}`,
    "Tone requirements:",
    ...payload.toneRequirements.map((item) => `- ${item}`),
    "Safety instructions:",
    ...payload.safetyInstructions.map((item) => `- ${item}`),
    "Required guardrails:",
    ...baseGuardrails.include.map((item) => `- ${item}`),
    ...baseGuardrails.avoid.map((item) => `- ${item}`),
    ...baseGuardrails.uncertaintyStyle.map((item) => `- ${item}`)
  ].join("\n");
}

export function buildReportSectionPromptBundle(
  payload: AIReportInputPayload,
  request: AIReportNarrativeRequest,
  previousSectionSummaries: string[] = []
): AIReportPromptBundle {
  const context = getAssessmentPromptContext(payload.assessmentSlug);
  const plan = getSectionPlan(payload, request.sectionId);
  const sectionNotes = context.sectionInstructions[request.sectionId] ?? [];
  const templateInstructions = buildSectionPromptInstructions(
    plan?.template ?? "pattern_interpretation"
  );
  const sectionRole = getSectionRole(plan?.template ?? "pattern_interpretation");
  const roleBoundaries = getRoleBoundaries(plan?.template ?? "pattern_interpretation");
  const groundingSignals = buildGroundingSignals(payload, request);
  const groundingEvidence = buildGroundingEvidence(payload, request);
  const expectedStructuredFields =
    plan?.outputContract.requiredFields ?? [
      "synopsis",
      "main_mechanism",
      "real_world_expression",
      "interpretation",
      "watch_for",
      "action_focus"
    ];

  const userPrompt = [
    `Write the report section "${request.title}" for the assessment "${payload.assessmentTitle}".`,
    `Section intent: ${request.intent}`,
    `Section role: ${sectionRole}`,
    `Target word range: ${request.requestedWordRange.min}-${request.requestedWordRange.max} words.`,
    `Result summary: ${payload.resultSummary.narrative}`,
    `Preview insight summary: ${payload.previewInsightSummary}`,
    `Dominant dimensions: ${request.dominantDimensionLabels.join(", ") || "Use the strongest visible signals."}`,
    `Dominant tendencies: ${
      payload.dominantTendencies.map((item) => item.label).join(", ") || "Not strongly differentiated."
    }`,
    `Tension areas: ${
      payload.tensionAreas.map((item) => item.label).join(", ") || "Keep the interpretation bounded to the scored pattern."
    }`,
    `Stabilizing tendencies: ${
      payload.stabilizingTendencies.map((item) => item.label).join(", ") ||
      "No clear stabilizing tendency was dominant."
    }`,
    `Intensity signal: ${request.intensitySignal}`,
    `Anchor summary: ${request.anchorSummary}`,
    payload.contextMarkers.length
      ? `Context markers: ${payload.contextMarkers.join(", ")}`
      : "Context markers: none surfaced strongly enough to list.",
    "Grounding signals to name explicitly:",
    ...groundingSignals.map((item) => `- ${item}`),
    "Grounding evidence to translate into meaning:",
    ...groundingEvidence.map((item) => `- ${item}`),
    "Dimension snapshot:",
    formatDimensionSnapshot(payload),
    "Prompt focus:",
    formatRequestFocus(request),
    "Context priorities:",
    ...context.contextPriorities.map((item) => `- ${item}`),
    "Section instructions:",
    ...templateInstructions.map((item) => `- ${item}`),
    "Role boundaries:",
    ...roleBoundaries.map((item) => `- ${item}`),
    ...(sectionNotes.length
      ? ["Assessment-specific notes:", ...sectionNotes.map((item) => `- ${item}`)]
      : ["Assessment-specific notes:", "- No extra notes for this section."]),
    ...(previousSectionSummaries.length
      ? [
          "Avoid repeating these already-covered section ideas:",
          ...previousSectionSummaries.map((item) => `- ${item}`)
        ]
      : ["Avoid repeating these already-covered section ideas:", "- No prior sections yet."]),
    `Related insight frame: ${context.relatedInsightFrame}`,
    "Output contract:",
    ...(plan ? formatOutputContract(plan) : ["- Follow the requested word range and keep a clear synopsis."]),
    "Output shape:",
    ...expectedStructuredFields.map((field) => `- ${field}`),
    "Requirements:",
    "- Explicitly reference at least two grounding signals or evidence anchors.",
    "- Explain why the pattern appears coherent in this section instead of speaking in broad generic terms.",
    "- Keep phrasing bounded but not vague; avoid filler like repetitive may/tends-to language without explanation.",
    "- Make this section distinct from earlier ones.",
    "The finished section should read like a thoughtful human interpretation, not chatbot prose."
  ].join("\n");

  return {
    sectionId: request.sectionId,
    title: request.title,
    template: plan?.template ?? "pattern_interpretation",
    sectionRole,
    systemPrompt: buildReportSystemPrompt(payload),
    userPrompt,
    validationChecklist:
      plan?.validationFocus ?? [
        "Avoid diagnosis, treatment, and therapist language.",
        "Keep claims bounded to the scored pattern.",
        "Make the section readable and emotionally precise."
      ],
    outputContract: plan
      ? formatOutputContract(plan)
      : [
          "Synopsis sentence required.",
          "Two or three paragraphs.",
          "Two to four bullets when useful.",
          "Optional short callout."
        ],
    groundingSignals,
    groundingEvidence,
    roleBoundaries,
    expectedStructuredFields
  };
}
