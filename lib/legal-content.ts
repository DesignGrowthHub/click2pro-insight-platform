import { SUPPORT_EMAIL } from "@/lib/public-contact";

export type LegalPageContent = {
  badge: string;
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  note?: string;
};

export const privacyPolicyContent: LegalPageContent = {
  badge: "Privacy Policy",
  title: "How Click2Pro Insight Platform handles privacy",
  description:
    "This page explains what information may be collected through the platform, how it is used to provide assessments and saved reports, and how that information is handled inside the account experience.",
  sections: [
    {
      title: "Information the platform may collect",
      body: [
        "The platform may collect account information, assessment responses, saved reports, purchase records, delivery actions, and support-related details that help keep the product working as expected.",
        "If you use the platform without creating an account immediately, temporary session data may be used to preserve assessment progress or report continuity until that activity can be attached to your account later."
      ]
    },
    {
      title: "How information is used",
      body: [
        "Information is used to run assessments, score response patterns, prepare report previews, deliver purchased reports, maintain dashboard access, and support account or delivery troubleshooting when needed.",
        "Assessment and report content is used for pattern-based interpretation inside the product. It is not used to make medical or diagnostic claims."
      ]
    },
    {
      title: "Sharing and service providers",
      body: [
        "Information may be processed by the infrastructure and service providers needed to operate the platform, such as hosting, authentication, payments, storage, and transactional delivery tools.",
        "The platform is not designed to sell personal information or turn assessment activity into a public profile."
      ]
    },
    {
      title: "Retention and account continuity",
      body: [
        "Saved reports, purchase records, and related delivery history may remain attached to the account so the owned report library continues to work over time.",
        "Temporary or anonymous data may be retained long enough to support continuity, fraud prevention, and later account attachment where appropriate."
      ]
    },
    {
      title: "Your responsibility and discretion",
      body: [
        "Because some users arrive through emotionally sensitive topics, the platform is designed around privacy, private report ownership, and a quieter dashboard experience.",
        "If you share a report by download or email, you control that decision and should consider your own privacy needs before doing so."
      ]
    }
  ],
  note:
    "This page is part of the product foundation and should still receive final legal review before a full public launch."
};

export const termsOfUseContent: LegalPageContent = {
  badge: "Terms of Use",
  title: "Terms for using Click2Pro Insight Platform",
  description:
    "These terms describe the basic rules for using the platform, purchasing access, and using saved reports inside the account experience.",
  sections: [
    {
      title: "Nature of the service",
      body: [
        "Click2Pro Insight Platform is a structured insight product built around behavioral questions, pattern-based interpretation, and paid report access.",
        "The platform is intended for reflection and personal clarity. It does not provide diagnosis, treatment, emergency support, or professional mental health care."
      ]
    },
    {
      title: "Account use",
      body: [
        "If you create an account, you are responsible for the accuracy of your account information and for maintaining control of your login credentials.",
        "The platform may limit, suspend, or refuse access where account use appears abusive, fraudulent, or disruptive to the service."
      ]
    },
    {
      title: "Purchases and access",
      body: [
        "Paid access may include single reports, premium report layers, memberships, or guided report walkthrough options where offered.",
        "Purchased access is tied to the platform account or ownership flow used at checkout and may include saved report access, delivery actions, and related continuity inside the dashboard."
      ]
    },
    {
      title: "Acceptable use",
      body: [
        "You may not misuse the platform, attempt to interfere with report generation or delivery, scrape protected content, or use the service in a way that harms other users or the business.",
        "You may not present the platform as a clinical or therapeutic service when it is not being offered that way."
      ]
    },
    {
      title: "Content and ownership limits",
      body: [
        "The platform retains rights in the software, assessment structure, written report layers, visual design, and related product materials.",
        "Paid access gives you the right to use the purchased report within the product experience and through the delivery methods the platform makes available."
      ]
    }
  ],
  note:
    "These terms should be reviewed alongside the final checkout, refund, and payment-provider language before a full production launch."
};

export const refundPolicyContent: LegalPageContent = {
  badge: "Cancellation and Refund Policy",
  title: "How cancellations and refunds are handled",
  description:
    "This page explains the platform’s current approach to digital-report access, fulfillment issues, and guided explanation add-ons where they are offered.",
  sections: [
    {
      title: "Digital report purchases",
      body: [
        "Single-report and premium-report purchases unlock digital content that is tied to the account, saved library, and delivery flow.",
        "Because these are digital products, automatic refunds are not assumed once access has been granted or the report has been fulfilled."
      ]
    },
    {
      title: "Fulfillment problems",
      body: [
        "If payment is confirmed but report access, PDF delivery, or email delivery does not complete properly, the platform should first attempt to recover fulfillment before a refund decision is made.",
        "Operational failures, duplicate charges, or unresolved delivery problems may be reviewed case by case."
      ]
    },
    {
      title: "Membership purchases",
      body: [
        "Membership access is intended to create broader report continuity over time rather than a one-time download-only purchase.",
        "Any final cancellation and renewal handling should match the live billing provider and the publicly displayed purchase terms at checkout."
      ]
    },
    {
      title: "Guided explanation add-ons",
      body: [
        "Where psychologist explanation sessions are offered, they are positioned as structured report walkthroughs and not as therapy or diagnosis.",
        "If a walkthrough has not been scheduled or fulfilled, the final cancellation treatment should follow the live scheduling and payment rules shown at purchase."
      ]
    },
    {
      title: "How review should work",
      body: [
        "Refund or cancellation reviews should rely on payment confirmation, report access status, delivery status, and whether the purchased service was actually fulfilled.",
        "The platform should stay calm and fair in handling issues rather than using rigid language that ignores obvious operational problems."
      ]
    }
  ],
  note:
    "Before launch, this page should be aligned to the exact live checkout terms, local legal requirements, and payment-provider rules."
};

export const supportContent: LegalPageContent = {
  badge: "Contact / Support",
  title: "Support for accounts, access, and report delivery",
  description:
    `Support requests can be sent to ${SUPPORT_EMAIL}. This page explains what support is intended to cover and how users should approach account, delivery, or purchase issues inside Click2Pro Insight Platform.`,
  sections: [
    {
      title: "What support covers",
      body: [
        "Support is meant for account access problems, purchase confirmation issues, missing report ownership, PDF delivery problems, email delivery issues, and other product or technical friction.",
        "Support is not a substitute for crisis help, therapy, or clinical guidance."
      ]
    },
    {
      title: "What to include in a request",
      body: [
        "Support requests are easiest to resolve when they include the email used for the account or purchase, the assessment or report topic involved, and a short description of what went wrong.",
        "If the issue involves delivery, it helps to mention whether the problem is with viewing the report, downloading the PDF, or receiving the email."
      ]
    },
    {
      title: "How guided explanation support should be handled",
      body: [
        "Where a Psychologist Explanation Session is offered, support should focus on entitlement status, scheduling follow-up, and clarification around the walkthrough itself.",
        "These sessions are framed as structured discussion of the report, not therapy or diagnosis."
      ]
    },
    {
      title: "Support channel readiness",
      body: [
        `The current support contact for the platform is ${SUPPORT_EMAIL}.`,
        "This page should act as the scope and process reference so support stays focused on access, ownership, delivery, and product issues."
      ]
    }
  ]
};
