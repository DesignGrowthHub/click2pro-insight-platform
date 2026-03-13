"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isReportContinuationPath } from "@/lib/profile/completion";

type ResetPasswordFormProps = {
  token: string;
  emailLabel: string;
  callbackUrl?: string | null;
};

export function ResetPasswordForm({
  token,
  emailLabel,
  callbackUrl = null
}: ResetPasswordFormProps) {
  const isReportContinuation = isReportContinuationPath(callbackUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match yet.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        password
      })
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    setIsSubmitting(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "We could not reset your password.");
      return;
    }

    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-50">
          Your password has been updated for <span className="font-semibold">{emailLabel}</span>.
        </div>
        <p className="text-sm leading-7 text-muted">
          {isReportContinuation
            ? "You can sign in now and continue directly to the saved report."
            : "You can sign in now and return to your private report library."}
        </p>
        <Link
          href={
            callbackUrl
              ? `/login?email=${encodeURIComponent(emailLabel)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
              : `/login?email=${encodeURIComponent(emailLabel)}`
          }
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="reset-password">
          New password
        </label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="reset-password-confirm">
          Confirm password
        </label>
        <Input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      {error ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <Button size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Updating password..." : "Save Password"}
      </Button>
      <p className="text-center text-sm leading-7 text-muted">
        Need a fresh link?{" "}
        <Link
          href={
            callbackUrl
              ? `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/forgot-password"
          }
          className="font-semibold text-primary hover:text-primary/80"
        >
          Request another reset email
        </Link>
        .
      </p>
    </form>
  );
}
