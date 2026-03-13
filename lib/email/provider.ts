import "server-only";

import { getEmailEnvironment, warnIfEnvironmentMissing } from "@/lib/config/env";
import { MockReportEmailProvider } from "@/lib/email/providers/mock";
import { ResendReportEmailProvider } from "@/lib/email/providers/resend";

export type ReportEmailAttachment = {
  filename: string;
  contentType: string;
  contentBase64: string;
};

export type SendReportEmailInput = {
  reportId: string;
  deliveryRecordId: string;
  targetType: "ACCOUNT_EMAIL" | "ALTERNATE_EMAIL";
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments: ReportEmailAttachment[];
};

export type SendReportEmailResult = {
  providerName: string;
  providerMessageId: string | null;
  mode: "live" | "mock";
};

export interface ReportEmailProvider {
  providerName: string;
  mode: "live" | "mock";
  send(input: SendReportEmailInput): Promise<SendReportEmailResult>;
}

function getEmailConfiguration() {
  const environment = getEmailEnvironment();

  return {
    apiKey: environment.apiKey ?? "",
    fromAddress: environment.fromAddress ?? ""
  };
}

export function getConfiguredReportEmailProvider() {
  const config = getEmailConfiguration();

  if (config.apiKey && config.fromAddress) {
    return new ResendReportEmailProvider(config.apiKey, config.fromAddress);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "A live report email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM_ADDRESS."
    );
  }

  warnIfEnvironmentMissing(
    "email",
    "RESEND_API_KEY or EMAIL_FROM_ADDRESS is missing, so owned-report email delivery is using the mock preview provider."
  );
  return new MockReportEmailProvider();
}
