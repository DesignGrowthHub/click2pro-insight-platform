import "server-only";

import { getAccessStateForAssessment, getOwnedReportBySlug } from "@/lib/commerce/access";
import { getPersistentCommerceStateForUser } from "@/lib/commerce/server/library";

export async function resolvePersistentAccessStateForAssessment(
  userId: string,
  assessmentSlug: string
) {
  const state = await getPersistentCommerceStateForUser(userId);

  if (!state) {
    return null;
  }

  return getAccessStateForAssessment(state, assessmentSlug);
}

export async function getPersistentOwnedReportForAssessment(
  userId: string,
  assessmentSlug: string
) {
  const state = await getPersistentCommerceStateForUser(userId);

  if (!state) {
    return null;
  }

  return getOwnedReportBySlug(state, assessmentSlug);
}

export async function hasPersistentExplanationEntitlement(
  userId: string,
  assessmentSlug: string
) {
  const state = await getPersistentCommerceStateForUser(userId);

  if (!state) {
    return false;
  }

  return state.explanationEntitlements.some(
    (entitlement) =>
      entitlement.assessmentSlug === assessmentSlug &&
      [
        "pending",
        "granted",
        "ready_for_contact",
        "contacted",
        "scheduled",
        "completed"
      ].includes(entitlement.status)
  );
}
