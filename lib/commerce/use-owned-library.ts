"use client";

import { useEffect, useState } from "react";

import { getAccessStateForAssessment, getOwnedReportBySlug } from "./access";
import {
  COMMERCE_STATE_EVENT,
  getSeededCommerceState,
  loadCommerceState,
  loadPreviewTestingCommerceState
} from "./ownership-store";
import type { CommercePersistenceMode, CommerceState } from "./types";

function loadFallbackLibraryState() {
  if (process.env.NODE_ENV === "development") {
    return loadPreviewTestingCommerceState();
  }

  return getSeededCommerceState();
}

export function useOwnedLibrary(assessmentSlug?: string) {
  const [library, setLibrary] = useState<CommerceState>(loadFallbackLibraryState());
  const [dataSource, setDataSource] =
    useState<CommercePersistenceMode>("local_demo");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch("/api/commerce/library", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Falling back to local demo ownership state.");
        }

        const nextLibrary = (await response.json()) as CommerceState;

        if (!cancelled) {
          setLibrary(nextLibrary);
          setDataSource("database");
          setHasHydrated(true);
        }

        return;
      } catch {
        if (!cancelled) {
          setLibrary(loadFallbackLibraryState());
          setDataSource("local_demo");
          setHasHydrated(true);
        }
      }
    };

    const handleSync = () => {
      void sync();
    };

    void sync();
    window.addEventListener("storage", handleSync);
    window.addEventListener(COMMERCE_STATE_EVENT, handleSync);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(COMMERCE_STATE_EVENT, handleSync);
    };
  }, []);

  const accessState = assessmentSlug
    ? getAccessStateForAssessment(library, assessmentSlug)
    : null;
  const ownedReport = assessmentSlug
    ? getOwnedReportBySlug(library, assessmentSlug)
    : null;

  return {
    library,
    dataSource,
    hasHydrated,
    accessState,
    ownedReport,
    refreshLibrary() {
      if (dataSource === "database") {
        void fetch("/api/commerce/library", { cache: "no-store" })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Unable to refresh database-backed library.");
            }

            return response.json() as Promise<CommerceState>;
          })
          .then((nextLibrary) => {
            setLibrary(nextLibrary);
          })
          .catch(() => {
            setLibrary(loadFallbackLibraryState());
            setDataSource("local_demo");
          });
        return;
      }

      setLibrary(loadFallbackLibraryState());
    }
  };
}
