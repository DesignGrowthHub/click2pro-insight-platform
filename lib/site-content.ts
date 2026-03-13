import {
  membershipHomepageBenefits,
  membershipPlanCards
} from "@/lib/membership/content";

export const homepageHeroStrip = [
  "Private and confidential",
  "Structured behavioral pattern analysis",
  "Insight preview first, full report if useful",
  "Designed for reflection, not diagnosis"
];

export const homepageTrustBar = [
  {
    label: "Private by design",
    description: "Responses stay inside a private guided reflection flow."
  },
  {
    label: "Structured assessments",
    description: "Questions are organized to surface recurring behavioral and emotional patterns."
  },
  {
    label: "Calm interpretation",
    description: "The preview and report are written to feel readable, serious, and grounded."
  },
  {
    label: "Clear report path",
    description: "You see an insight preview first, then decide whether the deeper report is useful."
  }
] as const;

export const homepageRecognitionThemes = [
  {
    title: "Recurring relationship patterns",
    description:
      "You leave certain interactions feeling smaller, confused, overinvested, or unsure how much of what happened was real versus deniable."
  },
  {
    title: "Self-doubt despite competence",
    description:
      "You can function well, meet expectations, and still feel strangely unconvinced by your own competence from the inside."
  },
  {
    title: "Difficulty interpreting other people",
    description:
      "Someone's tone, distance, or mixed behavior affects you clearly, but not cleanly enough to stop the second-guessing."
  },
  {
    title: "Emotional loops that repeat",
    description:
      "Attention, hope, attachment, or tension keeps circling back before you have had the chance to understand what is actually holding it in place."
  }
];

export const homepageInsightProcess = [
  {
    step: "01",
    title: "Guided response prompts",
    description:
      "Questions surface emotional and behavioral signals around the topic that already feels active."
  },
  {
    step: "02",
    title: "Pattern analysis",
    description:
      "Responses are interpreted across structured behavioral dimensions so the strongest tendencies become easier to read."
  },
  {
    step: "03",
    title: "Insight report",
    description:
      "A structured preview highlights the clearest tendencies, tensions, and possible blind spots before the fuller report opens."
  }
];

export const homepageTrustPrinciples = [
  {
    title: "Behavioral patterns, not diagnoses",
    description:
      "The platform focuses on behavioral tendencies, emotional pressure, and relationship dynamics without making medical or therapeutic claims."
  },
  {
    title: "Structured reflection",
    description:
      "Questions are written to feel recognizable, emotionally precise, and psychologically literate rather than broad or entertainment-driven."
  },
  {
    title: "Calm, readable report design",
    description:
      "Reports are structured to feel readable, thoughtful, and substantial enough to justify purchase, not like a thin quiz result."
  },
  {
    title: "Privacy from the start",
    description:
      "The experience assumes users may be arriving from emotionally sensitive topics and want discretion from the start."
  }
];

export const homepageExamplePreview = {
  title: "What you see before deciding on the full report",
  summary:
    "The preview surfaces the clearest pattern first: enough to test whether the read feels accurate, while holding back the deeper interpretation, context, and stability guidance for the full report.",
  tendencies: [
    "Pattern interpretation: the clearest active signal",
    "Response tendency: how the pattern usually shows up",
    "Contextual reading: where the pattern becomes more active or costly"
  ],
  boundary:
    "The full report expands into deeper interpretation, emotional or contextual drivers, real-life pattern expression, hidden friction areas, and stabilizing suggestions."
};

export const homepageFaqItems = [
  {
    question: "Is this a psychological diagnosis?",
    answer:
      "No. The platform is built for behavioral pattern recognition, structured reflection, and clearer personal insight. It is not a diagnosis or treatment service."
  },
  {
    question: "How accurate are the insights?",
    answer:
      "The insights are only as useful as the fit between the questions, your responses, and the pattern that emerges. They are designed to feel recognizable and structured, not absolute."
  },
  {
    question: "How long does an assessment take?",
    answer:
      "Most assessments are designed to be completed in a few focused minutes while still producing a meaningful preview."
  },
  {
    question: "Are my responses private?",
    answer:
      "Yes. The platform is designed around private account ownership, saved report access, and calm handling of sensitive topics."
  },
  {
    question: "Who creates these assessments?",
    answer:
      "They are built as structured behavioral insight tools with careful question writing, scoring dimensions, and report logic designed to feel readable and grounded."
  },
  {
    question: "What does the report include?",
    answer:
      "The report expands beyond the preview into deeper interpretation, pressure points, response tendencies, hidden friction areas, and steadier clarity guidance."
  },
  {
    question: "Can I download my report?",
    answer:
      "Yes. Owned reports are designed to support later download and saved access through your dashboard library."
  },
  {
    question: "Can I retake an assessment later?",
    answer:
      "You can return to the platform later and continue exploring related topics or take the same assessment again when you want a fresh read."
  },
  {
    question: "How is my data used?",
    answer:
      "Your responses are used to prepare your preview, full report, saved library access, and delivery actions inside the platform. They are not meant to become a public profile."
  },
  {
    question: "Can this replace therapy?",
    answer:
      "No. The platform is for reflection and pattern recognition. It is not a replacement for therapy, diagnosis, crisis care, or professional treatment."
  }
] as const;

export { membershipHomepageBenefits, membershipPlanCards as pricingPlans };
