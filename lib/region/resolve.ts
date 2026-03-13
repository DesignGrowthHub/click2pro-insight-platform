import type {
  CommercePaymentProvider,
  RegionKey,
  ResolvedRegionContext,
  RegionResolutionSource
} from "@/lib/region/types";
import { getRegionConfig } from "@/lib/region/catalog";

type RegionResolutionInput = {
  explicitRegionKey?: string | null;
  cookieRegionKey?: string | null;
  country?: string | null;
  region?: string | null;
  currency?: string | null;
  preferredPaymentProvider?: string | null;
};

const INDIA_MATCHERS = new Set(["india", "in", "ind"]);
const RAZORPAY_MATCHERS = new Set(["razorpay"]);
const INR_MATCHERS = new Set(["inr"]);

export function isRegionKey(value: string | null | undefined): value is RegionKey {
  return value === "international" || value === "india";
}

function matchesIndia(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return INDIA_MATCHERS.has(normalized) || normalized.includes("india");
}

function inferRegionFromProfile(input: RegionResolutionInput): RegionKey | null {
  if (matchesIndia(input.country) || matchesIndia(input.region)) {
    return "india";
  }

  if (input.currency && INR_MATCHERS.has(input.currency.trim().toLowerCase())) {
    return "india";
  }

  if (
    input.preferredPaymentProvider &&
    RAZORPAY_MATCHERS.has(input.preferredPaymentProvider.trim().toLowerCase())
  ) {
    return "india";
  }

  return null;
}

function buildResolvedContext(
  regionKey: RegionKey,
  source: RegionResolutionSource
): ResolvedRegionContext {
  const region = getRegionConfig(regionKey);

  return {
    regionKey,
    source,
    countryBucket: region.countryBucket,
    currencyCode: region.currencyCode,
    paymentProvider: region.paymentProvider,
    locale: region.locale,
    supportsMembership: region.supportsMembership,
    supportsPsychologistExplanation: region.supportsPsychologistExplanation
  };
}

export function resolveRegionContext(
  input: RegionResolutionInput = {}
): ResolvedRegionContext {
  if (isRegionKey(input.explicitRegionKey)) {
    return buildResolvedContext(input.explicitRegionKey, "explicit_override");
  }

  const profileRegion = inferRegionFromProfile(input);

  if (profileRegion) {
    return buildResolvedContext(profileRegion, "authenticated_profile");
  }

  if (isRegionKey(input.cookieRegionKey)) {
    return buildResolvedContext(input.cookieRegionKey, "cookie_preference");
  }

  return buildResolvedContext("international", "default");
}

export function resolvePaymentProviderLabel(
  provider: CommercePaymentProvider,
  configured: boolean
) {
  if (provider === "stripe") {
    return configured ? "Stripe" : "Stripe placeholder";
  }

  return configured ? "Razorpay" : "Razorpay placeholder";
}
