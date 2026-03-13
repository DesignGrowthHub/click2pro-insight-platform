import { assessments, getAssessmentsBySlugs } from "@/lib/assessments";
import { platformPricing } from "@/lib/pricing";
import type {
  AssessmentSession,
  EmailDeliveryStatus,
  PaymentRecord,
  PurchasedReport,
  ReportFile,
  SourceAttribution,
  Subscription,
  User
} from "@/lib/persistence";

export const dashboardUser: User = {
  id: "usr_001",
  fullName: "Alex Mercer",
  email: "alex@example.com",
  defaultReportEmail: "alex@example.com",
  createdAt: "2026-02-14T10:22:00.000Z",
  accountStatus: "active",
  activeSubscriptionId: "sub_001",
  purchasedReportIds: ["rep_001", "rep_002", "rep_003"],
  lifetimeValueCents:
    platformPricing.singleInsightReportCents +
    platformPricing.premiumDeepInsightReportCents +
    platformPricing.singleInsightReportCents +
    platformPricing.membershipAnnualCents
};

export const sourceAttributions: SourceAttribution[] = [
  {
    id: "src_001",
    sourceBlogUrl: "https://click2pro.com/imposter-syndrome-signs/",
    sourceBlogSlug: "imposter-syndrome-signs",
    sourceTopic: "Self-doubt",
    referralMedium: "popup",
    landingPath: "/assessments/imposter-syndrome-deep-report",
    assessmentSlug: "imposter-syndrome-deep-report",
    topic: "Self-Perception",
    firstTouchedAt: "2026-03-03T18:10:00.000Z"
  },
  {
    id: "src_002",
    sourceBlogUrl: "https://click2pro.com/identity-crisis-in-adults/",
    sourceBlogSlug: "identity-crisis-in-adults",
    sourceTopic: "Identity conflict",
    referralMedium: "popup",
    landingPath: "/assessments/identity-and-inner-conflict-profile",
    assessmentSlug: "identity-and-inner-conflict-profile",
    topic: "Identity",
    firstTouchedAt: "2026-03-08T08:32:00.000Z"
  },
  {
    id: "src_003",
    sourceBlogUrl: "https://click2pro.com/how-to-get-closure-after-breakup/",
    sourceBlogSlug: "how-to-get-closure-after-breakup",
    sourceTopic: "Emotional recovery",
    referralMedium: "popup",
    landingPath: "/assessments/closure-and-emotional-recovery-report",
    assessmentSlug: "closure-and-emotional-recovery-report",
    topic: "Recovery",
    firstTouchedAt: "2026-03-09T14:05:00.000Z"
  }
];

export const assessmentSessions: AssessmentSession[] = [
  {
    id: "sess_001",
    userId: dashboardUser.id,
    assessmentSlug: "imposter-syndrome-deep-report",
    topic: "Self-Perception",
    sourceAttributionId: "src_001",
    sourceBlogUrl: "https://click2pro.com/imposter-syndrome-signs/",
    startedStatus: true,
    completedStatus: true,
    paidStatus: true,
    sessionStatus: "paid",
    progressPercent: 100,
    startedAt: "2026-03-03T18:12:00.000Z",
    completedAt: "2026-03-03T18:19:00.000Z",
    previewViewedAt: "2026-03-03T18:20:00.000Z",
    unlockClickedAt: "2026-03-03T18:22:00.000Z",
    paidAt: "2026-03-03T18:24:00.000Z",
    reportGeneratedStatus: "ready"
  },
  {
    id: "sess_002",
    userId: dashboardUser.id,
    assessmentSlug: "identity-and-inner-conflict-profile",
    topic: "Identity",
    sourceAttributionId: "src_002",
    sourceBlogUrl: "https://click2pro.com/identity-crisis-in-adults/",
    startedStatus: true,
    completedStatus: true,
    paidStatus: true,
    sessionStatus: "paid",
    progressPercent: 100,
    startedAt: "2026-03-08T08:34:00.000Z",
    completedAt: "2026-03-08T08:42:00.000Z",
    previewViewedAt: "2026-03-08T08:43:00.000Z",
    unlockClickedAt: "2026-03-08T08:45:00.000Z",
    paidAt: "2026-03-08T08:46:00.000Z",
    reportGeneratedStatus: "generating"
  },
  {
    id: "sess_003",
    userId: dashboardUser.id,
    assessmentSlug: "closure-and-emotional-recovery-report",
    topic: "Recovery",
    sourceAttributionId: "src_003",
    sourceBlogUrl: "https://click2pro.com/how-to-get-closure-after-breakup/",
    startedStatus: true,
    completedStatus: true,
    paidStatus: true,
    sessionStatus: "paid",
    progressPercent: 100,
    startedAt: "2026-03-09T14:06:00.000Z",
    completedAt: "2026-03-09T14:12:00.000Z",
    previewViewedAt: "2026-03-09T14:13:00.000Z",
    unlockClickedAt: "2026-03-09T14:15:00.000Z",
    paidAt: "2026-03-09T14:16:00.000Z",
    reportGeneratedStatus: "failed"
  }
];

export const paymentRecords: PaymentRecord[] = [
  {
    id: "pay_001",
    userId: dashboardUser.id,
    purchasedReportId: "rep_001",
    subscriptionId: null,
    productType: "single_report",
    productReference: "imposter-syndrome-deep-report",
    currency: "USD",
    amountCents: platformPricing.singleInsightReportCents,
    status: "paid",
    provider: "placeholder",
    providerReference: "pi_mock_001",
    createdAt: "2026-03-03T18:24:00.000Z",
    paidAt: "2026-03-03T18:24:00.000Z"
  },
  {
    id: "pay_002",
    userId: dashboardUser.id,
    purchasedReportId: "rep_002",
    subscriptionId: null,
    productType: "single_report",
    productReference: "identity-and-inner-conflict-profile",
    currency: "USD",
    amountCents: platformPricing.premiumDeepInsightReportCents,
    status: "paid",
    provider: "placeholder",
    providerReference: "pi_mock_002",
    createdAt: "2026-03-08T08:46:00.000Z",
    paidAt: "2026-03-08T08:46:00.000Z"
  },
  {
    id: "pay_003",
    userId: dashboardUser.id,
    purchasedReportId: "rep_003",
    subscriptionId: null,
    productType: "single_report",
    productReference: "closure-and-emotional-recovery-report",
    currency: "USD",
    amountCents: platformPricing.singleInsightReportCents,
    status: "paid",
    provider: "placeholder",
    providerReference: "pi_mock_003",
    createdAt: "2026-03-09T14:16:00.000Z",
    paidAt: "2026-03-09T14:16:00.000Z"
  }
];

export const currentSubscription: Subscription = {
  id: "sub_001",
  userId: dashboardUser.id,
  planCode: "membership-annual",
  planLabel: "Membership",
  status: "active",
  billingInterval: "annual",
  startedAt: "2026-03-05T09:18:00.000Z",
  renewalDate: "2027-03-05T09:18:00.000Z",
  canceledAt: null,
  reportCreditsRemaining: 8,
  unlockedAssessmentSlugs: assessments.map((assessment) => assessment.slug),
  upgradeSourceReportSlug: "imposter-syndrome-deep-report"
};

export const reportFiles: ReportFile[] = [
  {
    id: "file_001",
    purchasedReportId: "rep_001",
    fileType: "pdf",
    fileName: "imposter-syndrome-deep-report.pdf",
    storageKey: "reports/usr_001/rep_001/report.pdf",
    availability: "available",
    generatedAt: "2026-03-03T18:28:00.000Z",
    downloadCount: 2,
    lastDownloadedAt: "2026-03-06T10:42:00.000Z"
  },
  {
    id: "file_002",
    purchasedReportId: "rep_002",
    fileType: "pdf",
    fileName: "identity-and-inner-conflict-profile.pdf",
    storageKey: "reports/usr_001/rep_002/report.pdf",
    availability: "processing",
    generatedAt: null,
    downloadCount: 0,
    lastDownloadedAt: null
  },
  {
    id: "file_003",
    purchasedReportId: "rep_003",
    fileType: "pdf",
    fileName: "closure-and-emotional-recovery-report.pdf",
    storageKey: "reports/usr_001/rep_003/report.pdf",
    availability: "failed",
    generatedAt: null,
    downloadCount: 0,
    lastDownloadedAt: null
  }
];

export const emailDeliveryStatuses: EmailDeliveryStatus[] = [
  {
    id: "email_001",
    purchasedReportId: "rep_001",
    target: "account_email",
    recipientEmail: dashboardUser.email,
    providerStatus: "sent",
    firstSentAt: "2026-03-03T18:29:00.000Z",
    lastSentAt: "2026-03-03T18:29:00.000Z",
    resendCount: 1,
    failureReason: null
  },
  {
    id: "email_002",
    purchasedReportId: "rep_001",
    target: "alternate_email",
    recipientEmail: "alex.work@example.com",
    providerStatus: "sent",
    firstSentAt: "2026-03-04T09:20:00.000Z",
    lastSentAt: "2026-03-04T09:20:00.000Z",
    resendCount: 0,
    failureReason: null
  },
  {
    id: "email_003",
    purchasedReportId: "rep_002",
    target: "account_email",
    recipientEmail: dashboardUser.email,
    providerStatus: "queued",
    firstSentAt: null,
    lastSentAt: null,
    resendCount: 0,
    failureReason: null
  },
  {
    id: "email_004",
    purchasedReportId: "rep_003",
    target: "account_email",
    recipientEmail: dashboardUser.email,
    providerStatus: "failed",
    firstSentAt: "2026-03-09T14:24:00.000Z",
    lastSentAt: "2026-03-09T14:31:00.000Z",
    resendCount: 2,
    failureReason: "PDF file was not available at time of send."
  }
];

export const purchasedReports: PurchasedReport[] = [
  {
    id: "rep_001",
    userId: dashboardUser.id,
    assessmentSlug: "imposter-syndrome-deep-report",
    reportTitle: "Imposter Syndrome Deep Report",
    topic: "Self-Perception",
    purchaseDate: "2026-03-03T18:24:00.000Z",
    sessionId: "sess_001",
    sourceAttributionId: "src_001",
    paymentRecordId: "pay_001",
    status: "ready",
    reportGeneratedStatus: "ready",
    pdfAvailability: "available",
    primaryFileId: "file_001",
    emailDeliveryIds: ["email_001", "email_002"],
    viewUrl: "/reports/imposter-syndrome-deep-report",
    previewUrl: "/reports/imposter-syndrome-deep-report",
    accountEmailSent: true,
    alternateEmailSent: true,
    lastResendAt: "2026-03-04T09:20:00.000Z",
    failureReason: null
  },
  {
    id: "rep_002",
    userId: dashboardUser.id,
    assessmentSlug: "identity-and-inner-conflict-profile",
    reportTitle: "Identity & Inner Conflict Profile",
    topic: "Identity",
    purchaseDate: "2026-03-08T08:46:00.000Z",
    sessionId: "sess_002",
    sourceAttributionId: "src_002",
    paymentRecordId: "pay_002",
    status: "generating",
    reportGeneratedStatus: "generating",
    pdfAvailability: "processing",
    primaryFileId: "file_002",
    emailDeliveryIds: ["email_003"],
    viewUrl: "/reports/identity-and-inner-conflict-profile",
    previewUrl: "/reports/identity-and-inner-conflict-profile",
    accountEmailSent: false,
    alternateEmailSent: false,
    lastResendAt: null,
    failureReason: null
  },
  {
    id: "rep_003",
    userId: dashboardUser.id,
    assessmentSlug: "closure-and-emotional-recovery-report",
    reportTitle: "Closure & Emotional Recovery Report",
    topic: "Recovery",
    purchaseDate: "2026-03-09T14:16:00.000Z",
    sessionId: "sess_003",
    sourceAttributionId: "src_003",
    paymentRecordId: "pay_003",
    status: "failed",
    reportGeneratedStatus: "failed",
    pdfAvailability: "failed",
    primaryFileId: "file_003",
    emailDeliveryIds: ["email_004"],
    viewUrl: "/reports/closure-and-emotional-recovery-report",
    previewUrl: "/reports/closure-and-emotional-recovery-report",
    accountEmailSent: false,
    alternateEmailSent: false,
    lastResendAt: "2026-03-09T14:31:00.000Z",
    failureReason: "Report generation timed out during PDF assembly."
  }
];

export const membershipBenefits = [
  "Access to all 10 assessments while membership is active",
  "Full report library and dashboard history in one account",
  "Future assessments included inside the same membership layer",
  "Connected-pattern recommendations and later follow-up insight features"
];

export const dashboardRecommendedInsights = getAssessmentsBySlugs([
  "attachment-and-relationship-style-report",
  "personality-burnout-and-stress-report",
  "toxic-pattern-and-red-flag-report"
]);

export const dashboardUnlockedAssessments = getAssessmentsBySlugs(
  currentSubscription.unlockedAssessmentSlugs
);

export const reportLibraryStateExamples = {
  empty: {
    title: "No saved reports yet",
    description:
      "This state appears for first-time buyers before a completed purchase or generated report has been attached to the account."
  },
  loading: {
    title: "Syncing stored reports",
    description:
      "Use this while report files, delivery history, and entitlement state are loading from the account service."
  }
};
