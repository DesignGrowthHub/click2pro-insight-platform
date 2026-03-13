import type {
  AssessmentPerformance,
  CrossInsightPathPerformance,
  EntryPathPerformance,
  FunnelMetrics,
  QuickInsight,
  ReportDeliveryLog,
  RevenueSnapshot,
  SourceAttributionPerformance,
  SubscriptionMetrics,
  UserReportLibraryOverview
} from "@/lib/admin/analytics";
import {
  formatAdminCurrency,
  formatAdminDuration,
  formatAdminNumber,
  formatAdminPercent
} from "@/lib/admin/analytics";

const funnelMetrics: FunnelMetrics[] = [
  {
    assessmentSlug: "condescending-behavior-decoder",
    assessmentTitle: "Condescending Behavior Decoder",
    landed: 8260,
    started: 1220,
    progress25: 1010,
    progress50: 804,
    progress75: 628,
    completed: 492,
    previewViewed: 450,
    clickedUnlock: 164,
    purchased: 72,
    subscribed: 12,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "imposter-syndrome-deep-report",
    assessmentTitle: "Imposter Syndrome Deep Report",
    landed: 38420,
    started: 5940,
    progress25: 4720,
    progress50: 3904,
    progress75: 3280,
    completed: 2910,
    previewViewed: 2640,
    clickedUnlock: 884,
    purchased: 482,
    subscribed: 96,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "relationship-infatuation-obsession-analysis",
    assessmentTitle: "Relationship Infatuation / Obsession Analysis",
    landed: 12180,
    started: 1740,
    progress25: 1360,
    progress50: 1050,
    progress75: 820,
    completed: 622,
    previewViewed: 574,
    clickedUnlock: 190,
    purchased: 84,
    subscribed: 18,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "toxic-pattern-and-red-flag-report",
    assessmentTitle: "Toxic Pattern & Red Flag Report",
    landed: 17050,
    started: 2460,
    progress25: 1980,
    progress50: 1560,
    progress75: 1224,
    completed: 884,
    previewViewed: 816,
    clickedUnlock: 312,
    purchased: 176,
    subscribed: 32,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "emotional-detachment-nihilism-insight",
    assessmentTitle: "Emotional Detachment / Nihilism Insight",
    landed: 9420,
    started: 1340,
    progress25: 1050,
    progress50: 820,
    progress75: 634,
    completed: 468,
    previewViewed: 430,
    clickedUnlock: 132,
    purchased: 61,
    subscribed: 10,
    biggestDropOffLabel: "50% to 75%"
  },
  {
    assessmentSlug: "anhedonia-and-motivation-pattern-scan",
    assessmentTitle: "Anhedonia & Motivation Pattern Scan",
    landed: 10140,
    started: 1420,
    progress25: 1160,
    progress50: 910,
    progress75: 702,
    completed: 510,
    previewViewed: 468,
    clickedUnlock: 148,
    purchased: 66,
    subscribed: 12,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "personality-burnout-and-stress-report",
    assessmentTitle: "Personality Burnout & Stress Report",
    landed: 19410,
    started: 2960,
    progress25: 2430,
    progress50: 1980,
    progress75: 1640,
    completed: 1470,
    previewViewed: 1310,
    clickedUnlock: 404,
    purchased: 196,
    subscribed: 38,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "attachment-and-relationship-style-report",
    assessmentTitle: "Attachment & Relationship Style Report",
    landed: 31860,
    started: 4880,
    progress25: 3920,
    progress50: 3160,
    progress75: 2710,
    completed: 2340,
    previewViewed: 2150,
    clickedUnlock: 742,
    purchased: 356,
    subscribed: 70,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "identity-and-inner-conflict-profile",
    assessmentTitle: "Identity & Inner Conflict Profile",
    landed: 15870,
    started: 2180,
    progress25: 1690,
    progress50: 1330,
    progress75: 1110,
    completed: 1040,
    previewViewed: 922,
    clickedUnlock: 286,
    purchased: 138,
    subscribed: 24,
    biggestDropOffLabel: "Landing to start"
  },
  {
    assessmentSlug: "closure-and-emotional-recovery-report",
    assessmentTitle: "Closure & Emotional Recovery Report",
    landed: 24900,
    started: 3940,
    progress25: 3140,
    progress50: 2480,
    progress75: 2010,
    completed: 1820,
    previewViewed: 1608,
    clickedUnlock: 524,
    purchased: 248,
    subscribed: 46,
    biggestDropOffLabel: "Landing to start"
  }
];

const assessmentPerformance: AssessmentPerformance[] = [
  {
    assessmentSlug: "condescending-behavior-decoder",
    assessmentTitle: "Condescending Behavior Decoder",
    visits: 8260,
    starts: 1220,
    completions: 492,
    purchaseConversionRate: 16.0,
    subscriptionConversionRate: 2.7,
    revenueCents: 182400,
    averageCompletionMinutes: 4.8,
    topRelatedAssessmentClicked: "Toxic Pattern & Red Flag Report"
  },
  {
    assessmentSlug: "imposter-syndrome-deep-report",
    assessmentTitle: "Imposter Syndrome Deep Report",
    visits: 38420,
    starts: 5940,
    completions: 2910,
    purchaseConversionRate: 18.3,
    subscriptionConversionRate: 3.6,
    revenueCents: 1156800,
    averageCompletionMinutes: 5.1,
    topRelatedAssessmentClicked: "Personality Burnout & Stress Report"
  },
  {
    assessmentSlug: "relationship-infatuation-obsession-analysis",
    assessmentTitle: "Relationship Infatuation / Obsession Analysis",
    visits: 12180,
    starts: 1740,
    completions: 622,
    purchaseConversionRate: 14.6,
    subscriptionConversionRate: 3.1,
    revenueCents: 214200,
    averageCompletionMinutes: 4.9,
    topRelatedAssessmentClicked: "Attachment & Relationship Style Report"
  },
  {
    assessmentSlug: "toxic-pattern-and-red-flag-report",
    assessmentTitle: "Toxic Pattern & Red Flag Report",
    visits: 17050,
    starts: 2460,
    completions: 884,
    purchaseConversionRate: 21.6,
    subscriptionConversionRate: 3.9,
    revenueCents: 429000,
    averageCompletionMinutes: 4.7,
    topRelatedAssessmentClicked: "Condescending Behavior Decoder"
  },
  {
    assessmentSlug: "emotional-detachment-nihilism-insight",
    assessmentTitle: "Emotional Detachment / Nihilism Insight",
    visits: 9420,
    starts: 1340,
    completions: 468,
    purchaseConversionRate: 14.2,
    subscriptionConversionRate: 2.3,
    revenueCents: 158600,
    averageCompletionMinutes: 5.2,
    topRelatedAssessmentClicked: "Anhedonia & Motivation Pattern Scan"
  },
  {
    assessmentSlug: "anhedonia-and-motivation-pattern-scan",
    assessmentTitle: "Anhedonia & Motivation Pattern Scan",
    visits: 10140,
    starts: 1420,
    completions: 510,
    purchaseConversionRate: 14.1,
    subscriptionConversionRate: 2.6,
    revenueCents: 171400,
    averageCompletionMinutes: 5.0,
    topRelatedAssessmentClicked: "Emotional Detachment / Nihilism Insight"
  },
  {
    assessmentSlug: "personality-burnout-and-stress-report",
    assessmentTitle: "Personality Burnout & Stress Report",
    visits: 19410,
    starts: 2960,
    completions: 1470,
    purchaseConversionRate: 15.0,
    subscriptionConversionRate: 2.9,
    revenueCents: 418800,
    averageCompletionMinutes: 5.3,
    topRelatedAssessmentClicked: "Imposter Syndrome Deep Report"
  },
  {
    assessmentSlug: "attachment-and-relationship-style-report",
    assessmentTitle: "Attachment & Relationship Style Report",
    visits: 31860,
    starts: 4880,
    completions: 2340,
    purchaseConversionRate: 16.6,
    subscriptionConversionRate: 3.3,
    revenueCents: 874200,
    averageCompletionMinutes: 5.4,
    topRelatedAssessmentClicked: "Relationship Infatuation / Obsession Analysis"
  },
  {
    assessmentSlug: "identity-and-inner-conflict-profile",
    assessmentTitle: "Identity & Inner Conflict Profile",
    visits: 15870,
    starts: 2180,
    completions: 1040,
    purchaseConversionRate: 15.0,
    subscriptionConversionRate: 2.6,
    revenueCents: 276000,
    averageCompletionMinutes: 5.1,
    topRelatedAssessmentClicked: "Imposter Syndrome Deep Report"
  },
  {
    assessmentSlug: "closure-and-emotional-recovery-report",
    assessmentTitle: "Closure & Emotional Recovery Report",
    visits: 24900,
    starts: 3940,
    completions: 1820,
    purchaseConversionRate: 15.4,
    subscriptionConversionRate: 2.9,
    revenueCents: 552000,
    averageCompletionMinutes: 4.9,
    topRelatedAssessmentClicked: "Attachment & Relationship Style Report"
  }
];

const sourceAttributionPerformance: SourceAttributionPerformance[] = [
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/imposter-syndrome-signs/",
      sourceBlogSlug: "imposter-syndrome-signs",
      sourceTopic: "Self-doubt",
      assessmentSlug: "imposter-syndrome-deep-report",
      topic: "Imposter Syndrome"
    },
    visitors: 14220,
    popupShown: 9730,
    popupClicked: 1380,
    assessmentStarted: 2410,
    assessmentCompleted: 1180,
    purchaseCount: 224,
    subscriptionCount: 46,
    revenueCents: 537600,
    topConvertingAssessment: "Imposter Syndrome Deep Report"
  },
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/relationship-red-flags/",
      sourceBlogSlug: "relationship-red-flags",
      sourceTopic: "Relationship warning signs",
      assessmentSlug: "toxic-pattern-and-red-flag-report",
      topic: "Toxic Pattern"
    },
    visitors: 11930,
    popupShown: 8240,
    popupClicked: 1160,
    assessmentStarted: 1820,
    assessmentCompleted: 884,
    purchaseCount: 176,
    subscriptionCount: 28,
    revenueCents: 429000,
    topConvertingAssessment: "Toxic Pattern & Red Flag Report"
  },
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/attachment-style-in-adults/",
      sourceBlogSlug: "attachment-style-in-adults",
      sourceTopic: "Relationship attachment",
      assessmentSlug: "attachment-and-relationship-style-report",
      topic: "Attachment"
    },
    visitors: 16280,
    popupShown: 11140,
    popupClicked: 1540,
    assessmentStarted: 2480,
    assessmentCompleted: 1220,
    purchaseCount: 248,
    subscriptionCount: 52,
    revenueCents: 603800,
    topConvertingAssessment: "Attachment & Relationship Style Report"
  },
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/identity-crisis-in-adults/",
      sourceBlogSlug: "identity-crisis-in-adults",
      sourceTopic: "Identity conflict",
      assessmentSlug: "identity-and-inner-conflict-profile",
      topic: "Identity"
    },
    visitors: 8460,
    popupShown: 5840,
    popupClicked: 740,
    assessmentStarted: 1240,
    assessmentCompleted: 592,
    purchaseCount: 98,
    subscriptionCount: 18,
    revenueCents: 205800,
    topConvertingAssessment: "Identity & Inner Conflict Profile"
  },
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/how-to-get-closure-after-breakup/",
      sourceBlogSlug: "how-to-get-closure-after-breakup",
      sourceTopic: "Closure after breakup",
      assessmentSlug: "closure-and-emotional-recovery-report",
      topic: "Closure"
    },
    visitors: 7980,
    popupShown: 5520,
    popupClicked: 690,
    assessmentStarted: 1110,
    assessmentCompleted: 540,
    purchaseCount: 84,
    subscriptionCount: 14,
    revenueCents: 193200,
    topConvertingAssessment: "Closure & Emotional Recovery Report"
  },
  {
    source: {
      sourceBlogUrl: "https://click2pro.com/why-am-i-so-burned-out/",
      sourceBlogSlug: "why-am-i-so-burned-out",
      sourceTopic: "Stress and depletion",
      assessmentSlug: "personality-burnout-and-stress-report",
      topic: "Burnout"
    },
    visitors: 7360,
    popupShown: 5180,
    popupClicked: 640,
    assessmentStarted: 980,
    assessmentCompleted: 472,
    purchaseCount: 88,
    subscriptionCount: 20,
    revenueCents: 214600,
    topConvertingAssessment: "Personality Burnout & Stress Report"
  }
];

const revenueSnapshots: RevenueSnapshot[] = [
  {
    label: "Revenue today",
    amountCents: 186400,
    note: "Gross revenue placeholder for the current day."
  },
  {
    label: "Last 7 days",
    amountCents: 913200,
    note: "Useful for near-term founder decisions and offer changes."
  },
  {
    label: "Last 30 days",
    amountCents: 2748000,
    note: "Main operating window for assessing blog traffic and offer quality."
  },
  {
    label: "Lifetime revenue",
    amountCents: 5468000,
    note: "Gross placeholder revenue across one-time, bundles, and subscriptions."
  },
  {
    label: "One-time purchase revenue",
    amountCents: 2212000,
    note: "Mix of core report purchases, premium report upgrades, and region-specific one-time offer paths."
  },
  {
    label: "Bundle revenue",
    amountCents: 1086000,
    note: "Related report bundles and connected-topic purchases."
  },
  {
    label: "Subscription revenue",
    amountCents: 2170000,
    note: "Recurring membership revenue across monthly and annual plan variants."
  }
];

const subscriptionMetrics: SubscriptionMetrics[] = [
  {
    label: "Active members",
    value: "418",
    note: "Current paying members across all recurring plans."
  },
  {
    label: "Monthly vs annual",
    value: "250 / 168",
    note: "Annual is smaller in count but stronger in retained value."
  },
  {
    label: "Upgrade after first report",
    value: "23%",
    note: "Users who moved from one paid report into membership."
  },
  {
    label: "Top first report to membership",
    value: "Imposter Syndrome Deep Report",
    note: "The most common first premium entry before subscription."
  },
  {
    label: "Churn / cancel placeholder",
    value: "--",
    note: "Reserved for cancellation cohorts, reasons, and reactivation logic."
  },
  {
    label: "Average subscriber value",
    value: "$182",
    note: "Placeholder blended value across active and recently renewed members."
  }
];

const popupMetrics = [
  {
    label: "Popup impressions",
    value: "52,480",
    note: "Popup shown on eligible blog pages after the delay window."
  },
  {
    label: "Popup clicks",
    value: "6,150",
    note: "Contextual popup clicks into assessment intro pages."
  },
  {
    label: "Popup click-through rate",
    value: "11.7%",
    note: "One of the cleanest signals of message-topic fit."
  },
  {
    label: "Direct homepage entries",
    value: "6,420",
    note: "Sessions that started directly on the insight platform homepage."
  },
  {
    label: "Dashboard re-entry traffic",
    value: "2,180",
    note: "Returning ownership-driven traffic into saved reports or library state."
  },
  {
    label: "Related-report clickthroughs",
    value: "1,240",
    note: "Cross-sell clicks from previews, reports, and post-purchase surfaces."
  }
];

const deliveryMetrics = [
  {
    label: "Reports generated successfully",
    value: "1,438",
    note: "Reports that completed assembly without requiring manual retry."
  },
  {
    label: "PDF generation ready",
    value: "1,402",
    note: "Reports with an available download-ready PDF asset."
  },
  {
    label: "Sent to account email",
    value: "1,284",
    note: "Default delivery to the account inbox."
  },
  {
    label: "Sent to alternate email",
    value: "324",
    note: "Secondary sends requested by the user."
  },
  {
    label: "Resend attempts",
    value: "166",
    note: "Manual resend attempts recorded across owned reports."
  },
  {
    label: "Download count",
    value: "3,482",
    note: "Downloads initiated from the dashboard or report view."
  },
  {
    label: "Failed delivery log",
    value: "27",
    note: "Delivery or file-generation items awaiting retry or review."
  }
];

const deliveryLogs: ReportDeliveryLog[] = [
  {
    reportTitle: "Imposter Syndrome Deep Report",
    generationStatus: "Ready",
    pdfStatus: "Available",
    accountEmailStatus: "Sent",
    alternateEmailStatus: "Sent",
    resendAttempts: 1,
    downloadCount: 4,
    failureLog: "None"
  },
  {
    reportTitle: "Attachment & Relationship Style Report",
    generationStatus: "Ready",
    pdfStatus: "Available",
    accountEmailStatus: "Sent",
    alternateEmailStatus: "Not sent",
    resendAttempts: 0,
    downloadCount: 3,
    failureLog: "None"
  },
  {
    reportTitle: "Identity & Inner Conflict Profile",
    generationStatus: "Generating",
    pdfStatus: "Processing",
    accountEmailStatus: "Queued",
    alternateEmailStatus: "Not sent",
    resendAttempts: 0,
    downloadCount: 0,
    failureLog: "None"
  },
  {
    reportTitle: "Closure & Emotional Recovery Report",
    generationStatus: "Failed",
    pdfStatus: "Unavailable",
    accountEmailStatus: "Failed",
    alternateEmailStatus: "Not sent",
    resendAttempts: 2,
    downloadCount: 0,
    failureLog: "PDF assembly timed out"
  },
  {
    reportTitle: "Toxic Pattern & Red Flag Report",
    generationStatus: "Ready",
    pdfStatus: "Available",
    accountEmailStatus: "Sent",
    alternateEmailStatus: "Failed",
    resendAttempts: 1,
    downloadCount: 2,
    failureLog: "Alternate inbox rejected attachment"
  }
];

const userLibraryOverview: UserReportLibraryOverview[] = [
  {
    userName: "Alex Mercer",
    firstTopicEntered: "Imposter Syndrome",
    reportsOwned: 3,
    membershipStatus: "Annual active",
    totalSpentCents: 39600,
    lastActiveDate: "Mar 10, 2026",
    deliveryIssues: "1 failed delivery retry"
  },
  {
    userName: "Jordan Lee",
    firstTopicEntered: "Attachment",
    reportsOwned: 4,
    membershipStatus: "Monthly active",
    totalSpentCents: 24700,
    lastActiveDate: "Mar 11, 2026",
    deliveryIssues: "None"
  },
  {
    userName: "Taylor Brooks",
    firstTopicEntered: "Closure",
    reportsOwned: 1,
    membershipStatus: "No membership",
    totalSpentCents: 4900,
    lastActiveDate: "Mar 8, 2026",
    deliveryIssues: "PDF pending"
  },
  {
    userName: "Morgan Diaz",
    firstTopicEntered: "Burnout",
    reportsOwned: 2,
    membershipStatus: "Annual active",
    totalSpentCents: 24800,
    lastActiveDate: "Mar 9, 2026",
    deliveryIssues: "None"
  },
  {
    userName: "Casey Nguyen",
    firstTopicEntered: "Toxic Pattern",
    reportsOwned: 2,
    membershipStatus: "Canceled placeholder",
    totalSpentCents: 14800,
    lastActiveDate: "Mar 4, 2026",
    deliveryIssues: "1 alternate-email failure"
  }
];

const entryPathPerformance: EntryPathPerformance[] = [
  {
    entryPath: "Blog popup",
    visitors: 6150,
    previewViews: 2120,
    purchases: 694,
    revenueCents: 1664000,
    note: "Primary acquisition path for context-matched blog traffic."
  },
  {
    entryPath: "Direct homepage",
    visitors: 6420,
    previewViews: 840,
    purchases: 180,
    revenueCents: 412800,
    note: "Direct users tend to browse more before starting."
  },
  {
    entryPath: "Dashboard re-entry",
    visitors: 2180,
    previewViews: 690,
    purchases: 122,
    revenueCents: 298400,
    note: "Higher-intent users returning to owned assets or related paths."
  },
  {
    entryPath: "Related-report clickthrough",
    visitors: 1240,
    previewViews: 520,
    purchases: 88,
    revenueCents: 218600,
    note: "Cross-sell path from previews, reports, and post-purchase recommendations."
  }
];

const quickInsights: QuickInsight[] = [
  {
    label: "What matters now",
    title: "Highest converting blog this week: imposter-syndrome-signs",
    description:
      "That article is generating the strongest combined purchase and membership yield, so its popup copy and linked assessment should be protected first."
  },
  {
    label: "Best converting assessment",
    title: "Imposter Syndrome Deep Report is still the strongest premium entry point.",
    description:
      "It leads both one-time purchases and membership upgrades, making it the clearest benchmark for future assessment quality."
  },
  {
    label: "Biggest drop-off",
    title: "Landing-to-start remains the main funnel loss across nearly every topic.",
    description:
      "The strongest optimization opportunity is at the assessment intro and popup-to-intro handoff, not deeper in the question flow."
  },
  {
    label: "Most effective upsell path",
    title: "Related-report recommendations outperform direct bundle framing after purchase.",
    description:
      "Cross-sell performs better when it feels like adjacent clarification rather than a second pricing decision."
  },
  {
    label: "Best membership entry report",
    title: "Imposter Syndrome Deep Report remains the best subscription on-ramp.",
    description:
      "It appears to prime users for broader self-pattern tracking and connected reports better than the other first-touch products."
  }
];

const crossInsightPaths: CrossInsightPathPerformance[] = [
  {
    sourceAssessment: "Imposter Syndrome Deep Report",
    secondAssessment: "Personality Burnout & Stress Report",
    pathCount: 124,
    subscriptionAssists: 41,
    recommendationContext:
      "Most effective when internal pressure and overpreparation stay high after the first report."
  },
  {
    sourceAssessment: "Relationship Infatuation / Obsession Analysis",
    secondAssessment: "Attachment & Relationship Style Report",
    pathCount: 98,
    subscriptionAssists: 33,
    recommendationContext:
      "Performs best when attachment intensity and mixed-signal sensitivity are both prominent."
  },
  {
    sourceAssessment: "Toxic Pattern & Red Flag Report",
    secondAssessment: "Condescending Behavior Decoder",
    pathCount: 74,
    subscriptionAssists: 18,
    recommendationContext:
      "Works when users want to translate a broad red-flag read into more specific behavior interpretation."
  },
  {
    sourceAssessment: "Closure & Emotional Recovery Report",
    secondAssessment: "Attachment & Relationship Style Report",
    pathCount: 62,
    subscriptionAssists: 21,
    recommendationContext:
      "Strong path when recovery difficulty appears tied to reassurance sensitivity rather than only sadness or distance."
  }
];

const totalVisits = funnelMetrics.reduce((total, item) => total + item.landed, 0);
const totalStarts = funnelMetrics.reduce((total, item) => total + item.started, 0);
const totalCompletions = funnelMetrics.reduce((total, item) => total + item.completed, 0);
const totalPreviewViews = funnelMetrics.reduce(
  (total, item) => total + item.previewViewed,
  0
);
const totalUnlockClicks = funnelMetrics.reduce(
  (total, item) => total + item.clickedUnlock,
  0
);
const totalPaidReports = funnelMetrics.reduce((total, item) => total + item.purchased, 0);

export const adminOverviewMetrics = [
  {
    label: "Total assessment page visits",
    value: formatAdminNumber(totalVisits),
    note: "All assessment landing traffic across the current catalog."
  },
  {
    label: "Total test starts",
    value: formatAdminNumber(totalStarts),
    note: "Users who moved from intro into the question flow."
  },
  {
    label: "Total test completions",
    value: formatAdminNumber(totalCompletions),
    note: "Users who finished the assessment before preview."
  },
  {
    label: "Preview views",
    value: formatAdminNumber(totalPreviewViews),
    note: "Users who reached the preview-and-unlock state."
  },
  {
    label: "Unlock clicks",
    value: formatAdminNumber(totalUnlockClicks),
    note: "Users who attempted to move from preview to paid access."
  },
  {
    label: "Paid reports",
    value: formatAdminNumber(totalPaidReports),
    note: "Paid one-time report conversions across all assessment topics."
  },
  {
    label: "Active subscriptions",
    value: "418",
    note: "Recurring members currently active across annual and monthly plans."
  },
  {
    label: "Total revenue",
    value: formatAdminCurrency(5468000),
    note: "Placeholder gross revenue across one-time, bundle, and subscription products."
  },
  {
    label: "Average order value",
    value: "$76",
    note: "Blended placeholder order value across $49 reports, $99 premium reports, and recurring membership entries."
  },
  {
    label: "Report downloads",
    value: "3,482",
    note: "Download actions from the owned report library."
  },
  {
    label: "Email deliveries",
    value: "1,608",
    note: "Combined account-email and alternate-email report sends."
  }
];

export const quickInsightRows = quickInsights;

export const revenueSnapshotRows = revenueSnapshots.map((item) => ({
  label: item.label,
  value: formatAdminCurrency(item.amountCents),
  note: item.note
}));

export const popupMetricRows = popupMetrics;

export const sourceBlogAttributionRows = sourceAttributionPerformance.map((item) => ({
  blogUrl: item.source.sourceBlogUrl.replace("https://", ""),
  sourceTopic: item.source.sourceTopic,
  visitors: formatAdminNumber(item.visitors),
  popupShown: formatAdminNumber(item.popupShown),
  popupClicked: formatAdminNumber(item.popupClicked),
  assessmentStarted: formatAdminNumber(item.assessmentStarted),
  assessmentCompleted: formatAdminNumber(item.assessmentCompleted),
  purchases: formatAdminNumber(item.purchaseCount),
  subscriptions: formatAdminNumber(item.subscriptionCount),
  revenue: formatAdminCurrency(item.revenueCents),
  topAssessment: item.topConvertingAssessment
}));

export const assessmentFunnelRows = funnelMetrics.map((item) => ({
  topic: item.assessmentTitle,
  landed: formatAdminNumber(item.landed),
  started: formatAdminNumber(item.started),
  progress25: formatAdminNumber(item.progress25),
  progress50: formatAdminNumber(item.progress50),
  progress75: formatAdminNumber(item.progress75),
  completed: formatAdminNumber(item.completed),
  previewViewed: formatAdminNumber(item.previewViewed),
  clickedUnlock: formatAdminNumber(item.clickedUnlock),
  purchased: formatAdminNumber(item.purchased),
  subscribed: formatAdminNumber(item.subscribed),
  biggestDrop: item.biggestDropOffLabel
}));

export const assessmentPerformanceRows = assessmentPerformance.map((item) => ({
  assessment: item.assessmentTitle,
  visits: formatAdminNumber(item.visits),
  starts: formatAdminNumber(item.starts),
  completions: formatAdminNumber(item.completions),
  purchaseConversion: formatAdminPercent(item.purchaseConversionRate),
  subscriptionConversion: formatAdminPercent(item.subscriptionConversionRate),
  revenue: formatAdminCurrency(item.revenueCents),
  averageCompletion: formatAdminDuration(item.averageCompletionMinutes),
  topRelated: item.topRelatedAssessmentClicked
}));

export const revenueMetricRows = revenueSnapshotRows;

export const subscriptionAnalyticsRows = subscriptionMetrics;

export const deliveryOverviewRows = deliveryMetrics;

export const deliveryTrackingRows = deliveryLogs.map((item) => ({
  report: item.reportTitle,
  generated: item.generationStatus,
  pdf: item.pdfStatus,
  accountEmail: item.accountEmailStatus,
  alternateEmail: item.alternateEmailStatus,
  resendAttempts: formatAdminNumber(item.resendAttempts),
  downloads: formatAdminNumber(item.downloadCount),
  failureLog: item.failureLog
}));

export const userLibraryOverviewRows = userLibraryOverview.map((item) => ({
  user: item.userName,
  firstTopic: item.firstTopicEntered,
  reportsOwned: formatAdminNumber(item.reportsOwned),
  membershipStatus: item.membershipStatus,
  totalSpent: formatAdminCurrency(item.totalSpentCents),
  lastActive: item.lastActiveDate,
  deliveryIssues: item.deliveryIssues
}));

export const entryPathRows = entryPathPerformance.map((item) => ({
  entryPath: item.entryPath,
  visitors: formatAdminNumber(item.visitors),
  previewViews: formatAdminNumber(item.previewViews),
  purchases: formatAdminNumber(item.purchases),
  revenue: formatAdminCurrency(item.revenueCents),
  note: item.note
}));

export const crossInsightPathRows = crossInsightPaths.map((item) => ({
  sourceAssessment: item.sourceAssessment,
  secondAssessment: item.secondAssessment,
  pathCount: formatAdminNumber(item.pathCount),
  subscriptionAssists: formatAdminNumber(item.subscriptionAssists),
  recommendationContext: item.recommendationContext
}));
