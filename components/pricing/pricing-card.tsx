import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  PricingCheckoutButton,
  type PricingCheckoutAssessmentContext,
  type PricingCheckoutConfig
} from "./pricing-checkout-button";

type PricingCardProps = {
  id?: string;
  name: string;
  price: string;
  cadence: string;
  secondaryPrice?: string;
  secondaryCadence?: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  badge?: string;
  featured?: boolean;
  supportingNote?: string;
  comparisonLabel?: string;
  checkoutConfig?: PricingCheckoutConfig;
  assessmentContext?: PricingCheckoutAssessmentContext;
  callbackUrl?: string;
};

export function PricingCard({
  name,
  price,
  cadence,
  secondaryPrice,
  secondaryCadence,
  description,
  features,
  cta,
  href = "/assessments",
  badge,
  featured = false,
  supportingNote,
  comparisonLabel,
  checkoutConfig,
  assessmentContext,
  callbackUrl
}: PricingCardProps) {
  const visibleFeatures = features.slice(0, 3);

  return (
    <Card
      variant={featured ? "raised" : "default"}
      className={cn(
        "flex h-full flex-col overflow-hidden",
        featured && "border-primary/30 bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(17,24,39,0.92))]"
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={featured ? "accent" : "subtle"}>
            {badge ?? (featured ? "Recommended" : "Flexible")}
          </Badge>
          {comparisonLabel ? (
            <p className="text-sm font-medium text-muted">{comparisonLabel}</p>
          ) : (
            <p className="text-sm uppercase tracking-[0.18em] text-muted">{cadence}</p>
          )}
        </div>
        <CardTitle className="text-[1.55rem]">{name}</CardTitle>
        <div className="surface-block-strong rounded-[24px] px-5 py-5">
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[2.85rem] font-semibold tracking-tight text-foreground">
              {price}
            </span>
            <span className="pb-1 text-base text-muted">{cadence}</span>
          </div>
          {secondaryPrice && secondaryCadence ? (
            <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="insight-label">Flexible option</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[1.65rem] font-semibold tracking-tight text-foreground">
                  {secondaryPrice}
                </span>
                <span className="pb-0.5 text-sm text-muted">{secondaryCadence}</span>
              </div>
            </div>
          ) : null}
          {supportingNote ? (
            <p className="mt-3 text-sm leading-7 text-muted">{supportingNote}</p>
          ) : null}
        </div>
        <p className="text-[0.98rem] leading-7 text-muted">{description}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="surface-block px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-3">
            {visibleFeatures.map((feature, index) => (
              <div
                key={feature}
                className={cn(
                  "flex items-start gap-3 text-[0.98rem] leading-7 text-muted",
                  index > 0 && "border-t border-white/8 pt-3"
                )}
              >
                <span className="mt-2 h-2 w-2 rounded-full bg-primary/80" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {checkoutConfig && assessmentContext ? (
          <PricingCheckoutButton
            label={cta}
            size="lg"
            variant={featured ? "primary" : "outline"}
            className="w-full"
            assessmentContext={assessmentContext}
            checkoutConfig={checkoutConfig}
            callbackUrl={callbackUrl}
          />
        ) : (
          <LinkButton
            href={href}
            size="lg"
            variant={featured ? "primary" : "outline"}
            className="w-full"
          >
            {cta}
          </LinkButton>
        )}
      </CardFooter>
    </Card>
  );
}
