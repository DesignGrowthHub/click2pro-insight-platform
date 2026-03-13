import "server-only";

import { warnIfEnvironmentMissing } from "@/lib/config/env";
import { createMockAIReportProvider } from "@/lib/ai/reporting/mock-provider";
import {
  createOpenAIReportProvider,
  hasOpenAIReportProviderConfig
} from "@/lib/ai/reporting/openai-provider";

export function getConfiguredAIReportProvider() {
  if (hasOpenAIReportProviderConfig()) {
    return createOpenAIReportProvider();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "OPENAI_API_KEY is missing in production. Paid report generation cannot fall back to the mock AI provider."
    );
  }

  warnIfEnvironmentMissing(
    "ai",
    "OPENAI_API_KEY is missing, so report narrative generation is using the safe mock provider."
  );
  return createMockAIReportProvider();
}

export function getAIProviderRuntimeMode() {
  return hasOpenAIReportProviderConfig() ? "openai" : "mock";
}
