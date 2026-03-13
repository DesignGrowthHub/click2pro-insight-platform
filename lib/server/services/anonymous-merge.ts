import "server-only";

import { prisma } from "@/lib/db/prisma";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";

export type AnonymousMergeResult = {
  merged: boolean;
  anonymousVisitorId: string | null;
  sessionsMerged: number;
  attributionsMerged: number;
};

export async function mergeAnonymousVisitorIntoUser(input: {
  anonymousVisitorId?: string | null;
  userId: string;
}): Promise<AnonymousMergeResult> {
  const anonymousVisitorId = input.anonymousVisitorId?.trim() || null;

  if (!anonymousVisitorId) {
    return {
      merged: false,
      anonymousVisitorId: null,
      sessionsMerged: 0,
      attributionsMerged: 0
    };
  }

  const candidateSessions = await prisma.assessmentSession.findMany({
    where: {
      anonymousVisitorId,
      OR: [
        {
          userId: null
        },
        {
          userId: input.userId
        }
      ]
    },
    select: {
      id: true,
      userId: true,
      sourceAttributionId: true
    }
  });

  if (candidateSessions.length === 0) {
    return {
      merged: false,
      anonymousVisitorId,
      sessionsMerged: 0,
      attributionsMerged: 0
    };
  }

  const sessionIdsToAssign = candidateSessions
    .filter((session) => session.userId === null)
    .map((session) => session.id);
  const sessionIdsToClear = candidateSessions.map((session) => session.id);
  const attributionIds = candidateSessions
    .map((session) => session.sourceAttributionId)
    .filter((id): id is string => Boolean(id));

  const { sessionsMerged, attributionsMerged } = await prisma.$transaction(
    async (tx) => {
      const sessionAssignment = sessionIdsToAssign.length
        ? await tx.assessmentSession.updateMany({
            where: {
              id: {
                in: sessionIdsToAssign
              },
              userId: null
            },
            data: {
              userId: input.userId
            }
          })
        : { count: 0 };

      if (sessionIdsToClear.length > 0) {
        await tx.assessmentSession.updateMany({
          where: {
            id: {
              in: sessionIdsToClear
            },
            anonymousVisitorId
          },
          data: {
            anonymousVisitorId: null
          }
        });
      }

      const attributionAssignment = attributionIds.length
        ? await tx.sourceAttribution.updateMany({
            where: {
              id: {
                in: attributionIds
              },
              userId: null
            },
            data: {
              userId: input.userId
            }
          })
        : { count: 0 };

      return {
        sessionsMerged: sessionAssignment.count,
        attributionsMerged: attributionAssignment.count
      };
    }
  );

  if (sessionsMerged > 0 || attributionsMerged > 0) {
    await recordOperationalEvent({
      eventType: "anonymous_merge",
      eventKey: anonymousVisitorId,
      status: "SUCCEEDED",
      userId: input.userId,
      message: "Anonymous assessment progress was merged into the authenticated account.",
      metadata: {
        sessionsMerged,
        attributionsMerged
      }
    });
  }

  return {
    merged: sessionsMerged > 0 || attributionsMerged > 0,
    anonymousVisitorId,
    sessionsMerged,
    attributionsMerged
  };
}
