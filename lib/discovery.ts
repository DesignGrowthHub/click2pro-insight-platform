export type DiscoveryTheme = {
  slug: string;
  label: string;
  summary: string;
};

export type DiscoveryEntryPoint = {
  title: string;
  description: string;
  query: string;
  theme: string;
};

export const discoveryThemes: DiscoveryTheme[] = [
  {
    slug: "overthinking",
    label: "Overthinking",
    summary: "Mental loops, replaying interactions, and difficulty settling on a clear read."
  },
  {
    slug: "emotional-numbness",
    label: "Emotional numbness",
    summary: "Feeling flat, detached, or present on the surface but emotionally far away."
  },
  {
    slug: "toxic-relationships",
    label: "Toxic relationships",
    summary: "Patterns where confusion, dismissiveness, or self-doubt keep repeating."
  },
  {
    slug: "burnout",
    label: "Burnout",
    summary: "Pressure, depletion, and difficulty recovering even when you pause."
  },
  {
    slug: "self-doubt",
    label: "Self-doubt",
    summary: "Internal pressure, second-guessing, and difficulty trusting your own competence."
  },
  {
    slug: "attachment",
    label: "Attachment",
    summary: "Relationship intensity, reassurance sensitivity, and mixed-signal reactivity."
  },
  {
    slug: "identity-conflict",
    label: "Identity conflict",
    summary: "Feeling split between what fits, what is expected, and what still feels unresolved."
  },
  {
    slug: "motivation-loss",
    label: "Motivation loss",
    summary: "Low pull toward effort, reward, or forward movement."
  },
  {
    slug: "closure",
    label: "Closure",
    summary: "Staying mentally attached to what ended or never fully settled."
  },
  {
    slug: "stress-pressure",
    label: "Stress pressure",
    summary: "Persistent internal strain, performance load, or difficulty switching off."
  }
];

export const discoveryThemeLabels = discoveryThemes.map((theme) => theme.label);

export const discoverySearchExamples = [
  "why do I overthink everything",
  "why do I feel emotionally numb",
  "why do I doubt myself",
  "why do I feel stuck in relationships",
  "why can't I move on"
] as const;

export const featuredIssueEntryPoints: DiscoveryEntryPoint[] = [
  {
    title: "I keep replaying what happened",
    description:
      "A good place to start when a conversation, ending, or unresolved moment keeps returning to you.",
    query: "why can't I move on",
    theme: "Closure"
  },
  {
    title: "I doubt myself more than people realize",
    description:
      "Useful when competence and effort are present, but self-trust still feels unsteady.",
    query: "why do I doubt myself",
    theme: "Self-doubt"
  },
  {
    title: "I get pulled into relationship confusion",
    description:
      "Start here if mixed signals, attachment intensity, or unclear behavior keeps taking up mental space.",
    query: "why do I feel stuck in relationships",
    theme: "Attachment"
  },
  {
    title: "I feel flat even when life keeps moving",
    description:
      "Helpful when emotional range feels muted and motivation has become harder to access.",
    query: "why do I feel emotionally numb",
    theme: "Emotional numbness"
  },
  {
    title: "I am tired in a way that rest does not fully fix",
    description:
      "A useful entry point when pressure stays high and recovery feels incomplete.",
    query: "why am I always mentally tired",
    theme: "Burnout"
  },
  {
    title: "I keep analyzing things long after they happen",
    description:
      "Useful when thoughts keep circling and clarity feels close but never fully settles.",
    query: "why do I overthink everything",
    theme: "Overthinking"
  }
];

export const assessmentDiscoveryMetadata: Record<
  string,
  {
    problemTags: string[];
    issuePhrases: string[];
  }
> = {
  "condescending-behavior-decoder": {
    problemTags: ["Toxic relationships", "Self-doubt"],
    issuePhrases: [
      "why do I feel talked down to",
      "how do I know if someone is being condescending",
      "why do I leave conversations doubting myself",
      "why does their tone make me feel small",
      "am I overreacting or are they dismissive"
    ]
  },
  "imposter-syndrome-deep-report": {
    problemTags: ["Self-doubt", "Stress pressure", "Overthinking"],
    issuePhrases: [
      "why do I doubt myself",
      "why do I feel like a fraud",
      "why do I overprepare for everything",
      "why do compliments not feel believable",
      "why do I feel pressure to prove myself"
    ]
  },
  "relationship-infatuation-obsession-analysis": {
    problemTags: ["Attachment", "Overthinking", "Toxic relationships"],
    issuePhrases: [
      "why can't I stop thinking about them",
      "why do I get stuck in relationships",
      "why do mixed signals affect me so much",
      "why do I obsess over one person",
      "why is it hard to create distance"
    ]
  },
  "toxic-pattern-and-red-flag-report": {
    problemTags: ["Toxic relationships", "Attachment"],
    issuePhrases: [
      "why do I ignore red flags",
      "why do I stay in unhealthy dynamics",
      "why do I make excuses for harmful behavior",
      "why do I keep ending up in toxic relationships",
      "why is it hard to leave once I know something is wrong"
    ]
  },
  "emotional-detachment-nihilism-insight": {
    problemTags: ["Emotional numbness", "Identity conflict", "Motivation loss"],
    issuePhrases: [
      "why do I feel emotionally numb",
      "why does everything feel distant",
      "why do I feel disconnected from life",
      "why do I feel flat around people",
      "why does meaning feel harder to access"
    ]
  },
  "anhedonia-and-motivation-pattern-scan": {
    problemTags: ["Motivation loss", "Emotional numbness", "Stress pressure"],
    issuePhrases: [
      "why do I have no motivation",
      "why does nothing feel rewarding",
      "why is it hard to start anything",
      "why do I feel uninterested in things I used to care about",
      "why does effort feel heavier than it should"
    ]
  },
  "personality-burnout-and-stress-report": {
    problemTags: ["Burnout", "Stress pressure", "Overthinking"],
    issuePhrases: [
      "why am I always mentally tired",
      "why can't I recover from stress",
      "why do I feel burned out all the time",
      "why does rest not feel like enough",
      "why does pressure stay with me even after work"
    ]
  },
  "attachment-and-relationship-style-report": {
    problemTags: ["Attachment", "Toxic relationships", "Self-doubt"],
    issuePhrases: [
      "why do relationships make me anxious",
      "why do I need so much reassurance",
      "why do I pull away when things get close",
      "why do I react strongly to distance",
      "why do I struggle to feel secure in relationships"
    ]
  },
  "identity-and-inner-conflict-profile": {
    problemTags: ["Identity conflict", "Self-doubt", "Stress pressure"],
    issuePhrases: [
      "why do I feel torn about who I am",
      "why is it hard to trust my own direction",
      "why do I keep second-guessing major decisions",
      "why do I feel split between what I want and what is expected",
      "why does my sense of self feel unstable"
    ]
  },
  "closure-and-emotional-recovery-report": {
    problemTags: ["Closure", "Overthinking", "Attachment"],
    issuePhrases: [
      "why can't I move on",
      "why do I keep replaying the ending",
      "why am I still attached to what happened",
      "why does closure feel so difficult",
      "why do unresolved interactions stay with me"
    ]
  }
};

export function getAssessmentDiscoveryMetadata(slug: string) {
  return (
    assessmentDiscoveryMetadata[slug] ?? {
      problemTags: [],
      issuePhrases: []
    }
  );
}

export function getThemeSlugByLabel(label: string) {
  return discoveryThemes.find((theme) => theme.label === label)?.slug ?? null;
}

export function getThemeLabelBySlug(slug: string) {
  return discoveryThemes.find((theme) => theme.slug === slug)?.label ?? null;
}
