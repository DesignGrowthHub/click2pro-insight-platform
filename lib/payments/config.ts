import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getAppBaseUrl, getRazorpayEnvironment, getStripeEnvironment } from "@/lib/config/env";
import type { CheckoutPaymentProvider } from "@/lib/region/types";

type DevPaymentEnv = {
  STRIPE_SECRET_KEY: string | null;
  STRIPE_WEBHOOK_SECRET: string | null;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string | null;
  RAZORPAY_KEY_ID: string | null;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string | null;
  RAZORPAY_KEY_SECRET: string | null;
  RAZORPAY_WEBHOOK_SECRET: string | null;
};

let devPaymentEnvCache: DevPaymentEnv | null | undefined;

function normalizeDevEnvValue(value: string | undefined) {
  const trimmed = value?.trim().replace(/^['"]|['"]$/g, "");
  return trimmed ? trimmed : null;
}

function readDevPaymentEnv(): DevPaymentEnv | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (devPaymentEnvCache !== undefined) {
    return devPaymentEnvCache;
  }

  const envFiles = [join(process.cwd(), ".env.local"), join(process.cwd(), ".env")];
  const collected: Record<string, string | null> = {};

  for (const filePath of envFiles) {
    try {
      const content = readFileSync(filePath, "utf8");

      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#") || !line.includes("=")) {
          continue;
        }

        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();

        if (!(key in collected)) {
          collected[key] = normalizeDevEnvValue(line.slice(separatorIndex + 1));
        }
      }
    } catch {
      continue;
    }
  }

  devPaymentEnvCache = {
    STRIPE_SECRET_KEY: collected.STRIPE_SECRET_KEY ?? null,
    STRIPE_WEBHOOK_SECRET: collected.STRIPE_WEBHOOK_SECRET ?? null,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      collected.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
    RAZORPAY_KEY_ID: collected.RAZORPAY_KEY_ID ?? null,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: collected.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? null,
    RAZORPAY_KEY_SECRET: collected.RAZORPAY_KEY_SECRET ?? null,
    RAZORPAY_WEBHOOK_SECRET: collected.RAZORPAY_WEBHOOK_SECRET ?? null
  };

  return devPaymentEnvCache;
}

function withDevFallback(value: string | null, fallback: string | null) {
  return value ?? fallback;
}

export function normalizeLivePaymentProvider(
  provider: CheckoutPaymentProvider
): "stripe" | "razorpay" | null {
  if (provider === "razorpay" || provider === "razorpay_placeholder") {
    return "razorpay";
  }

  if (provider === "stripe" || provider === "stripe_placeholder") {
    return "stripe";
  }

  return null;
}

export function resolveAppBaseUrl(origin: string) {
  return getAppBaseUrl(origin);
}

export function getStripeConfig() {
  const runtime = getStripeEnvironment();
  const devFallback = readDevPaymentEnv();

  return {
    publishableKey: withDevFallback(
      runtime.publishableKey,
      devFallback?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
    ),
    secretKey: withDevFallback(
      runtime.secretKey,
      devFallback?.STRIPE_SECRET_KEY ?? null
    ),
    webhookSecret: withDevFallback(
      runtime.webhookSecret,
      devFallback?.STRIPE_WEBHOOK_SECRET ?? null
    )
  };
}

export function getRazorpayConfig() {
  const runtime = getRazorpayEnvironment();
  const devFallback = readDevPaymentEnv();

  return {
    keyId: withDevFallback(
      runtime.keyId,
      devFallback?.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
        devFallback?.RAZORPAY_KEY_ID ??
        null
    ),
    secretKey: withDevFallback(
      runtime.secretKey,
      devFallback?.RAZORPAY_KEY_SECRET ?? null
    ),
    webhookSecret: withDevFallback(
      runtime.webhookSecret,
      devFallback?.RAZORPAY_WEBHOOK_SECRET ?? null
    )
  };
}

export function isPaymentProviderLive(provider: CheckoutPaymentProvider) {
  const normalizedProvider = normalizeLivePaymentProvider(provider);

  if (normalizedProvider === "razorpay") {
    const config = getRazorpayConfig();
    return Boolean(config.keyId && config.secretKey);
  }

  if (normalizedProvider === "stripe") {
    const config = getStripeConfig();
    return Boolean(config.secretKey);
  }

  return false;
}
