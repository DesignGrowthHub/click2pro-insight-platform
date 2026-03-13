import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAssessmentDraftById,
  replaceAssessmentDraftDimensions,
  replaceAssessmentDraftQuestions,
  updateAssessmentDraftMetadata,
  upsertAssessmentDraftIssuePage,
  upsertAssessmentDraftPreviewBlueprint,
  upsertAssessmentDraftReportBlueprint
} from "@/lib/server/services/assessment-drafts";

export const runtime = "nodejs";

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    section?: string;
    payload?: Record<string, unknown>;
  };

  const section = body.section;
  const payload = body.payload ?? {};

  try {
    switch (section) {
      case "metadata": {
        const updatedDraft = await updateAssessmentDraftMetadata(id, {
          title: typeof payload.title === "string" ? payload.title : undefined,
          slug:
            typeof payload.slug === "string" ? sanitizeSlug(payload.slug) : undefined,
          topicFamily:
            typeof payload.topicFamily === "string" || payload.topicFamily === null
              ? (payload.topicFamily as string | null)
              : undefined,
          targetAudience:
            typeof payload.targetAudience === "string" || payload.targetAudience === null
              ? (payload.targetAudience as string | null)
              : undefined,
          emotionalGoal:
            typeof payload.emotionalGoal === "string" || payload.emotionalGoal === null
              ? (payload.emotionalGoal as string | null)
              : undefined,
          requestedQuestionCount:
            typeof payload.requestedQuestionCount === "number" ||
            payload.requestedQuestionCount === null
              ? (payload.requestedQuestionCount as number | null)
              : undefined,
          desiredTone:
            typeof payload.desiredTone === "string" || payload.desiredTone === null
              ? (payload.desiredTone as string | null)
              : undefined,
          requestedDimensions:
            Array.isArray(payload.requestedDimensions) || payload.requestedDimensions === null
              ? ((payload.requestedDimensions as string[] | null) ?? null)
              : undefined,
          previewEmphasisNotes:
            typeof payload.previewEmphasisNotes === "string" ||
            payload.previewEmphasisNotes === null
              ? (payload.previewEmphasisNotes as string | null)
              : undefined,
          reportEmphasisNotes:
            typeof payload.reportEmphasisNotes === "string" ||
            payload.reportEmphasisNotes === null
              ? (payload.reportEmphasisNotes as string | null)
              : undefined,
          sourcePrompt:
            typeof payload.sourcePrompt === "string" || payload.sourcePrompt === null
              ? (payload.sourcePrompt as string | null)
              : undefined,
          generationPrompt:
            typeof payload.generationPrompt === "string" ||
            payload.generationPrompt === null
              ? (payload.generationPrompt as string | null)
              : undefined,
          generationStatus:
            typeof payload.generationStatus === "string"
              ? (payload.generationStatus as never)
              : undefined,
          reviewStatus:
            typeof payload.reviewStatus === "string"
              ? (payload.reviewStatus as never)
              : undefined,
          publishStatus:
            typeof payload.publishStatus === "string"
              ? (payload.publishStatus as never)
              : undefined,
          draftVersion:
            typeof payload.draftVersion === "number"
              ? (payload.draftVersion as number)
              : undefined,
          notes:
            typeof payload.notes === "string" || payload.notes === null
              ? (payload.notes as string | null)
              : undefined
        });

        return NextResponse.json({ ok: true, draft: updatedDraft });
      }
      case "dimensions": {
        const updatedDraft = await replaceAssessmentDraftDimensions(
          id,
          Array.isArray(payload.items) ? (payload.items as never[]) : []
        );

        return NextResponse.json({ ok: true, draft: updatedDraft });
      }
      case "questions": {
        const updatedDraft = await replaceAssessmentDraftQuestions(
          id,
          Array.isArray(payload.items) ? (payload.items as never[]) : []
        );

        return NextResponse.json({ ok: true, draft: updatedDraft });
      }
      case "issuePage": {
        await upsertAssessmentDraftIssuePage(id, {
          issueSlug: typeof payload.issueSlug === "string" ? payload.issueSlug : "",
          pageTitle: typeof payload.pageTitle === "string" ? payload.pageTitle : "",
          headline: typeof payload.headline === "string" ? payload.headline : "",
          subheadline:
            typeof payload.subheadline === "string" || payload.subheadline === null
              ? (payload.subheadline as string | null)
              : null,
          introCopy:
            typeof payload.introCopy === "string" || payload.introCopy === null
              ? (payload.introCopy as string | null)
              : null,
          ctaCopy:
            typeof payload.ctaCopy === "string" || payload.ctaCopy === null
              ? (payload.ctaCopy as string | null)
              : null,
          emotionalHook:
            typeof payload.emotionalHook === "string" || payload.emotionalHook === null
              ? (payload.emotionalHook as string | null)
              : null,
          faqItems: Array.isArray(payload.faqItems) ? payload.faqItems : null,
          trustCopy: Array.isArray(payload.trustCopy) ? payload.trustCopy : null
        });

        return NextResponse.json({ ok: true, draft: await getAssessmentDraftById(id) });
      }
      case "previewBlueprint": {
        await upsertAssessmentDraftPreviewBlueprint(id, {
          previewTitle:
            typeof payload.previewTitle === "string" || payload.previewTitle === null
              ? (payload.previewTitle as string | null)
              : null,
          summaryFraming:
            typeof payload.summaryFraming === "string" || payload.summaryFraming === null
              ? (payload.summaryFraming as string | null)
              : null,
          strongestSignalLabels: Array.isArray(payload.strongestSignalLabels)
            ? payload.strongestSignalLabels
            : null,
          graphFraming:
            typeof payload.graphFraming === "string" || payload.graphFraming === null
              ? (payload.graphFraming as string | null)
              : null,
          whyThisMatters:
            typeof payload.whyThisMatters === "string" || payload.whyThisMatters === null
              ? (payload.whyThisMatters as string | null)
              : null,
          whatOpensInFullReport:
            typeof payload.whatOpensInFullReport === "string" ||
            payload.whatOpensInFullReport === null
              ? (payload.whatOpensInFullReport as string | null)
              : null,
          pricingFraming:
            typeof payload.pricingFraming === "string" || payload.pricingFraming === null
              ? (payload.pricingFraming as string | null)
              : null,
          urgencyNotes:
            typeof payload.urgencyNotes === "string" || payload.urgencyNotes === null
              ? (payload.urgencyNotes as string | null)
              : null
        });

        return NextResponse.json({ ok: true, draft: await getAssessmentDraftById(id) });
      }
      case "reportBlueprint": {
        await upsertAssessmentDraftReportBlueprint(id, {
          executiveSummaryFraming:
            typeof payload.executiveSummaryFraming === "string" ||
            payload.executiveSummaryFraming === null
              ? (payload.executiveSummaryFraming as string | null)
              : null,
          sectionOrder: Array.isArray(payload.sectionOrder) ? payload.sectionOrder : null,
          sectionIntents:
            typeof payload.sectionIntents === "object" && payload.sectionIntents !== null
              ? payload.sectionIntents
              : null,
          sectionRoleBoundaries:
            typeof payload.sectionRoleBoundaries === "object" &&
            payload.sectionRoleBoundaries !== null
              ? payload.sectionRoleBoundaries
              : null,
          reflectionActionFraming:
            typeof payload.reflectionActionFraming === "string" ||
            payload.reflectionActionFraming === null
              ? (payload.reflectionActionFraming as string | null)
              : null,
          relatedInsightsLogic:
            typeof payload.relatedInsightsLogic === "string" ||
            payload.relatedInsightsLogic === null
              ? (payload.relatedInsightsLogic as string | null)
              : null
        });

        return NextResponse.json({ ok: true, draft: await getAssessmentDraftById(id) });
      }
      default:
        return NextResponse.json(
          { error: "Unknown draft update section." },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assessment draft could not be updated."
      },
      { status: 400 }
    );
  }
}
