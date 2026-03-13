import {
  formatMoney,
  getAdminPricingReference,
  getOfferCatalog,
  getOfferByType,
  getPricingLabels as buildPricingLabels,
  getRegionConfig
} from "@/lib/region/catalog";
import type { RegionKey } from "@/lib/region/types";

export function formatUsd(cents: number) {
  return formatMoney(cents, "USD", "en-US");
}

export function formatCurrencyByRegion(cents: number, regionKey: RegionKey) {
  const region = getRegionConfig(regionKey);
  return formatMoney(cents, region.currencyCode, region.locale);
}

export function getPlatformPricing(regionKey: RegionKey) {
  return {
    singleInsightReportCents:
      getOfferByType(regionKey, "single_report")?.priceMinor ?? 0,
    premiumDeepInsightReportCents:
      getOfferByType(regionKey, "premium_report")?.priceMinor ?? 0,
    membershipMonthlyCents:
      getOfferByType(regionKey, "membership_monthly")?.priceMinor ?? 0,
    membershipAnnualCents:
      getOfferByType(regionKey, "membership_annual")?.priceMinor ?? 0,
    explanationThirtyMinutesCents:
      getOfferByType(regionKey, "report_plus_explanation_30")?.priceMinor ?? 0,
    explanationSixtyMinutesCents:
      getOfferByType(regionKey, "report_plus_explanation_60")?.priceMinor ?? 0
  } as const;
}

export const platformPricing = getPlatformPricing("international");
export const pricingLabels = buildPricingLabels("international");

export function getPricingLabels(regionKey: RegionKey) {
  return buildPricingLabels(regionKey);
}

export { getOfferCatalog, getOfferByType, getRegionConfig };
export const adminPricingReference = getAdminPricingReference();
