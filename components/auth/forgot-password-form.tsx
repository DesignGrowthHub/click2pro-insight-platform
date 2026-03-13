"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isReportContinuationPath } from "@/lib/profile/completion";

type ForgotPasswordFormProps = {
  initialEmail?: string;
  callbackUrl?: string | null;
};

export function ForgotPasswordForm({
  initialEmail = "",
  callbackUrl = null
}: ForgotPasswordFormProps) {
  const isReportContinuation = isReportContinuationPath(callbackUrl);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        callbackUrl
      })
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    setIsSubmitting(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "We could not send the reset email.");
      return;
    }

    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-50">
          If an account exists for <span className="font-semibold">{email}</span>, a secure reset link is on its way.
        </div>
        <p className="text-sm leading-7 text-muted">
          {isReportContinuation
            ? "Once you reset the password, sign in with the same email and we will continue you back to the saved report."
            : "The link expires after a short time. If it does not arrive, check spam or request a fresh one."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            Send another link
          </Button>
          <Link
            href={
              callbackUrl
                ? `/login?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
                : `/login?email=${encodeURIComponent(email)}`
            }
            className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-primary transition hover:text-primary/80"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="forgot-password-email">
          Email
        </label>
        <Input
          id="forgot-password-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {error ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <Button size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending reset link..." : "Send Secure Reset Link"}
      </Button>
      <p className="text-center text-sm leading-7 text-muted">
        Remembered your password?{" "}
        <Link
          href={
            callbackUrl
              ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/login"
          }
          className="font-semibold text-primary hover:text-primary/80"
        >
          Return to login
        </Link>
        .
      </p>
    </form>
  );
}
