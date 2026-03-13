import "server-only";

export type RuntimeEnvKey =
  | "DATABASE_URL"
  | "AUTH_SECRET"
  | "NEXTAUTH_SECRET"
  | "NEXTAUTH_URL"
  | "NEXT_PUBLIC_APP_URL"
  | "APP_BASE_URL"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "OPENAI_API_KEY"
  | "OPENAI_MODEL"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  | "RAZORPAY_KEY_ID"
  | "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "RAZORPAY_WEBHOOK_SECRET"
  | "RESEND_API_KEY"
  | "EMAIL_FROM_ADDRESS"
  | "REPORT_ASSET_STORAGE_DIR";

export type EnvFeature =
  | "database"
  | "auth"
  | "app"
  | "google"
  | "ai"
  | "stripe"
  | "razorpay"
  | "email"
  | "storage";

export type EnvDiagnostic = {
  key: RuntimeEnvKey;
  label: string;
  feature: EnvFeature;
  configured: boolean;
  requiredInProduction: boolean;
  status: "configured" | "missing_required" | "missing_optional";
  note: string;
};

type EnvSpec = Omit<EnvDiagnostic, "configured" | "status">;

type RuntimeEnv = Record<RuntimeEnvKey, string | null>;

const ENV_SPECS: EnvSpec[] = [
  {
    key: "DATABASE_URL",
    label: "Database URL",
    feature: "database",
    requiredInProduction: true,
    note: "Required for Prisma, persistent sessions, commerce state, and owned reports."
  },
  {
    key: "AUTH_SECRET",
    label: "Auth secret",
    feature: "auth",
    requiredInProduction: true,
    note: "Used by Auth.js to sign secure sessions."
  },
  {
    key: "NEXTAUTH_SECRET",
    label: "Legacy auth secret",
    feature: "auth",
    requiredInProduction: false,
    note: "Optional legacy alias for AUTH_SECRET."
  },
  {
    key: "NEXTAUTH_URL",
    label: "Auth base URL",
    feature: "auth",
    requiredInProduction: true,
    note: "Used by Auth.js callbacks and server-side session handling."
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    label: "Public app URL",
    feature: "app",
    requiredInProduction: false,
    note: "Optional public URL fallback for links and redirects."
  },
  {
    key: "APP_BASE_URL",
    label: "App base URL",
    feature: "app",
    requiredInProduction: true,
    note: "Used by checkout redirects, email links, and internal asset URLs."
  },
  {
    key: "GOOGLE_CLIENT_ID",
    label: "Google client id",
    feature: "google",
    requiredInProduction: false,
    note: "Optional. Enables Google sign-in when paired with a Google client secret."
  },
  {
    key: "GOOGLE_CLIENT_SECRET",
    label: "Google client secret",
    feature: "google",
    requiredInProduction: false,
    note: "Optional. Enables Google sign-in when paired with a Google client id."
  },
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI API key",
    feature: "ai",
    requiredInProduction: true,
    note: "Enables live premium narrative generation. In production, missing keys now fail report generation instead of falling back to a mock provider."
  },
  {
    key: "OPENAI_MODEL",
    label: "OpenAI model",
    feature: "ai",
    requiredInProduction: false,
    note: "Optional model override for the AI insight engine."
  },
  {
    key: "STRIPE_SECRET_KEY",
    label: "Stripe secret key",
    feature: "stripe",
    requiredInProduction: true,
    note: "Required only when live Stripe checkout is enabled for international users."
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    label: "Stripe webhook secret",
    feature: "stripe",
    requiredInProduction: true,
    note: "Required for server-side Stripe payment confirmation."
  },
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    label: "Stripe publishable key",
    feature: "stripe",
    requiredInProduction: false,
    note: "Optional public Stripe key for future client-side integrations."
  },
  {
    key: "RAZORPAY_KEY_ID",
    label: "Razorpay key id",
    feature: "razorpay",
    requiredInProduction: true,
    note: "Required only when live Razorpay checkout is enabled for India offers."
  },
  {
    key: "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    label: "Public Razorpay key id",
    feature: "razorpay",
    requiredInProduction: false,
    note: "Optional public Razorpay key alias for the checkout modal."
  },
  {
    key: "RAZORPAY_KEY_SECRET",
    label: "Razorpay key secret",
    feature: "razorpay",
    requiredInProduction: true,
    note: "Required for Razorpay order creation and signature validation."
  },
  {
    key: "RAZORPAY_WEBHOOK_SECRET",
    label: "Razorpay webhook secret",
    feature: "razorpay",
    requiredInProduction: true,
    note: "Required for Razorpay webhook verification."
  },
  {
    key: "RESEND_API_KEY",
    label: "Email provider key",
    feature: "email",
    requiredInProduction: true,
    note: "Enables live owned-report delivery through Resend."
  },
  {
    key: "EMAIL_FROM_ADDRESS",
    label: "Email from address",
    feature: "email",
    requiredInProduction: true,
    note: "Used as the sender identity for report delivery emails."
  },
  {
    key: "REPORT_ASSET_STORAGE_DIR",
    label: "Report asset storage directory",
    feature: "storage",
    requiredInProduction: false,
    note: "Optional override for where generated PDF and mock email assets are stored."
  }
];

const warnedMessages = new Set<string>();

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getRuntimeEnv(): RuntimeEnv {
  return {
    DATABASE_URL: normalizeEnvValue(process.env.DATABASE_URL),
    AUTH_SECRET: normalizeEnvValue(process.env.AUTH_SECRET),
    NEXTAUTH_SECRET: normalizeEnvValue(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: normalizeEnvValue(process.env.NEXTAUTH_URL),
    NEXT_PUBLIC_APP_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_APP_URL),
    APP_BASE_URL: normalizeEnvValue(process.env.APP_BASE_URL),
    GOOGLE_CLIENT_ID: normalizeEnvValue(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET),
    OPENAI_API_KEY: normalizeEnvValue(process.env.OPENAI_API_KEY),
    OPENAI_MODEL: normalizeEnvValue(process.env.OPENAI_MODEL),
    STRIPE_SECRET_KEY: normalizeEnvValue(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: normalizeEnvValue(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
    RAZORPAY_KEY_ID: normalizeEnvValue(process.env.RAZORPAY_KEY_ID),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: normalizeEnvValue(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
    RAZORPAY_KEY_SECRET: normalizeEnvValue(process.env.RAZORPAY_KEY_SECRET),
    RAZORPAY_WEBHOOK_SECRET: normalizeEnvValue(process.env.RAZORPAY_WEBHOOK_SECRET),
    RESEND_API_KEY: normalizeEnvValue(process.env.RESEND_API_KEY),
    EMAIL_FROM_ADDRESS: normalizeEnvValue(process.env.EMAIL_FROM_ADDRESS),
    REPORT_ASSET_STORAGE_DIR: normalizeEnvValue(process.env.REPORT_ASSET_STORAGE_DIR)
  };
}

export function getEnvironmentDiagnostics(): EnvDiagnostic[] {
  const env = getRuntimeEnv();

  return ENV_SPECS.map((spec) => {
    const configured =
      spec.key === "AUTH_SECRET"
        ? Boolean(env.AUTH_SECRET ?? env.NEXTAUTH_SECRET)
        : Boolean(env[spec.key]);

    return {
      ...spec,
      configured,
      status: configured
        ? "configured"
        : spec.requiredInProduction
          ? "missing_required"
          : "missing_optional"
    };
  });
}

export function getEnvironmentDiagnosticsSummary() {
  const diagnostics = getEnvironmentDiagnostics();

  return {
    diagnostics,
    missingRequired: diagnostics.filter((item) => item.status === "missing_required").length,
    missingOptional: diagnostics.filter((item) => item.status === "missing_optional").length
  };
}

export function getAuthEnvironment() {
  const env = getRuntimeEnv();

  return {
    secret: env.AUTH_SECRET ?? env.NEXTAUTH_SECRET,
    nextAuthUrl: env.NEXTAUTH_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET
  };
}

export function isGoogleAuthConfigured() {
  const env = getAuthEnvironment();
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export function getAppBaseUrl(fallback: string) {
  const env = getRuntimeEnv();

  return env.APP_BASE_URL ?? env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? fallback;
}

export function getOpenAIEnvironment() {
  const env = getRuntimeEnv();

  return {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL ?? "gpt-4o-mini"
  };
}

export function getStripeEnvironment() {
  const env = getRuntimeEnv();

  return {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET
  };
}

export function getRazorpayEnvironment() {
  const env = getRuntimeEnv();

  return {
    keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? env.RAZORPAY_KEY_ID,
    secretKey: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET
  };
}

export function getEmailEnvironment() {
  const env = getRuntimeEnv();

  return {
    apiKey: env.RESEND_API_KEY,
    fromAddress: env.EMAIL_FROM_ADDRESS
  };
}

export function getReportAssetStorageOverride() {
  return getRuntimeEnv().REPORT_ASSET_STORAGE_DIR;
}

export function warnIfEnvironmentMissing(
  feature: EnvFeature,
  message: string
) {
  const key = `${feature}:${message}`;

  if (warnedMessages.has(key)) {
    return;
  }

  warnedMessages.add(key);
  console.warn(`[insight-env:${feature}] ${message}`);
}
