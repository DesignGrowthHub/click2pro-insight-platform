export type RegionKey = "international" | "india";
export type CountryBucket = "international" | "india" | "unknown";
export type CurrencyCode = "USD" | "INR";
export type CommercePaymentProvider = "stripe" | "razorpay";
export type CheckoutPaymentProvider =
  | "stripe"
  | "stripe_placeholder"
  | "razorpay"
  | "razorpay_placeholder";
export type CommerceOfferType =
  | "single_report"
  | "premium_report"
  | "membership_monthly"
  | "membership_annual"
  | "report_plus_explanation_30"
  | "report_plus_explanation_60";
export type CommerceOfferProductType =
  | "single_report"
  | "premium_report"
  | "subscription"
  | "explanation_session";
export type MembershipPlan = "monthly" | "annual";
export type ExplanationSessionDuration = 30 | 60;
export type RegionResolutionSource =
  | "authenticated_profile"
  | "geo_header"
  | "cookie_preference"
  | "explicit_override"
  | "default";

export type OfferVisibilityFlags = {
  pricingPage: boolean;
  unlockFlow: boolean;
  assessmentCue: boolean;
  dashboard: boolean;
  recommendations: boolean;
};

export type OfferCatalogEntry = {
  id: CommerceOfferType;
  regionKey: RegionKey;
  title: string;
  shortLabel: string;
  description: string;
  productType: CommerceOfferProductType;
  currencyCode: CurrencyCode;
  paymentProvider: CommercePaymentProvider;
  priceMinor: number;
  cadenceLabel?: string | null;
  secondaryOfferId?: CommerceOfferType | null;
  membershipPlan?: MembershipPlan | null;
  explanationSessionDuration?: ExplanationSessionDuration | null;
  featured?: boolean;
  badge?: string | null;
  supportingNote?: string | null;
  visibility: OfferVisibilityFlags;
};

export type RegionCommerceConfig = {
  key: RegionKey;
  label: string;
  countryBucket: CountryBucket;
  locale: "en-US" | "en-IN";
  currencyCode: CurrencyCode;
  paymentProvider: CommercePaymentProvider;
  annualMembershipEmphasis: boolean;
  supportsMembership: boolean;
  supportsPsychologistExplanation: boolean;
};

export type RegionPricingLabels = {
  singleInsightReport: string;
  premiumDeepInsightReport: string;
  membershipMonthly: string | null;
  membershipAnnual: string | null;
  membershipMonthlyPlain: string | null;
  membershipAnnualPlain: string | null;
  explanationThirtyMinutes: string | null;
  explanationSixtyMinutes: string | null;
  annualBadge: string | null;
  monthlyBadge: string | null;
};

export type ResolvedRegionContext = {
  regionKey: RegionKey;
  source: RegionResolutionSource;
  countryBucket: CountryBucket;
  currencyCode: CurrencyCode;
  paymentProvider: CommercePaymentProvider;
  locale: "en-US" | "en-IN";
  supportsMembership: boolean;
  supportsPsychologistExplanation: boolean;
};

export type RegionPreferencePayload = {
  regionKey: RegionKey;
};
