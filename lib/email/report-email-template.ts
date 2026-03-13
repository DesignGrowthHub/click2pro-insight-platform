import "server-only";

type ReportEmailTemplateInput = {
  recipientName: string | null;
  reportTitle: string;
  summaryLabel: string;
  summaryNarrative: string;
  viewUrl: string;
};

export function buildReportEmailSubject(reportTitle: string) {
  return `${reportTitle} | Click2Pro Insight Platform`;
}

export function buildReportEmailText(input: ReportEmailTemplateInput) {
  const greeting = input.recipientName ? `Hello ${input.recipientName},` : "Hello,";

  return [
    greeting,
    "",
    `Your saved report, ${input.reportTitle}, is attached as a PDF and remains available in your Click2Pro Insight library.`,
    "",
    `Current pattern read: ${input.summaryLabel}`,
    "",
    input.summaryNarrative,
    "",
    `Open the saved report: ${input.viewUrl}`,
    "",
    "This report is structured for reflection and pattern recognition. It does not act as a diagnosis or treatment plan.",
    "",
    "Click2Pro Insight Platform"
  ].join("\n");
}

export function buildReportEmailHtml(input: ReportEmailTemplateInput) {
  const greeting = input.recipientName ? `Hello ${input.recipientName},` : "Hello,";

  return `
    <div style="background:#0f172a;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#f8fafc;">
      <div style="max-width:680px;margin:0 auto;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#f8fafc;">${greeting}</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#f8fafc;">Your saved insight report is ready</h1>
        <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#94a3b8;">
          <strong style="color:#f8fafc;">${input.reportTitle}</strong> is attached as a PDF and remains available in your private report library.
        </p>
        <div style="border:1px solid rgba(59,130,246,0.18);background:rgba(59,130,246,0.08);border-radius:18px;padding:18px 20px;margin:0 0 20px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;">Current pattern read</p>
          <p style="margin:0 0 8px;font-size:18px;line-height:1.5;color:#f8fafc;">${input.summaryLabel}</p>
          <p style="margin:0;font-size:15px;line-height:1.8;color:#cbd5e1;">${input.summaryNarrative}</p>
        </div>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#94a3b8;">
          The report is structured for reflection and pattern recognition. It does not act as a diagnosis or treatment plan.
        </p>
        <a href="${input.viewUrl}" style="display:inline-block;background:#3b82f6;color:#f8fafc;text-decoration:none;padding:14px 20px;border-radius:16px;font-size:15px;font-weight:600;">
          Open Your Saved Report
        </a>
      </div>
    </div>
  `.trim();
}
