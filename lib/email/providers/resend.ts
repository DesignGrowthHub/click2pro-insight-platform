import "server-only";

import type {
  ReportEmailProvider,
  SendReportEmailInput,
  SendReportEmailResult
} from "@/lib/email/provider";

const RESEND_API_URL = "https://api.resend.com/emails";

type ResendResponse = {
  id?: string;
  error?: {
    message?: string;
  };
};

export class ResendReportEmailProvider implements ReportEmailProvider {
  readonly providerName = "resend";
  readonly mode = "live" as const;

  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string
  ) {}

  async send(input: SendReportEmailInput): Promise<SendReportEmailResult> {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        attachments: input.attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.contentBase64,
          content_type: attachment.contentType
        }))
      })
    });

    const payload = (await response.json()) as ResendResponse;

    if (!response.ok || !payload.id) {
      throw new Error(
        payload.error?.message ??
          "The email provider did not confirm delivery submission."
      );
    }

    return {
      providerName: this.providerName,
      providerMessageId: payload.id,
      mode: this.mode
    };
  }
}
