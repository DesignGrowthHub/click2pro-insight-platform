"use client";

import { useState } from "react";

import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RegionKey } from "@/lib/region/types";

const options: Array<{
  regionKey: RegionKey;
  label: string;
}> = [
  {
    regionKey: "international",
    label: "International"
  },
  {
    regionKey: "india",
    label: "India"
  }
];

export function RegionPreferenceControl() {
  const { regionKey, hasHydrated, setRegionPreference } = useCommerceRegion();
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextRegionKey: RegionKey) {
    setIsSaving(true);

    try {
      await setRegionPreference(nextRegionKey);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Pricing region</Badge>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">
            {hasHydrated ? "Saved in this browser" : "Defaulting now"}
          </span>
        </div>
        <p className="text-sm leading-7 text-muted">
          Switch the commerce view for testing or if your region has not been resolved yet.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.regionKey}
            variant={regionKey === option.regionKey ? "primary" : "outline"}
            size="sm"
            disabled={isSaving}
            onClick={() => {
              void handleChange(option.regionKey);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
