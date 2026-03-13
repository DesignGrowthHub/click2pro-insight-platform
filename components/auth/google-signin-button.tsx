"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import { ensureProfileCompletionCallback } from "@/lib/profile/completion";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  mode?: "login" | "signup";
};

export function GoogleSignInButton({
  callbackUrl,
  mode = "login"
}: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const continuationUrl = ensureProfileCompletionCallback(callbackUrl);

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full justify-center"
        disabled={isSubmitting}
        onClick={() => {
          setIsSubmitting(true);
          void signIn("google", {
            callbackUrl: continuationUrl
          });
        }}
      >
        <GoogleIcon className="h-5 w-5" />
        {isSubmitting
          ? "Redirecting to Google..."
          : mode === "signup"
            ? "Continue With Google"
            : "Sign In With Google"}
      </Button>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/8" />
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
          Or continue with email
        </span>
        <span className="h-px flex-1 bg-white/8" />
      </div>
    </div>
  );
}
