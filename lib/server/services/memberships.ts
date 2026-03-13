import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getMembershipStatusForUser(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    orderBy: [
      {
        createdAt: "desc"
      }
    ]
  });
}

export async function listMembershipsForUser(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc"
    }
  });
}
