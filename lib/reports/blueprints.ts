import type {
  PreviewSectionDefinition,
  ReportBlueprint,
  ReportSectionDefinition
} from "@/lib/types/assessment-domain";

type ReportBlueprintConfig = {
  assessmentSlug: string;
  title: string;
  subtitle: string;
  previewPromises: PreviewSectionDefinition[];
  sectionTitles?: Partial<Record<BaseReportSectionKey, string>>;
  sectionDescriptions?: Partial<Record<BaseReportSectionKey, string>>;
};

type BaseReportSectionKey =
  | "patternSummary"
  | "whatResponsesSuggest"
  | "emotionalDrivers"
  | "dailyLifeImpact"
  | "blindSpots"
  | "stabilitySuggestions"
  | "relatedInsights";

function section(
  id: string,
  title: string,
  description: string,
  access: "preview" | "premium",
  generationMode: "deterministic" | "ai_ready" | "hybrid",
  requiredDimensionKeys: string[],
  narrativeIntent: string,
  placeholderFocus: string[]
): ReportSectionDefinition {
  return {
    id,
    title,
    description,
    access,
    generationMode,
    requiredDimensionKeys,
    narrativeIntent,
    placeholderFocus
  };
}

export function createStandardReportBlueprint({
  assessmentSlug,
  title,
  subtitle,
  previewPromises,
  sectionTitles = {},
  sectionDescriptions = {}
}: ReportBlueprintConfig): ReportBlueprint {
  const sections = [
    section(
      "pattern-summary",
      sectionTitles.patternSummary ?? "Pattern Summary",
      sectionDescriptions.patternSummary ??
        "Deterministic summary of the dominant pattern and overall intensity band.",
      "preview",
      "deterministic",
      [],
      "Summarize the clearest deterministic pattern emerging from the responses.",
      ["dominant dimension", "intensity band", "short summary statement"]
    ),
    section(
      "what-responses-suggest",
      sectionTitles.whatResponsesSuggest ?? "What Your Responses Suggest",
      sectionDescriptions.whatResponsesSuggest ??
        "Early interpretation of the strongest tendencies visible before payment.",
      "preview",
      "hybrid",
      [],
      "Translate scores into plain-English implications without overclaiming.",
      ["plain-English interpretation", "key tendencies", "preview-safe takeaway"]
    ),
    section(
      "emotional-drivers",
      sectionTitles.emotionalDrivers ?? "Emotional Drivers",
      sectionDescriptions.emotionalDrivers ??
        "Premium section for the emotional mechanics reinforcing the pattern.",
      "premium",
      "ai_ready",
      [],
      "Explain the likely emotional mechanics, sensitivities, or reinforcement loops.",
      ["drivers", "emotional mechanics", "reinforcement loops"]
    ),
    section(
      "daily-life-impact",
      sectionTitles.dailyLifeImpact ?? "Relationship / Work / Daily-Life Impact",
      sectionDescriptions.dailyLifeImpact ??
        "Premium section translating the pattern into real-life effects.",
      "premium",
      "ai_ready",
      [],
      "Translate the pattern into recognizable life effects across daily contexts.",
      ["work impact", "relationship impact", "everyday friction"]
    ),
    section(
      "blind-spots-or-tension-areas",
      sectionTitles.blindSpots ?? "Blind Spots or Tension Areas",
      sectionDescriptions.blindSpots ??
        "Premium section for contradictions, deniability, or self-protective blind spots.",
      "premium",
      "hybrid",
      [],
      "Surface contradictions, blind spots, or tension areas that complicate the pattern.",
      ["tension area", "contradiction", "self-protection pattern"]
    ),
    section(
      "stability-suggestions",
      sectionTitles.stabilitySuggestions ?? "Stability Suggestions",
      sectionDescriptions.stabilitySuggestions ??
        "Premium section for calm next-step guidance and stabilizing actions.",
      "premium",
      "ai_ready",
      [],
      "Offer grounded, non-clinical next-step guidance that supports stability.",
      ["stability suggestions", "grounded next step", "self-protection action"]
    ),
    section(
      "related-next-insights",
      sectionTitles.relatedInsights ?? "Related Next Insights",
      sectionDescriptions.relatedInsights ??
        "Cross-sell and subscription-ready next steps based on adjacent patterns.",
      "preview",
      "deterministic",
      [],
      "Recommend adjacent assessments or bundles based on the current topic and scores.",
      ["related assessments", "bundle path", "membership path"]
    )
  ];

  return {
    id: `${assessmentSlug}-report-blueprint`,
    assessmentSlug,
    title,
    subtitle,
    previewSections: previewPromises,
    sections,
    lockCtaLabel: "Unlock Full Report"
  };
}
