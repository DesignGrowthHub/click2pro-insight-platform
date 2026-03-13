import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  cancelPersistentCheckoutIntent,
  cancelPersistentCheckoutIntentById
} from "@/lib/commerce/server/grants";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  const body = (await request.json()) as {
    intentId?: string;
  };

  if (!body.intentId) {
    return NextResponse.json(
      {
        error: "Intent id is required."
      },
      {
        status: 400
      }
    );
  }

  const result = user
    ? await cancelPersistentCheckoutIntent(user.id, body.intentId)
    : await cancelPersistentCheckoutIntentById(body.intentId);

  if (!result) {
    return NextResponse.json(
      {
        error: "Checkout intent could not be canceled."
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json({
    ok: true,
    persistenceMode: "database",
    ...result
  });
}
