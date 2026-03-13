import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { getAppBaseUrl, getEmailEnvironment, warnIfEnvironmentMissing } from "@/lib/config/env";
import { writeStoredAsset } from "@/lib/storage/report-assets";

const RESEND_API_URL = "https://api.resend.com/emails";

type SendPasswordResetEmailInput = {
  to: string;
  fullName?: string | null;
  resetToken: string;
  expiresAt: Date;
  origin: string;
  callbackUrl?: string | null;
};

function sanitizeCallbackUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function buildResetUrl(
  origin: string,
  resetToken: string,
  callbackUrl?: string | null
) {
  const baseUrl = getAppBaseUrl(origin);
  const url = new URL("/reset-password", baseUrl);
  url.searchParams.set("token", resetToken);
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);

  if (safeCallbackUrl) {
    url.searchParams.set("callbackUrl", safeCallbackUrl);
  }

  return url.toString();
}

function formatExpiry(expiresAt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(expiresAt);
}

function buildEmailContent(input: SendPasswordResetEmailInput) {
  const resetUrl = buildResetUrl(input.origin, input.resetToken, input.callbackUrl);
  const displayName = input.fullName?.trim() || "there";
  const expiryLabel = formatExpiry(input.expiresAt);
  const subject = "Reset your Click2Pro Insight password";
  const html = `
    <div style="background:#0b1020;padding:32px 20px;font-family:Inter,Arial,sans-serif;color:#e5edf6;">
      <div style="max-width:620px;margin:0 auto;background:#11182b;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8ea3b8;">Private account access</p>
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:#ffffff;">Reset your password</h1>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#d4dde8;">Hi ${displayName},</p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#d4dde8;">A password reset was requested for your Click2Pro Insight account. Use the secure link below to choose a new password.</p>
        <div style="margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#72a9ff;color:#07111f;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px;">Reset password</a>
        </div>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#9eb1c4;">This link expires around ${expiryLabel}. If you did not request this, you can ignore this email and your current password will stay unchanged.</p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#7f93a7;">If the button does not open, copy and paste this link into your browser:</p>
        <p style="margin:10px 0 0;font-size:13px;line-height:1.8;word-break:break-all;color:#c0d1e2;">${resetUrl}</p>
      </div>
    </div>
  `;
  const text = [
    `Hi ${displayName},`,
    "",
    "A password reset was requested for your Click2Pro Insight account.",
    `Use this secure link to choose a new password: ${resetUrl}`,
    "",
    `This link expires around ${expiryLabel}.`,
    "If you did not request this, you can ignore this email."
  ].join("\n");

  return {
    resetUrl,
    subject,
    html,
    text
  };
}

async function sendLivePasswordResetEmail(input: {
  apiKey: string;
  fromAddress: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: input.fromAddress,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string;
        error?: {
          message?: string;
        };
      }
    | null;

  if (!response.ok || !payload?.id) {
    throw new Error(
      payload?.error?.message ??
        "The email provider did not confirm the password reset email."
    );
  }

  return payload.id;
}

async function persistMockPasswordResetEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  resetUrl: string;
}) {
  const digest = createHash("sha1").update(`${input.to}:${input.resetUrl}`).digest("hex");

  await writeStoredAsset(
    `email-previews/password-reset/${digest}-${randomUUID()}.json`,
    JSON.stringify(
      {
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        resetUrl: input.resetUrl,
        note:
          "This password reset preview was generated because no live transactional email provider is configured in the current environment."
      },
      null,
      2
    )
  );
}

export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput) {
  const emailEnvironment = getEmailEnvironment();
  const emailContent = buildEmailContent(input);

  if (emailEnvironment.apiKey && emailEnvironment.fromAddress) {
    await sendLivePasswordResetEmail({
      apiKey: emailEnvironment.apiKey,
      fromAddress: emailEnvironment.fromAddress,
      to: input.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    return {
      mode: "live" as const,
      resetUrl: emailContent.resetUrl
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "A live email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM_ADDRESS."
    );
  }

  warnIfEnvironmentMissing(
    "email",
    "RESEND_API_KEY or EMAIL_FROM_ADDRESS is missing, so password reset email delivery is using a local preview file."
  );

  await persistMockPasswordResetEmail({
    to: input.to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    resetUrl: emailContent.resetUrl
  });

  return {
    mode: "mock" as const,
    resetUrl: emailContent.resetUrl
  };
}
