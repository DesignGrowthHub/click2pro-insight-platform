import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { completeUserProfile, skipUserProfile } from "@/lib/server/services/users";

function badRequest(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message
    },
    {
      status
    }
  );
}

export async function POST(request: Request) {
  let currentUser;

  try {
    currentUser = await requireAuthenticatedUser();
  } catch {
    return badRequest("Authentication required.", 401);
  }

  const body = (await request.json()) as {
    action?: "complete" | "skip";
    fullName?: string;
    preferredName?: string;
    ageRange?: string;
    country?: string;
    region?: string;
    occupationOrLifeStage?: string;
    primaryConcern?: string;
  };

  if (body.action === "skip") {
    await skipUserProfile(currentUser.id);

    return NextResponse.json({
      ok: true
    });
  }

  if (body.action !== "complete") {
    return badRequest("Unsupported profile action.");
  }

  if (!body.primaryConcern?.trim()) {
    return badRequest("Primary concern is required to save the profile.");
  }

  await completeUserProfile({
    userId: currentUser.id,
    profile: {
      fullName: body.fullName,
      preferredName: body.preferredName,
      ageRange: body.ageRange,
      country: body.country,
      region: body.region,
      occupationOrLifeStage: body.occupationOrLifeStage,
      primaryConcern: body.primaryConcern
    }
  });

  return NextResponse.json({
    ok: true
  });
}
