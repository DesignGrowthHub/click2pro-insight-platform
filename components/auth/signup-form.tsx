"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mergeAnonymousInsightState } from "@/lib/auth/client-merge";
import {
  ensureProfileCompletionCallback,
  isReportContinuationPath
} from "@/lib/profile/completion";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const initialEmail = searchParams?.get("email") ?? "";
  const isReportContinuation = isReportContinuationPath(callbackUrl);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();

    if (email.trim()) {
      params.set("email", email.trim());
    }

    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }

    const query = params.toString();
    return query ? `/login?${query}` : "/login";
  }, [callbackUrl, email]);
  const profileCompletionUrl = useMemo(
    () => ensureProfileCompletionCallback(callbackUrl),
    [callbackUrl]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        country,
        region
      })
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    if (!response.ok || !payload.ok) {
      setIsSubmitting(false);
      setError(payload.error ?? "We could not create your account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: profileCompletionUrl
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      router.push(loginHref);
      router.refresh();
      return;
    }

    await mergeAnonymousInsightState();
    router.push(signInResult.url ?? profileCompletionUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isReportContinuation ? (
        <div className="rounded-[20px] border border-border/60 bg-surface-elevated px-4 py-3 text-sm leading-7 text-secondary">
          Use the same email from checkout so the purchased report can stay attached to your new account.
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="first-name">
            First name
          </label>
          <Input
            id="first-name"
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="last-name">
            Last name
          </label>
          <Input
            id="last-name"
            autoComplete="family-name"
            placeholder="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="signup-email">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="signup-password">
          Password
        </label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="country">
            Country
          </label>
          <Input
            id="country"
            autoComplete="country-name"
            placeholder="United States"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="region">
            State or region
          </label>
          <Input
            id="region"
            autoComplete="address-level1"
            placeholder="California"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </div>
      </div>
      {error ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <Button size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "Creating account..."
          : isReportContinuation
            ? "Create Account And Continue"
            : "Create Private Account"}
      </Button>
      <p className="text-sm leading-7 text-muted text-center">
        Already have access?{" "}
        <Link href={loginHref} className="font-semibold text-primary hover:text-primary/80">
          Log in
        </Link>
        .
      </p>
    </form>
  );
}
