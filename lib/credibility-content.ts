export const methodologySteps = [
  {
    step: "01",
    title: "Answer structured behavioral questions",
    description:
      "Questions focus on recognizable reactions, habits, and relational patterns rather than broad personality labels or abstract theory."
  },
  {
    step: "02",
    title: "Score multiple response dimensions",
    description:
      "Responses contribute to multiple dimensions at once so the assessment can look at emphasis, intensity, and where tendencies begin to cluster."
  },
  {
    step: "03",
    title: "Interpret response combinations",
    description:
      "The structured insight approach looks for repeated tendencies across the full answer set instead of treating one item as decisive on its own."
  },
  {
    step: "04",
    title: "Generate a structured insight report",
    description:
      "The report organizes the scored pattern into interpretation, possible drivers, friction areas, and steadier perspectives for reflection."
  }
] as const;

export const patternAnalysisPoints = [
  "Behavioral pattern analysis across multiple scored dimensions",
  "Response tendency interpretation based on repeated signals rather than isolated answers",
  "Pattern interaction reading that accounts for how tendencies reinforce or complicate each other",
  "A structured insight approach that turns score combinations into readable interpretations"
] as const;

export const reportInterpretationPoints = [
  "Reflects the response pattern shown in this assessment, not a hidden diagnosis or fixed label",
  "Highlights tendencies, pressure areas, and likely interactions rather than making absolute claims",
  "Explores possible emotional or contextual drivers without overstating certainty",
  "Identifies friction areas and offers stabilizing perspectives for reflection and pattern recognition"
] as const;

export const limitationsPoints = [
  "This report is not a clinical diagnosis or treatment tool.",
  "It is designed for self-reflection, behavioral pattern recognition, and clearer interpretation.",
  "The insights describe current response tendencies, not fixed truths about who you are."
] as const;
