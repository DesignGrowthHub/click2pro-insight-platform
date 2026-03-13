import { getAssessmentDefinitionBySlug } from "@/lib/assessments";

export type IssuePageFaqItem = {
  question: string;
  answer: string;
};

export type IssuePageReflection = {
  initials: string;
  label: string;
  quote: string;
};

export type IssuePageHeroImageType = "abstract_pattern" | "soft_gradient" | "none";

export type IssuePageContent = {
  slug: string;
  publicTopicTitle: string;
  publicTopicSubtitle: string;
  heroCtaLabel: string;
  heroTrustNote: string;
  heroImageType: IssuePageHeroImageType;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  reassuranceTitle: string;
  reassuranceBody: string;
  reflections: IssuePageReflection[];
  clarifiesTitle: string;
  clarifiesItems: string[];
  whatYouGetTitle?: string;
  whatYouGetItems?: string[];
  faqTitle: string;
  faqItems: IssuePageFaqItem[];
  finalCtaTitle?: string;
  finalCtaBody?: string;
  finalCtaLabel?: string;
  linkedAssessmentSlug: string;
  seoTitle: string;
  metaDescription: string;
};

export const issuePages: IssuePageContent[] = [
  {
    slug: "self-doubt-pattern",
    publicTopicTitle: "Why do I keep doubting myself even when I seem capable on the outside?",
    publicTopicSubtitle:
      "If you keep overchecking, shrinking your own progress, or feeling like you need more proof before trusting yourself, this page is meant to help you start in the right place.",
    heroCtaLabel: "Start Assessment",
    heroTrustNote:
      "Private, structured, and usually finished in a few focused minutes.",
    heroImageType: "abstract_pattern",
    heroImageUrl: null,
    heroImageAlt: "Abstract layered pattern suggesting reflection and mental clarity",
    reassuranceTitle: "If this feels familiar but hard to explain, that is normal.",
    reassuranceBody:
      "A lot of people do not arrive with a clean label. They just know they keep second-guessing themselves, overworking to feel safe, or needing more proof than other people seem to need. The assessment helps organize that pattern into something clearer while it still feels familiar.",
    reflections: [
      {
        initials: "A.R.",
        label: "A.R. · Austin, US",
        quote:
          "I kept telling myself I just needed to push a little harder, but the real issue was how quickly I stopped trusting my own read."
      },
      {
        initials: "N.K.",
        label: "N.K. · London, UK",
        quote:
          "What felt familiar was the private part of it. Other people saw someone competent. I mostly felt like someone one mistake away from being found out."
      },
      {
        initials: "S.M.",
        label: "S.M. · Mumbai, India",
        quote:
          "The pressure was not loud. It was constant. I kept working past the point of enough because I did not fully believe my first effort could be trusted."
      },
      {
        initials: "J.L.",
        label: "J.L. · Seattle, US",
        quote:
          "I could finish something well and still feel more focused on what I might have missed than on what I had done right."
      },
      {
        initials: "P.T.",
        label: "P.T. · Manchester, UK",
        quote:
          "The hardest part was how normal it had started to feel. I was used to doubting myself, so I barely noticed how much energy it was taking."
      },
      {
        initials: "R.D.",
        label: "R.D. · Delhi, India",
        quote:
          "I thought the problem was confidence in a general sense. What felt more true was the constant need to prove I deserved to be where I already was."
      },
      {
        initials: "M.C.",
        label: "M.C. · Chicago, US",
        quote:
          "I did not need more generic encouragement. I needed something that could show me why praise never seemed to land for more than a few minutes."
      },
      {
        initials: "E.H.",
        label: "E.H. · Bristol, UK",
        quote:
          "The pattern was less dramatic than I expected. It was mostly the quiet loop of checking, comparing, and never quite feeling finished."
      },
      {
        initials: "K.V.",
        label: "K.V. · Bengaluru, India",
        quote:
          "What stood out was how much of my day was shaped by trying to avoid being seen as less capable than people assumed I was."
      },
      {
        initials: "T.W.",
        label: "T.W. · Denver, US",
        quote:
          "It helped to see that the pattern had structure. Until then it just felt like a personal flaw I kept trying to outrun."
      }
    ],
    clarifiesTitle: "What this helps clarify",
    clarifiesItems: [
      "Whether the pressure is showing up more as fear of being exposed, comparison with other people, or the need to get everything exactly right",
      "Why praise or positive feedback may still not feel strong enough to settle the doubt underneath",
      "How the pattern may be draining energy in work, decisions, and the way you read your own mistakes",
      "Whether the deeper report is likely to give you a more useful read on what keeps repeating"
    ],
    whatYouGetTitle: "What you get",
    whatYouGetItems: [
      "A structured preview of the strongest pattern signals in your responses",
      "A direct path into the deeper saved report if the topic feels accurate"
    ],
    faqTitle: "Questions people usually have before starting",
    faqItems: [
      {
        question: "How do I know this is the right place to start?",
        answer:
          "If self-doubt keeps showing up as overchecking, comparison, pressure to prove yourself, or difficulty trusting your own read, this is likely a strong starting point."
      },
      {
        question: "What will the preview actually tell me?",
        answer:
          "The preview shows the clearest pattern signals in your responses so you can decide quickly whether the deeper report feels accurate enough to matter."
      },
      {
        question: "When does the full report become worth opening?",
        answer:
          "Usually when the preview already feels specific enough that you want the deeper interpretation behind it, not just a surface-level result."
      },
      {
        question: "How long does the assessment take?",
        answer:
          "Most people finish in a few focused minutes. It is meant to be brief enough to complete in one sitting."
      },
      {
        question: "Do I need to be completely sure before I start?",
        answer:
          "No. You can start from the feeling itself. The assessment is designed to help make the pattern easier to name."
      },
      {
        question: "What does the full report add beyond the preview?",
        answer:
          "The full report goes further into interpretation, emotional pressure points, recurring response tendencies, hidden friction, and what may help you read yourself more steadily."
      },
      {
        question: "Is this still useful if I function well on the outside?",
        answer:
          "Yes. This issue often matters most when you look capable to other people but still carry too much private uncertainty on the inside."
      },
      {
        question: "Are my responses private?",
        answer:
          "Yes. The flow is built as a private guided reflection experience, and purchased reports stay in your account library."
      },
      {
        question: "Can I return to the report later?",
        answer:
          "Yes. Purchased reports are saved to your dashboard and support later reopening, PDF download, and email delivery."
      },
      {
        question: "Is this a diagnosis or a replacement for therapy?",
        answer:
          "No. It is a structured insight tool for reflection and pattern recognition, not a diagnosis or a substitute for professional support."
      }
    ],
    finalCtaTitle: "If this pattern is already costing you energy, start before it fades back into the background.",
    finalCtaBody:
      "The assessment is brief, private, and designed to show you quickly whether the deeper report will actually feel worth opening.",
    finalCtaLabel: "Start The Self-Doubt Assessment",
    linkedAssessmentSlug: "imposter-syndrome-deep-report",
    seoTitle: "Self-Doubt Pattern Assessment | Click2Pro Insight",
    metaDescription:
      "A structured issue page for recurring self-doubt, internal pressure, and second-guessing. Start the guided assessment and review a private insight preview."
  }
] as const;

export function getIssuePageBySlug(slug: string) {
  return issuePages.find((page) => page.slug === slug) ?? null;
}

export function getAllIssuePageSlugs() {
  return issuePages.map((page) => page.slug);
}

export function validateIssuePageAssessmentLink(issuePage: IssuePageContent) {
  return getAssessmentDefinitionBySlug(issuePage.linkedAssessmentSlug);
}
