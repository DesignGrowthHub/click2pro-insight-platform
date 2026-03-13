"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { mergeAnonymousInsightState } from "@/lib/auth/client-merge";
import { useCheckoutCompletion } from "@/components/checkout/use-checkout-completion";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildProfileCompletionUrl } from "@/lib/profile/completion";

export function CheckoutClaimShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentId = searchParams?.get("intent");
  const mode = searchParams?.get("mode");
  const provider = searchParams?.get("provider");
  const { result, errorMessage } = useCheckoutCompletion(intentId, mode, provider);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimFullName, setClaimFullName] = useState("");
  const [claimPassword, setClaimPassword] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const reportViewUrl = result?.ownedReport?.viewUrl ?? "/dashboard";
  const checkoutEmail = result?.checkoutEmail ?? claimEmail.trim();
  const profileCompletionUrl = useMemo(
    () => buildProfileCompletionUrl(reportViewUrl, true),
    [reportViewUrl]
  );
  const loginUrl = useMemo(() => {
    const params = new URLSearchParams({
      callbackUrl: profileCompletionUrl
    });

    if (checkoutEmail) {
      params.set("email", checkoutEmail);
    }

    return `/login?${params.toString()}`;
  }, [checkoutEmail, profileCompletionUrl]);
  const forgotPasswordUrl = useMemo(() => {
    const params = new URLSearchParams({
      callbackUrl: profileCompletionUrl
    });

    if (checkoutEmail) {
      params.set("email", checkoutEmail);
    }

    return `/forgot-password?${params.toString()}`;
  }, [checkoutEmail, profileCompletionUrl]);

  async function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!intentId || !checkoutEmail) {
      return;
    }

    try {
      setIsClaiming(true);
      setClaimError(null);

      const response = await fetch("/api/auth/claim-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intentId,
          email: checkoutEmail,
          password: claimPassword,
          fullName: claimFullName
        })
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "The account could not be claimed.");
      }

      const signInResult = await signIn("credentials", {
        email: checkoutEmail,
        password: claimPassword,
        redirect: false,
        callbackUrl: profileCompletionUrl
      });

      if (!signInResult || signInResult.error) {
        router.push(loginUrl);
        router.refresh();
        return;
      }

      await mergeAnonymousInsightState();
      router.push(signInResult.url ?? profileCompletionUrl);
      router.refresh();
    } catch (error) {
      setClaimError(
        error instanceof Error ? error.message : "The account could not be claimed."
      );
    } finally {
      setIsClaiming(false);
    }
  }

  if (!intentId) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <Badge variant="outline">Account claim</Badge>
          <CardTitle className="text-[1.8rem]">
            This account-claim step needs a valid checkout reference.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            Open the success page from your completed checkout, or sign in if the report is
            already attached to your account.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/login" size="lg">
              Sign In
            </LinkButton>
            <LinkButton href="/pricing" variant="outline" size="lg">
              Return To Pricing
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <Badge variant={errorMessage ? "outline" : "accent"}>
            {errorMessage ? "Confirmation pending" : "Preparing account setup"}
          </Badge>
          <CardTitle className="text-[1.8rem]">
            {errorMessage
              ? "We are still checking payment confirmation before account access can be prepared."
              : "Preparing secure account setup for the purchased report."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            {errorMessage ??
              "Payment has been received. We are attaching the report to the correct account state so you can continue safely."}
          </p>
          {errorMessage ? (
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/pricing" size="lg">
                Return To Pricing
              </LinkButton>
              <LinkButton href="/login" variant="outline" size="lg">
                Sign In
              </LinkButton>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (result.accessHandoff === "open_report") {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Access confirmed</Badge>
            <Badge variant="outline">Account already ready</Badge>
          </div>
          <CardTitle className="text-[1.95rem] leading-[1.05] sm:text-[2.2rem]">
            Your report is already attached and ready to open.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            No extra setup is needed. Open the full report or go straight to your library.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={reportViewUrl} size="xl">
              Open Full Report
            </LinkButton>
            <LinkButton href="/dashboard" variant="outline" size="lg">
              View My Reports
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.accessHandoff === "sign_in") {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Payment confirmed</Badge>
            <Badge variant="outline">Sign in to continue</Badge>
          </div>
          <CardTitle className="text-[1.95rem] leading-[1.05] sm:text-[2.2rem]">
            This report is saved to an existing account.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            Sign in with {result.checkoutEmail ? <span className="font-semibold text-foreground">{result.checkoutEmail}</span> : "the email used during checkout"} to continue directly to the full report.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={loginUrl} size="xl">
              Sign In And Continue
            </LinkButton>
            <LinkButton href={forgotPasswordUrl} variant="outline" size="lg">
              Reset Password
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="raised" className="panel-grid overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Payment confirmed</Badge>
          <Badge variant="outline">Create account to continue</Badge>
        </div>
        <CardTitle className="text-[1.95rem] leading-[1.05] sm:text-[2.2rem]">
          Create your password and open the saved report.
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1fr_0.98fr]">
        <div className="surface-block-strong p-5 sm:p-6">
          <p className="insight-label">
            {result.checkoutEmail ? "Saved under" : "Finish account setup"}
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {result.checkoutEmail ?? "Use the email from checkout to claim access"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Payment is complete. Set your password once, and this report will stay in your
            private library for future access.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleClaim}>
          {!result.checkoutEmail ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="claim-email">
                Email
              </label>
              <Input
                id="claim-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                value={claimEmail}
                onChange={(event) => setClaimEmail(event.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="claim-name">
              Name
            </label>
            <Input
              id="claim-name"
              autoComplete="name"
              placeholder="Your name"
              value={claimFullName}
              onChange={(event) => setClaimFullName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="claim-password">
              Create password
            </label>
            <Input
              id="claim-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={claimPassword}
              onChange={(event) => setClaimPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          {claimError ? (
            <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {claimError}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button size="xl" type="submit" disabled={isClaiming}>
              {isClaiming ? "Saving access..." : "Create Password And Open Report"}
            </Button>
            <LinkButton href={loginUrl} variant="outline" size="lg">
              I already have a password
            </LinkButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
