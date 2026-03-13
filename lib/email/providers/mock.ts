import "server-only";

import { persistEmailPreviewAsset } from "@/lib/storage/report-assets";

import type {
  ReportEmailProvider,
  SendReportEmailInput,
  SendReportEmailResult
} from "@/lib/email/provider";

export class MockReportEmailProvider implements ReportEmailProvider {
  readonly providerName = "mock-email";
  readonly mode = "mock" as const;

  async send(input: SendReportEmailInput): Promise<SendReportEmailResult> {
    await persistEmailPreviewAsset({
      reportId: input.reportId,
      deliveryRecordId: input.deliveryRecordId,
      targetType:
        input.targetType === "ACCOUNT_EMAIL" ? "account_email" : "alternate_email",
      payload: {
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        attachments: input.attachments.map((attachment) => ({
          filename: attachment.filename,
          contentType: attachment.contentType,
          bytes: Buffer.from(attachment.contentBase64, "base64").byteLength
        })),
        note:
          "This preview was generated because no live transactional email provider is configured in the current environment."
      }
    });

    return {
      providerName: this.providerName,
      providerMessageId: `mock_${input.deliveryRecordId}`,
      mode: this.mode
    };
  }
}
