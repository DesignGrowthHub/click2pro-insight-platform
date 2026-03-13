import { NextResponse } from "next/server";

import { resetPasswordFromToken } from "@/lib/server/services/password-reset";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    token?: string;
    password?: string;
  };

  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json(
      {
        error: "A valid reset token is required."
      },
      {
        status: 400
      }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      {
        error: "Use a password with at least 8 characters."
      },
      {
        status: 400
      }
    );
  }

  try {
    const result = await resetPasswordFromToken({
      token,
      password
    });

    return NextResponse.json({
      ok: true,
      email: result.email
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not reset the password."
      },
      {
        status: 400
      }
    );
  }
}
