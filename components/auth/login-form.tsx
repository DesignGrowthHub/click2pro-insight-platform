"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mergeAnonymousInsightState } from "@/lib/auth/client-merge";
import {
  ensureProfileCompletionCallback,
  isReportContinuationPath
} from "@/lib/profile/completion";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const continuationUrl = ensureProfileCompletionCallback(callbackUrl);
  const initialEmail = searchParams?.get("email") ?? "";
  const authError = searchParams?.get("error");
  const isReportContinuation = isReportContinuationPath(callbackUrl);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const forgotPasswordHref = useMemo(() => {
    const params = new URLSearchParams();

    if (email.trim()) {
      params.set("email", email.trim());
    }

    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }

    const query = params.toString();
    return query ? `/forgot-password?${query}` : "/forgot-password";
  }, [callbackUrl, email]);

  const signupHref = useMemo(() => {
    const params = new URLSearchParams();

    if (email.trim()) {
      params.set("email", email.trim());
    }

    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }

    const query = params.toString();
    return query ? `/signup?${query}` : "/signup";
  }, [callbackUrl, email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: continuationUrl
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("The email or password did not match an existing account.");
      return;
    }

    await mergeAnonymousInsightState();
    router.push(result.url ?? continuationUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isReportContinuation ? (
        <div className="rounded-[20px] border border-border/60 bg-surface-elevated px-4 py-3 text-sm leading-7 text-secondary">
          Sign in with the same email used during checkout and we will continue you directly to the saved report.
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <Link
            href={forgotPasswordHref}
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : authError ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {authError === "AccessDenied"
            ? "Google sign-in could not be completed with this account. Try the same email again or continue with email and password."
            : "Sign-in could not be completed. Please try again."}
        </div>
      ) : null}
      <Button size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "Signing in..."
          : isReportContinuation
            ? "Sign In And Continue"
            : "Open My Insight Library"}
      </Button>
      <p className="text-sm leading-7 text-muted text-center">
        New to the platform?{" "}
        <Link href={signupHref} className="font-semibold text-primary hover:text-primary/80">
          Create account
        </Link>
        .
      </p>
    </form>
  );
}
