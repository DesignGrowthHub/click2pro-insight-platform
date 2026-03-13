import "server-only";

import type {
  BillingInterval,
  BundleAccessStatus,
  DeliveryStatus,
  FileProcessingStatus,
  MembershipStatus,
  PaymentProvider,
  PurchaseType as PrismaPurchaseType,
  ReportAccessStatus,
  ReportStatus
} from "@prisma/client";

import type {
  CheckoutPaymentProvider,
  CurrencyCode,
  RegionKey
} from "@/lib/region/types";
import type { PurchaseProvider, PurchaseType } from "@/lib/commerce/types";

export function toClientCurrencyCode(currency?: string | null): CurrencyCode {
  return currency === "INR" ? "INR" : "USD";
}

export function inferRegionKey(input: {
  regionKey?: string | null;
  currency?: string | null;
}): RegionKey {
  return input.regionKey === "india" || input.currency === "INR"
    ? "india"
    : "international";
}

export function toPrismaPaymentProvider(
  provider?: CheckoutPaymentProvider | null
): PaymentProvider | null {
  if (!provider) {
    return null;
  }

  if (provider === "razorpay" || provider === "razorpay_placeholder") {
    return "RAZORPAY";
  }

  if (provider === "stripe" || provider === "stripe_placeholder") {
    return "STRIPE";
  }

  return null;
}

export function toClientPaymentProvider(
  provider?: PaymentProvider | null,
  regionKey: RegionKey = "international"
): PurchaseProvider {
  if (provider === "RAZORPAY") {
    return "razorpay";
  }

  if (provider === "STRIPE") {
    return "stripe";
  }

  return regionKey === "india" ? "razorpay_placeholder" : "stripe_placeholder";
}

export function toPrismaPurchaseType(purchaseType: PurchaseType): PrismaPurchaseType {
  switch (purchaseType) {
    case "single_report":
      return "SINGLE_REPORT";
    case "premium_report":
      return "PREMIUM_REPORT";
    case "bundle":
      return "BUNDLE";
    case "subscription":
      return "MEMBERSHIP";
    case "explanation_session":
      return "EXPLANATION_SESSION";
    default:
      return "SINGLE_REPORT";
  }
}

export function toClientPurchaseType(purchaseType: PrismaPurchaseType): PurchaseType {
  switch (purchaseType) {
    case "PREMIUM_REPORT":
      return "premium_report";
    case "BUNDLE":
      return "bundle";
    case "MEMBERSHIP":
      return "subscription";
    case "EXPLANATION_SESSION":
      return "explanation_session";
    case "SINGLE_REPORT":
    default:
      return "single_report";
  }
}

export function toClientMembershipStatus(status: MembershipStatus) {
  return status.toLowerCase() as Lowercase<MembershipStatus>;
}

export function toClientBillingInterval(interval: BillingInterval) {
  return interval.toLowerCase() as Lowercase<BillingInterval>;
}

export function toClientReportGenerationStatus(status: ReportStatus) {
  switch (status) {
    case "READY":
      return "ready" as const;
    case "QUEUED":
      return "pending" as const;
    case "REQUIRES_RETRY":
      return "requires_retry" as const;
    case "FAILED":
      return "failed" as const;
    case "GENERATING":
    case "ARCHIVED":
    default:
      return "generating" as const;
  }
}

export function toClientPdfStatus(status: FileProcessingStatus) {
  switch (status) {
    case "READY":
      return "available" as const;
    case "FAILED":
      return "failed" as const;
    case "GENERATING":
    case "PENDING":
    default:
      return "processing" as const;
  }
}

export function toClientDeliveryStatus(status?: DeliveryStatus | null) {
  switch (status) {
    case "SENT":
      return "sent" as const;
    case "FAILED":
    case "BOUNCED":
      return "failed" as const;
    case "QUEUED":
      return "queued" as const;
    case "SKIPPED":
    default:
      return "not_sent" as const;
  }
}

export function toClientOwnedAccessStatus(
  status: ReportStatus | BundleAccessStatus
) {
  switch (status) {
    case "READY":
    case "ACTIVE":
      return "active" as const;
    case "QUEUED":
      return "queued" as const;
    case "REQUIRES_RETRY":
    case "FAILED":
    case "CANCELED":
    case "EXPIRED":
      return "inactive" as const;
    case "GENERATING":
    case "ARCHIVED":
    default:
      return "queued" as const;
  }
}

export function toClientUnlockAccessStatus(status: ReportAccessStatus) {
  switch (status) {
    case "MEMBERSHIP":
      return "subscription_access" as const;
    case "BUNDLE":
      return "bundle_access" as const;
    case "OWNED":
      return "owned_report" as const;
    case "PREVIEW_ONLY":
    default:
      return "preview_only" as const;
  }
}
