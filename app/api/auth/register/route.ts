import { NextResponse } from "next/server";

import { toPrismaPaymentProvider } from "@/lib/commerce/server/mappers";
import { resolveRegionContext } from "@/lib/region/resolve";
import { createUser } from "@/lib/server/services/users";

function badRequest(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: message
    },
    {
      status: 400
    }
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    fullName?: string;
    country?: string;
    region?: string;
    currency?: string;
  };

  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!email) {
    return badRequest("Email is required.");
  }

  if (!password || password.length < 8) {
    return badRequest("Password must be at least 8 characters.");
  }

  try {
    const resolvedRegion = resolveRegionContext({
      country: body.country,
      region: body.region,
      currency: body.currency
    });
    const user = await createUser({
      email,
      password,
      fullName: body.fullName,
      country: body.country,
      region: body.region,
      currency: resolvedRegion.currencyCode,
      preferredPaymentProvider: toPrismaPaymentProvider(
        resolvedRegion.paymentProvider
      )
    });

    return NextResponse.json({
      ok: true,
      user
    });
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Unable to create account."
    );
  }
}
