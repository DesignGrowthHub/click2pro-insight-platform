import "server-only";

import type { PaymentProvider, Prisma, PurchaseStatus, PurchaseType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { toOptionalDate } from "@/lib/server/utils";

export type CreatePurchaseRecordInput = {
  userId: string;
  checkoutIntentId?: string | null;
  membershipId?: string | null;
  sourceAttributionId?: string | null;
  purchaseType: PurchaseType;
  status?: PurchaseStatus;
  paymentProvider?: PaymentProvider | null;
  providerCheckoutSessionId?: string | null;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  assessmentSlug?: string | null;
  topicKey?: string | null;
  productReference?: string | null;
  title?: string | null;
  currency?: string | null;
  amountCents: number;
  priceSnapshot?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  purchasedAt?: Date | string | null;
};

export async function createPurchaseRecord(input: CreatePurchaseRecordInput) {
  return prisma.purchase.create({
    data: {
      userId: input.userId,
      checkoutIntentId: input.checkoutIntentId ?? null,
      membershipId: input.membershipId ?? null,
      sourceAttributionId: input.sourceAttributionId ?? null,
      purchaseType: input.purchaseType,
      status: input.status ?? "PENDING",
      paymentProvider: input.paymentProvider ?? null,
      providerCheckoutSessionId: input.providerCheckoutSessionId ?? null,
      providerOrderId: input.providerOrderId ?? null,
      providerPaymentId: input.providerPaymentId ?? null,
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      assessmentSlug: input.assessmentSlug ?? null,
      topicKey: input.topicKey ?? null,
      productReference: input.productReference ?? null,
      title: input.title ?? null,
      currency: input.currency ?? "USD",
      amountCents: input.amountCents,
      priceSnapshot: input.priceSnapshot,
      metadata: input.metadata,
      purchasedAt: toOptionalDate(input.purchasedAt)
    }
  });
}

export async function getPurchaseHistoryForUser(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      reports: true,
      membership: true,
      sourceAttribution: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getPurchaseRecordById(userId: string, purchaseId: string) {
  return prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId
    },
    include: {
      reports: true,
      membership: true,
      sourceAttribution: true,
      checkoutIntent: true
    }
  });
}

export async function getPurchaseRecordByCheckoutIntentId(checkoutIntentId: string) {
  return prisma.purchase.findFirst({
    where: {
      checkoutIntentId
    },
    include: {
      reports: true,
      membership: true,
      sourceAttribution: true,
      checkoutIntent: true
    }
  });
}

export async function updatePurchaseRecord(
  purchaseId: string,
  data: Prisma.PurchaseUpdateInput
) {
  return prisma.purchase.update({
    where: {
      id: purchaseId
    },
    data
  });
}
