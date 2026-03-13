import type { AIGeneratedNarrativeSection } from "@/lib/types/assessment-domain";

const unsafeNarrativePatterns = [
  /\bdiagnos(?:e|is|ed)\b/i,
  /\bdisorder\b/i,
  /\btherap(?:y|ist)\b/i,
  /\bcrisis\b/i,
  /\bmedical\b/i,
  /\btreatment\b/i,
  /\bclinically proven\b/i
];

function hasUnsafeNarrative(section: AIGeneratedNarrativeSection) {
  const combined = [section.synopsis, ...section.paragraphs, ...section.bullets, section.callout]
    .filter(Boolean)
    .join(" ");

  return unsafeNarrativePatterns.some((pattern) => pattern.test(combined));
}

function hasMinimumShape(section: AIGeneratedNarrativeSection) {
  return Boolean(section.synopsis.trim()) && section.paragraphs.length > 0;
}

function normalizeForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values.map((item) => item.trim()).filter(Boolean)) {
    const normalized = normalizeForComparison(value);

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    results.push(value);
  }

  return results;
}

function hasGroundingReference(section: AIGeneratedNarrativeSection) {
  const combined = normalizeForComparison(
    [section.synopsis, ...section.paragraphs, ...section.bullets, section.callout]
      .filter(Boolean)
      .join(" ")
  );
  const candidates = [
    ...section.promptBundle.groundingSignals,
    ...section.promptBundle.groundingEvidence
  ]
    .map((item) => normalizeForComparison(item))
    .filter(Boolean)
    .map((item) => {
      const percentIndex = item.indexOf(" at ");
      return percentIndex > 0 ? item.slice(0, percentIndex) : item;
    });

  return candidates.some((candidate) => candidate.length >= 6 && combined.includes(candidate));
}

const genericNarrativePatterns = [
  /\bit may show up\b/gi,
  /\bit may look like\b/gi,
  /\bit can feel like\b/gi,
  /\boften shows up\b/gi,
  /\btends to show up\b/gi,
  /\bin practical terms\b/gi,
  /\bwhat makes this pattern harder\b/gi
];

function isTooGeneric(section: AIGeneratedNarrativeSection) {
  const combined = [section.synopsis, ...section.paragraphs].join(" ");
  const matches = genericNarrativePatterns.reduce(
    (count, pattern) => count + (combined.match(pattern)?.length ?? 0),
    0
  );

  return matches >= 3 && !hasGroundingReference(section);
}

function repeatsPriorSections(
  section: AIGeneratedNarrativeSection,
  previousSections: AIGeneratedNarrativeSection[]
) {
  const currentUnits = [
    section.synopsis,
    ...section.paragraphs,
    ...section.bullets
  ].map(normalizeForComparison);
  const priorUnits = new Set(
    previousSections.flatMap((item) =>
      [item.synopsis, ...item.paragraphs, ...item.bullets].map(normalizeForComparison)
    )
  );

  const duplicates = currentUnits.filter((unit) => unit.length > 40 && priorUnits.has(unit));
  return duplicates.length >= 2;
}

export function sanitizeNarrativeSection(
  section: AIGeneratedNarrativeSection,
  previousSections: AIGeneratedNarrativeSection[] = []
): AIGeneratedNarrativeSection {
  const normalizedSection: AIGeneratedNarrativeSection = {
    ...section,
    paragraphs: dedupeStrings(section.paragraphs),
    bullets: dedupeStrings(section.bullets),
    callout: section.callout?.trim() || undefined
  };

  if (hasUnsafeNarrative(normalizedSection)) {
    return {
      ...normalizedSection,
      status: "validation_fallback",
      synopsis:
        "This section remains ready for personalized interpretation, but the narrative was reduced to keep the tone non-clinical and bounded.",
      paragraphs: [
        "The report layer is designed to stay interpretive rather than diagnostic. When live generation is connected, the response will still be validated against calm, non-clinical guardrails before it is shown."
      ],
      bullets: [
        "Keep the interpretation tied to scored patterns.",
        "Avoid false certainty or clinical labeling.",
        "Preserve a calm premium tone."
      ],
      callout: "Validation fallback applied.",
      validationNotes: [...normalizedSection.validationNotes, "Unsafe wording was filtered."]
    };
  }

  if (!hasGroundingReference(normalizedSection)) {
    return {
      ...normalizedSection,
      status: "validation_fallback",
      synopsis:
        "This section was reduced because the generated narrative did not stay grounded in the scored evidence strongly enough.",
      paragraphs: [
        "Saved report sections must anchor themselves in the strongest scored dimensions, tendencies, or tension areas. When that grounding is missing, the section is held back instead of saving broad generic interpretation."
      ],
      bullets: [
        "Explicitly reference the strongest scored signals.",
        "Tie interpretation to the section anchor and evidence bundle.",
        "Avoid broad filler language without named pattern support."
      ],
      callout: "Grounding validation fallback applied.",
      validationNotes: [
        ...normalizedSection.validationNotes,
        "Narrative did not reference the expected grounding signals strongly enough."
      ]
    };
  }

  if (isTooGeneric(normalizedSection)) {
    return {
      ...normalizedSection,
      status: "validation_fallback",
      synopsis:
        "This section was reduced because the generated narrative remained too generic for a paid report section.",
      paragraphs: [
        "The report narrative is expected to sound specific to the scored pattern rather than reusable across many different results. When a section stays too broad, the system prefers a bounded fallback over saving generic prose."
      ],
      bullets: [
        "Name the strongest scored pattern directly.",
        "Explain why this section matters in profile-specific terms.",
        "Reduce vague may or tends-to filler phrasing."
      ],
      callout: "Specificity validation fallback applied.",
      validationNotes: [
        ...normalizedSection.validationNotes,
        "Narrative was too generic relative to the scored profile."
      ]
    };
  }

  if (repeatsPriorSections(normalizedSection, previousSections)) {
    return {
      ...normalizedSection,
      status: "validation_fallback",
      synopsis:
        "This section was reduced because it repeated too much language from earlier sections.",
      paragraphs: [
        "Each paid report chapter is expected to add a distinct layer of interpretation. When a section repeats earlier wording too closely, it is held back so it can be regenerated with clearer section separation."
      ],
      bullets: [
        "Keep section roles distinct.",
        "Avoid repeating prior section phrasing.",
        "Translate the next layer of the pattern instead of restating the same reading."
      ],
      callout: "Repetition validation fallback applied.",
      validationNotes: [
        ...normalizedSection.validationNotes,
        "Narrative repeated too much earlier section language."
      ]
    };
  }

  if (hasMinimumShape(normalizedSection)) {
    return normalizedSection;
  }

  return {
    ...normalizedSection,
    status: "validation_fallback",
    synopsis:
      "This section is structurally ready, but the generated response did not meet the minimum output shape.",
    paragraphs: [
      "A future live provider should retry this section with the same prompt bundle until it returns a complete synopsis and narrative body."
    ],
    bullets: [
      "Synopsis is required.",
      "At least one narrative paragraph is required.",
      "The final section should still follow the prompt guardrails."
    ],
    callout: "Shape validation fallback applied.",
    validationNotes: [
      ...normalizedSection.validationNotes,
      "Output shape validation fallback applied."
    ]
  };
}
