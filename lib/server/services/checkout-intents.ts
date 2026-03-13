import "server-only";

import type {
  CheckoutIntentStatus,
  PaymentProvider,
  Prisma,
  PurchaseType
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type CreateCheckoutIntentInput = {
  id?: string;
  userId: string;
  assessmentSessionId?: string | null;
  sourceAttributionId?: string | null;
  assessmentSlug: string;
  assessmentTitle?: string | null;
  topicKey?: string | null;
  regionKey: string;
  currency: string;
  paymentProvider?: PaymentProvider | null;
  offerType: string;
  offerTitle: string;
  purchaseType: PurchaseType;
  amountCents: number;
  checkoutMode?: string | null;
  providerSessionId?: string | null;
  providerOrderId?: string | null;
  providerPriceLookupKey?: string | null;
  successUrl?: string | null;
  cancelUrl?: string | null;
  status?: CheckoutIntentStatus;
  failureReason?: string | null;
  lastPaymentEventAt?: Date | string | null;
  paymentConfirmedAt?: Date | string | null;
  metadata?: Prisma.InputJsonValue;
  completedAt?: Date | string | null;
  canceledAt?: Date | string | null;
  expiresAt?: Date | string | null;
};

export async function createCheckoutIntentRecord(input: CreateCheckoutIntentInput) {
  return prisma.checkoutIntent.create({
    data: {
      id: input.id,
      userId: input.userId,
      assessmentSessionId: input.assessmentSessionId ?? null,
      sourceAttributionId: input.sourceAttributionId ?? null,
      assessmentSlug: input.assessmentSlug,
      assessmentTitle: input.assessmentTitle ?? null,
      topicKey: input.topicKey ?? null,
      regionKey: input.regionKey,
      currency: input.currency,
      paymentProvider: input.paymentProvider ?? null,
      offerType: input.offerType,
      offerTitle: input.offerTitle,
      purchaseType: input.purchaseType,
      amountCents: input.amountCents,
      checkoutMode: input.checkoutMode ?? "payment",
      providerSessionId: input.providerSessionId ?? null,
      providerOrderId: input.providerOrderId ?? null,
      providerPriceLookupKey: input.providerPriceLookupKey ?? null,
      successUrl: input.successUrl ?? null,
      cancelUrl: input.cancelUrl ?? null,
      status: input.status ?? "PENDING",
      failureReason: input.failureReason ?? null,
      lastPaymentEventAt: toOptionalDate(input.lastPaymentEventAt),
      paymentConfirmedAt: toOptionalDate(input.paymentConfirmedAt),
      metadata: input.metadata,
      completedAt: toOptionalDate(input.completedAt),
      canceledAt: toOptionalDate(input.canceledAt),
      expiresAt: toOptionalDate(input.expiresAt)
    }
  });
}

export async function getCheckoutIntentForUser(userId: string, intentId: string) {
  return prisma.checkoutIntent.findFirst({
    where: {
      id: intentId,
      userId
    },
    include: {
      purchase: {
        include: {
          reports: true,
          membership: true
        }
      },
      sourceAttribution: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          country: true,
          region: true,
          currency: true
        }
      }
    }
  });
}

export async function getCheckoutIntentById(intentId: string) {
  return prisma.checkoutIntent.findUnique({
    where: {
      id: intentId
    },
    include: {
      purchase: {
        include: {
          reports: true,
          membership: true
        }
      },
      sourceAttribution: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          country: true,
          region: true,
          currency: true
        }
      }
    }
  });
}

export async function getCheckoutIntentByProviderSessionId(providerSessionId: string) {
  return prisma.checkoutIntent.findFirst({
    where: {
      providerSessionId
    },
    include: {
      purchase: {
        include: {
          reports: true,
          membership: true
        }
      },
      sourceAttribution: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          country: true,
          region: true,
          currency: true
        }
      }
    }
  });
}

export async function getCheckoutIntentByProviderOrderId(providerOrderId: string) {
  return prisma.checkoutIntent.findFirst({
    where: {
      providerOrderId
    },
    include: {
      purchase: {
        include: {
          reports: true,
          membership: true
        }
      },
      sourceAttribution: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          country: true,
          region: true,
          currency: true
        }
      }
    }
  });
}

export async function updateCheckoutIntentStatus(
  userId: string,
  intentId: string,
  status: CheckoutIntentStatus,
  extras: {
    providerSessionId?: string | null;
    providerOrderId?: string | null;
    providerPriceLookupKey?: string | null;
    failureReason?: string | null;
    lastPaymentEventAt?: Date | string | null;
    paymentConfirmedAt?: Date | string | null;
    completedAt?: Date | string | null;
    canceledAt?: Date | string | null;
  } = {}
) {
  const existingIntent = await prisma.checkoutIntent.findFirst({
    where: {
      id: intentId,
      userId
    }
  });

  if (!existingIntent) {
    return null;
  }

  return prisma.checkoutIntent.update({
    where: {
      id: existingIntent.id
    },
    data: {
      status,
      providerSessionId: extras.providerSessionId ?? undefined,
      providerOrderId: extras.providerOrderId ?? undefined,
      providerPriceLookupKey: extras.providerPriceLookupKey ?? undefined,
      failureReason: extras.failureReason ?? undefined,
      lastPaymentEventAt: extras.lastPaymentEventAt
        ? toOptionalDate(extras.lastPaymentEventAt)
        : undefined,
      paymentConfirmedAt: extras.paymentConfirmedAt
        ? toOptionalDate(extras.paymentConfirmedAt)
        : undefined,
      completedAt: extras.completedAt ? toOptionalDate(extras.completedAt) : undefined,
      canceledAt: extras.canceledAt ? toOptionalDate(extras.canceledAt) : undefined
    }
  });
}

export async function updateCheckoutIntentById(
  intentId: string,
  data: Prisma.CheckoutIntentUpdateInput
) {
  return prisma.checkoutIntent.update({
    where: {
      id: intentId
    },
    data
  });
}

export async function listCheckoutIntentsForUser(userId: string) {
  return prisma.checkoutIntent.findMany({
    where: { userId },
    include: {
      purchase: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
