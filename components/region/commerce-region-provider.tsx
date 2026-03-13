"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { getMembershipContent } from "@/lib/membership/content";
import { getOfferCatalog, getPricingLabels, getRegionConfig } from "@/lib/pricing";
import { resolveRegionContext } from "@/lib/region/resolve";
import type {
  RegionKey,
  RegionPreferencePayload,
  ResolvedRegionContext
} from "@/lib/region/types";

type CommerceRegionContextValue = ResolvedRegionContext & {
  hasHydrated: boolean;
  setRegionPreference: (regionKey: RegionKey) => Promise<void>;
};

const defaultContext = resolveRegionContext();

const CommerceRegionContext = createContext<CommerceRegionContextValue>({
  ...defaultContext,
  hasHydrated: false,
  setRegionPreference: async () => undefined
});

export function CommerceRegionProvider({
  initialContext,
  children
}: {
  initialContext?: ResolvedRegionContext;
  children: ReactNode;
}) {
  const [context, setContext] = useState<ResolvedRegionContext>(
    initialContext ?? defaultContext
  );
  const [hasHydrated, setHasHydrated] = useState(Boolean(initialContext));

  useEffect(() => {
    if (initialContext) {
      return;
    }

    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch("/api/commerce/context", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not resolve commerce region.");
        }

        const payload = (await response.json()) as ResolvedRegionContext;

        if (!cancelled) {
          setContext(payload);
        }
      } catch {
        if (!cancelled) {
          setContext(defaultContext);
        }
      } finally {
        if (!cancelled) {
          setHasHydrated(true);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [initialContext]);

  async function setRegionPreference(regionKey: RegionKey) {
    setContext(resolveRegionContext({ explicitRegionKey: regionKey }));

    const response = await fetch("/api/commerce/region", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        regionKey
      } satisfies RegionPreferencePayload)
    });

    if (!response.ok) {
      throw new Error("Unable to save region preference.");
    }

    const payload = (await response.json()) as ResolvedRegionContext;
    setContext(payload);
    setHasHydrated(true);
  }

  const value = useMemo(
    () => ({
      ...context,
      hasHydrated,
      setRegionPreference
    }),
    [context, hasHydrated]
  );

  return (
    <CommerceRegionContext.Provider value={value}>
      {children}
    </CommerceRegionContext.Provider>
  );
}

export function useCommerceRegion() {
  const context = useContext(CommerceRegionContext);

  return {
    ...context,
    regionConfig: getRegionConfig(context.regionKey),
    pricingLabels: getPricingLabels(context.regionKey),
    offerCatalog: getOfferCatalog(context.regionKey),
    membershipContent: getMembershipContent(context.regionKey)
  };
}
