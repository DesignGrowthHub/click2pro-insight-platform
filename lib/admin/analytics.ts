import type { SourceAttribution } from "@/lib/persistence";

export type AdminMetricCard = {
  label: string;
  value: string;
  note: string;
};

export interface FunnelMetrics {
  assessmentSlug: string;
  assessmentTitle: string;
  landed: number;
  started: number;
  progress25: number;
  progress50: number;
  progress75: number;
  completed: number;
  previewViewed: number;
  clickedUnlock: number;
  purchased: number;
  subscribed: number;
  biggestDropOffLabel: string;
}

export interface AssessmentPerformance {
  assessmentSlug: string;
  assessmentTitle: string;
  visits: number;
  starts: number;
  completions: number;
  purchaseConversionRate: number;
  subscriptionConversionRate: number;
  revenueCents: number;
  averageCompletionMinutes: number;
  topRelatedAssessmentClicked: string;
}

export interface RevenueSnapshot {
  label: string;
  amountCents: number;
  note: string;
}

export interface SubscriptionMetrics {
  label: string;
  value: string;
  note: string;
}

export interface DeliveryMetrics {
  label: string;
  value: string;
  note: string;
}

export interface PopupMetrics {
  label: string;
  value: string;
  note: string;
}

export interface SourceAttributionPerformance {
  source: Pick<
    SourceAttribution,
    "sourceBlogUrl" | "sourceBlogSlug" | "sourceTopic" | "assessmentSlug" | "topic"
  >;
  visitors: number;
  popupShown: number;
  popupClicked: number;
  assessmentStarted: number;
  assessmentCompleted: number;
  purchaseCount: number;
  subscriptionCount: number;
  revenueCents: number;
  topConvertingAssessment: string;
}

export interface ReportDeliveryLog {
  reportTitle: string;
  generationStatus: "Ready" | "Generating" | "Failed";
  pdfStatus: "Available" | "Processing" | "Unavailable";
  accountEmailStatus: "Sent" | "Queued" | "Failed";
  alternateEmailStatus: "Sent" | "Not sent" | "Failed";
  resendAttempts: number;
  downloadCount: number;
  failureLog: string;
}

export interface UserReportLibraryOverview {
  userName: string;
  firstTopicEntered: string;
  reportsOwned: number;
  membershipStatus: string;
  totalSpentCents: number;
  lastActiveDate: string;
  deliveryIssues: string;
}

export interface QuickInsight {
  label: string;
  title: string;
  description: string;
}

export interface EntryPathPerformance {
  entryPath: string;
  visitors: number;
  previewViews: number;
  purchases: number;
  revenueCents: number;
  note: string;
}

export interface CrossInsightPathPerformance {
  sourceAssessment: string;
  secondAssessment: string;
  pathCount: number;
  subscriptionAssists: number;
  recommendationContext: string;
}

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatAdminCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatAdminPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatAdminDuration(minutes: number) {
  return `${minutes.toFixed(1)} min`;
}
