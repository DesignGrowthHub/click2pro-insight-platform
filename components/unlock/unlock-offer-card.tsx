import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LibraryIcon,
  ReportIcon,
  SubscriptionIcon
} from "@/components/ui/icons";
import type { ReportUnlockOffer } from "@/lib/offers/report-offers";
import { cn } from "@/lib/utils";

type UnlockOfferCardProps = {
  offer: ReportUnlockOffer;
  onChoose: (offer: ReportUnlockOffer) => void;
  className?: string;
};

function iconForOffer(offer: ReportUnlockOffer) {
  if (offer.productType === "subscription") {
    return <SubscriptionIcon className="h-5 w-5" />;
  }

  if (offer.pricingTier === "explanation") {
    return <ReportIcon className="h-5 w-5" />;
  }

  if (offer.pricingTier === "premium" || offer.productType === "bundle") {
    return <LibraryIcon className="h-5 w-5" />;
  }

  return <ReportIcon className="h-5 w-5" />;
}

export function UnlockOfferCard({
  offer,
  onChoose,
  className
}: UnlockOfferCardProps) {
  const isMembership = offer.productType === "subscription";
  const isPremium = offer.pricingTier === "premium";
  const isExplanation = offer.pricingTier === "explanation";

  return (
    <Card
      hoverable
      className={cn(
        "h-full",
        isMembership &&
          "border-primary/18 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(17,24,39,0.92))]",
        isExplanation &&
          "border-white/14 bg-[linear-gradient(180deg,rgba(16,24,40,0.98),rgba(17,24,39,0.94))]",
        isPremium &&
          "border-primary/16 bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(17,24,39,0.94))]",
        className
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={isMembership ? "accent" : "outline"}>{offer.badge}</Badge>
            <Badge variant="outline">{offer.label}</Badge>
          </div>
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-foreground",
              (isMembership || isPremium) && "border-primary/20 bg-primary/10 text-primary"
            )}
          >
            {iconForOffer(offer)}
          </span>
        </div>
        <div className="space-y-3">
          <CardTitle className="text-[1.32rem]">{offer.title}</CardTitle>
          <p className="text-sm leading-7 text-muted">{offer.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="surface-block-strong p-4 sm:p-5">
          <p className="insight-label">Price</p>
          <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-foreground">
            {offer.priceLabel}
          </p>
          {offer.secondaryPriceLabel ? (
            <p className="mt-1 text-sm leading-6 text-muted">{offer.secondaryPriceLabel}</p>
          ) : null}
        </div>
        <div className="space-y-3">
          {offer.benefits.slice(0, 2).map((item) => (
            <div
              key={item}
              className="surface-block px-4 py-4 text-sm leading-7 text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="text-sm leading-7 text-muted">{offer.reassurance}</p>
        <Button
          size="lg"
          variant={isMembership || isPremium ? "primary" : "outline"}
          className="w-full"
          onClick={() => onChoose(offer)}
        >
          {offer.ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
