import { NextRequest, NextResponse } from "next/server";

import { issuePasswordResetEmail } from "@/lib/server/services/password-reset";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    callbackUrl?: string | null;
  };

  const email = body.email?.trim() ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        error: "Enter a valid email address."
      },
      {
        status: 400
      }
    );
  }

  try {
    await issuePasswordResetEmail({
      email,
      origin: request.nextUrl.origin,
      callbackUrl: body.callbackUrl ?? null
    });

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not send the password reset email."
      },
      {
        status: 500
      }
    );
  }
}
