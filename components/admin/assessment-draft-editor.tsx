"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AssessmentDraftStatusBadges } from "@/components/admin/assessment-draft-status-badges";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";

type DraftDimension = {
  key: string;
  label: string;
  description: string | null;
  order: number;
  scoringNotes: string | null;
  interpretationNotes: string | null;
};

type DraftQuestion = {
  dimensionKey: string | null;
  questionType: string;
  prompt: string;
  optionSchema: unknown;
  scoringMapping: unknown;
  reverseScored: boolean;
  order: number;
  status: string;
  notes: string | null;
};

type DraftIssuePage = {
  issueSlug: string;
  pageTitle: string;
  headline: string;
  subheadline: string | null;
  introCopy: string | null;
  ctaCopy: string | null;
  emotionalHook: string | null;
  faqItems: unknown;
  trustCopy: unknown;
} | null;

type DraftPreviewBlueprint = {
  previewTitle: string | null;
  summaryFraming: string | null;
  strongestSignalLabels: unknown;
  graphFraming: string | null;
  whyThisMatters: string | null;
  whatOpensInFullReport: string | null;
  pricingFraming: string | null;
  urgencyNotes: string | null;
} | null;

type DraftReportBlueprint = {
  executiveSummaryFraming: string | null;
  sectionOrder: unknown;
  sectionIntents: unknown;
  sectionRoleBoundaries: unknown;
  reflectionActionFraming: string | null;
  relatedInsightsLogic: string | null;
} | null;

type DraftGenerationSection =
  | "all"
  | "dimensions"
  | "questions"
  | "issuePage"
  | "previewBlueprint"
  | "reportBlueprint";

type AssessmentDraftEditorProps = {
  draft: {
    id: string;
    title: string;
    slug: string;
    topicFamily: string | null;
    targetAudience: string | null;
    emotionalGoal: string | null;
    requestedQuestionCount: number | null;
    desiredTone: string | null;
    requestedDimensions: unknown;
    previewEmphasisNotes: string | null;
    reportEmphasisNotes: string | null;
    sourcePrompt: string | null;
    generationPrompt: string | null;
    generationStatus: string;
    reviewStatus: string;
    publishStatus: string;
    draftVersion: number;
    notes: string | null;
    updatedAt: string | Date;
    createdByUser?: {
      email: string;
      fullName: string | null;
    } | null;
    dimensions: DraftDimension[];
    questions: DraftQuestion[];
    issuePage: DraftIssuePage;
    previewBlueprint: DraftPreviewBlueprint;
    reportBlueprint: DraftReportBlueprint;
  };
};

const generationStatuses = ["EMPTY", "GENERATING", "GENERATED", "FAILED"] as const;
const reviewStatuses = ["DRAFT", "UNDER_REVIEW", "APPROVED", "NEEDS_REVISION"] as const;
const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const questionStatuses = ["DRAFT", "REVIEWED", "APPROVED", "ARCHIVED"] as const;
const questionTypes = [
  "likert_scale",
  "multiple_choice",
  "situational_choice",
  "binary_choice",
  "forced_choice"
] as const;

function prettyJson(value: unknown) {
  if (value == null) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function parseJsonInput(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function AssessmentDraftEditor({ draft }: AssessmentDraftEditorProps) {
  const router = useRouter();
  const [headerTitle, setHeaderTitle] = useState(draft.title);
  const [headerSlug, setHeaderSlug] = useState(draft.slug);
  const [headerUpdatedAt, setHeaderUpdatedAt] = useState<string | Date>(draft.updatedAt);
  const [metadata, setMetadata] = useState({
    title: draft.title,
    slug: draft.slug,
    topicFamily: draft.topicFamily ?? "",
    targetAudience: draft.targetAudience ?? "",
    emotionalGoal: draft.emotionalGoal ?? "",
    requestedQuestionCount: draft.requestedQuestionCount?.toString() ?? "",
    desiredTone: draft.desiredTone ?? "",
    requestedDimensions: Array.isArray(draft.requestedDimensions)
      ? draft.requestedDimensions.join(", ")
      : "",
    previewEmphasisNotes: draft.previewEmphasisNotes ?? "",
    reportEmphasisNotes: draft.reportEmphasisNotes ?? "",
    sourcePrompt: draft.sourcePrompt ?? "",
    generationPrompt: draft.generationPrompt ?? "",
    generationStatus: draft.generationStatus,
    reviewStatus: draft.reviewStatus,
    publishStatus: draft.publishStatus,
    draftVersion: draft.draftVersion.toString(),
    notes: draft.notes ?? ""
  });
  const [dimensions, setDimensions] = useState<DraftDimension[]>(
    draft.dimensions.length
      ? draft.dimensions
      : [
          {
            key: "",
            label: "",
            description: "",
            order: 1,
            scoringNotes: "",
            interpretationNotes: ""
          }
        ]
  );
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    draft.questions.length
      ? draft.questions
      : [
          {
            dimensionKey: "",
            questionType: "likert_scale",
            prompt: "",
            optionSchema: null,
            scoringMapping: null,
            reverseScored: false,
            order: 1,
            status: "DRAFT",
            notes: ""
          }
        ]
  );
  const [issuePage, setIssuePage] = useState({
    issueSlug: draft.issuePage?.issueSlug ?? draft.slug,
    pageTitle: draft.issuePage?.pageTitle ?? draft.title,
    headline: draft.issuePage?.headline ?? draft.title,
    subheadline: draft.issuePage?.subheadline ?? "",
    introCopy: draft.issuePage?.introCopy ?? "",
    ctaCopy: draft.issuePage?.ctaCopy ?? "Start Assessment",
    emotionalHook: draft.issuePage?.emotionalHook ?? "",
    faqItems: Array.isArray(draft.issuePage?.faqItems)
      ? (draft.issuePage?.faqItems as string[]).join("\n")
      : "",
    trustCopy: Array.isArray(draft.issuePage?.trustCopy)
      ? (draft.issuePage?.trustCopy as string[]).join("\n")
      : ""
  });
  const [previewBlueprint, setPreviewBlueprint] = useState({
    previewTitle: draft.previewBlueprint?.previewTitle ?? "",
    summaryFraming: draft.previewBlueprint?.summaryFraming ?? "",
    strongestSignalLabels: Array.isArray(draft.previewBlueprint?.strongestSignalLabels)
      ? (draft.previewBlueprint?.strongestSignalLabels as string[]).join(", ")
      : "",
    graphFraming: draft.previewBlueprint?.graphFraming ?? "",
    whyThisMatters: draft.previewBlueprint?.whyThisMatters ?? "",
    whatOpensInFullReport: draft.previewBlueprint?.whatOpensInFullReport ?? "",
    pricingFraming: draft.previewBlueprint?.pricingFraming ?? "",
    urgencyNotes: draft.previewBlueprint?.urgencyNotes ?? ""
  });
  const [reportBlueprint, setReportBlueprint] = useState({
    executiveSummaryFraming: draft.reportBlueprint?.executiveSummaryFraming ?? "",
    sectionOrder: Array.isArray(draft.reportBlueprint?.sectionOrder)
      ? (draft.reportBlueprint?.sectionOrder as string[]).join("\n")
      : "",
    sectionIntents: prettyJson(draft.reportBlueprint?.sectionIntents),
    sectionRoleBoundaries: prettyJson(draft.reportBlueprint?.sectionRoleBoundaries),
    reflectionActionFraming: draft.reportBlueprint?.reflectionActionFraming ?? "",
    relatedInsightsLogic: draft.reportBlueprint?.relatedInsightsLogic ?? ""
  });
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [generatingSection, setGeneratingSection] =
    useState<DraftGenerationSection | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dimensionOptions = useMemo(
    () =>
      dimensions
        .filter((dimension) => dimension.key.trim())
        .map((dimension) => ({
          key: dimension.key.trim(),
          label: dimension.label.trim() || dimension.key.trim()
        })),
    [dimensions]
  );

  function hydrateDraftState(nextDraft: AssessmentDraftEditorProps["draft"]) {
    setHeaderTitle(nextDraft.title);
    setHeaderSlug(nextDraft.slug);
    setHeaderUpdatedAt(nextDraft.updatedAt);
    setMetadata({
      title: nextDraft.title,
      slug: nextDraft.slug,
      topicFamily: nextDraft.topicFamily ?? "",
      targetAudience: nextDraft.targetAudience ?? "",
      emotionalGoal: nextDraft.emotionalGoal ?? "",
      requestedQuestionCount: nextDraft.requestedQuestionCount?.toString() ?? "",
      desiredTone: nextDraft.desiredTone ?? "",
      requestedDimensions: Array.isArray(nextDraft.requestedDimensions)
        ? nextDraft.requestedDimensions.join(", ")
        : "",
      previewEmphasisNotes: nextDraft.previewEmphasisNotes ?? "",
      reportEmphasisNotes: nextDraft.reportEmphasisNotes ?? "",
      sourcePrompt: nextDraft.sourcePrompt ?? "",
      generationPrompt: nextDraft.generationPrompt ?? "",
      generationStatus: nextDraft.generationStatus,
      reviewStatus: nextDraft.reviewStatus,
      publishStatus: nextDraft.publishStatus,
      draftVersion: nextDraft.draftVersion.toString(),
      notes: nextDraft.notes ?? ""
    });
    setDimensions(
      nextDraft.dimensions.length
        ? nextDraft.dimensions
        : [
            {
              key: "",
              label: "",
              description: "",
              order: 1,
              scoringNotes: "",
              interpretationNotes: ""
            }
          ]
    );
    setQuestions(
      nextDraft.questions.length
        ? nextDraft.questions
        : [
            {
              dimensionKey: "",
              questionType: "likert_scale",
              prompt: "",
              optionSchema: null,
              scoringMapping: null,
              reverseScored: false,
              order: 1,
              status: "DRAFT",
              notes: ""
            }
          ]
    );
    setIssuePage({
      issueSlug: nextDraft.issuePage?.issueSlug ?? nextDraft.slug,
      pageTitle: nextDraft.issuePage?.pageTitle ?? nextDraft.title,
      headline: nextDraft.issuePage?.headline ?? nextDraft.title,
      subheadline: nextDraft.issuePage?.subheadline ?? "",
      introCopy: nextDraft.issuePage?.introCopy ?? "",
      ctaCopy: nextDraft.issuePage?.ctaCopy ?? "Start Assessment",
      emotionalHook: nextDraft.issuePage?.emotionalHook ?? "",
      faqItems: Array.isArray(nextDraft.issuePage?.faqItems)
        ? (nextDraft.issuePage?.faqItems as string[]).join("\n")
        : "",
      trustCopy: Array.isArray(nextDraft.issuePage?.trustCopy)
        ? (nextDraft.issuePage?.trustCopy as string[]).join("\n")
        : ""
    });
    setPreviewBlueprint({
      previewTitle: nextDraft.previewBlueprint?.previewTitle ?? "",
      summaryFraming: nextDraft.previewBlueprint?.summaryFraming ?? "",
      strongestSignalLabels: Array.isArray(nextDraft.previewBlueprint?.strongestSignalLabels)
        ? (nextDraft.previewBlueprint?.strongestSignalLabels as string[]).join(", ")
        : "",
      graphFraming: nextDraft.previewBlueprint?.graphFraming ?? "",
      whyThisMatters: nextDraft.previewBlueprint?.whyThisMatters ?? "",
      whatOpensInFullReport: nextDraft.previewBlueprint?.whatOpensInFullReport ?? "",
      pricingFraming: nextDraft.previewBlueprint?.pricingFraming ?? "",
      urgencyNotes: nextDraft.previewBlueprint?.urgencyNotes ?? ""
    });
    setReportBlueprint({
      executiveSummaryFraming: nextDraft.reportBlueprint?.executiveSummaryFraming ?? "",
      sectionOrder: Array.isArray(nextDraft.reportBlueprint?.sectionOrder)
        ? (nextDraft.reportBlueprint?.sectionOrder as string[]).join("\n")
        : "",
      sectionIntents: prettyJson(nextDraft.reportBlueprint?.sectionIntents),
      sectionRoleBoundaries: prettyJson(nextDraft.reportBlueprint?.sectionRoleBoundaries),
      reflectionActionFraming: nextDraft.reportBlueprint?.reflectionActionFraming ?? "",
      relatedInsightsLogic: nextDraft.reportBlueprint?.relatedInsightsLogic ?? ""
    });
  }

  async function saveSection(section: string, payload: Record<string, unknown>) {
    try {
      setSavingSection(section);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/assessment-drafts/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section,
          payload
        })
      });

      const responsePayload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        draft?: AssessmentDraftEditorProps["draft"];
      };

      if (!response.ok || !responsePayload.ok) {
        throw new Error(responsePayload.error ?? "The draft update could not be saved.");
      }

      if (responsePayload.draft) {
        hydrateDraftState(responsePayload.draft);
      }

      setSuccessMessage("Saved.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The draft update could not be saved."
      );
    } finally {
      setSavingSection(null);
    }
  }

  async function generateSection(section: DraftGenerationSection) {
    try {
      setGeneratingSection(section);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/assessment-drafts/${draft.id}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ section })
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        draft?: AssessmentDraftEditorProps["draft"];
      };

      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.error ?? "The AI generation request failed.");
      }

      hydrateDraftState(payload.draft);
      setSuccessMessage(
        section === "all"
          ? "AI draft generation completed."
          : `AI regenerated ${section.replace(/([A-Z])/g, " $1").toLowerCase()}.`
      );
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The AI generation request failed."
      );
    } finally {
      setGeneratingSection(null);
    }
  }

  async function publishDraft() {
    try {
      setPublishing(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/assessment-drafts/${draft.id}/publish`, {
        method: "POST"
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        draft?: AssessmentDraftEditorProps["draft"];
      };

      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.error ?? "The draft could not be published.");
      }

      hydrateDraftState(payload.draft);
      setSuccessMessage("Draft published to live DB-backed records.");
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "The draft could not be published."
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">Draft editor</Badge>
                <Badge variant="outline">{headerSlug}</Badge>
              </div>
              <CardTitle className="text-[1.9rem]">{headerTitle}</CardTitle>
              <p className="body-md max-w-3xl">
                Edit the draft manually across metadata, dimensions, questions, issue-page copy,
                locked preview framing, and report blueprint logic before any AI generation or
                publishing step exists.
              </p>
            </div>
            <div className="space-y-3 text-right">
              <AssessmentDraftStatusBadges
                generationStatus={metadata.generationStatus}
                reviewStatus={metadata.reviewStatus}
                publishStatus={metadata.publishStatus}
              />
              <p className="text-sm leading-6 text-muted">
                Updated {formatDate(headerUpdatedAt)}
                {draft.createdByUser
                  ? ` · Created by ${draft.createdByUser.fullName ?? draft.createdByUser.email}`
                  : ""}
              </p>
              <p className="text-xs leading-6 text-muted">
                AI generation always uses the saved draft state. Save metadata changes before
                running generation if you want them included.
              </p>
            </div>
          </div>
          {error ? (
            <div className="rounded-[20px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          {successMessage ? (
            <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("all")}
            >
              {generatingSection === "all" ? "Generating draft..." : "Generate Draft With AI"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Core metadata</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={metadata.title}
                onChange={(event) => setMetadata((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <Input
                value={metadata.slug}
                onChange={(event) => setMetadata((current) => ({ ...current, slug: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic family</label>
              <Input
                value={metadata.topicFamily}
                onChange={(event) => setMetadata((current) => ({ ...current, topicFamily: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Target audience</label>
              <Input
                value={metadata.targetAudience}
                onChange={(event) => setMetadata((current) => ({ ...current, targetAudience: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Desired tone</label>
              <Input
                value={metadata.desiredTone}
                onChange={(event) => setMetadata((current) => ({ ...current, desiredTone: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Requested questions</label>
              <Input
                type="number"
                min={1}
                value={metadata.requestedQuestionCount}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    requestedQuestionCount: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Generation status</label>
              <SelectField
                value={metadata.generationStatus}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, generationStatus: event.target.value }))
                }
              >
                {generationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Review status</label>
              <SelectField
                value={metadata.reviewStatus}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, reviewStatus: event.target.value }))
                }
              >
                {reviewStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Publish status</label>
              <SelectField
                value={metadata.publishStatus}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, publishStatus: event.target.value }))
                }
              >
                {publishStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </SelectField>
              <p className="text-xs leading-6 text-muted">
                Publishing creates or updates live DB-backed issue and assessment records without
                replacing the existing seeded launch assessments.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Draft version</label>
              <Input
                type="number"
                min={1}
                value={metadata.draftVersion}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, draftVersion: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Requested dimensions</label>
            <Input
              value={metadata.requestedDimensions}
              onChange={(event) =>
                setMetadata((current) => ({ ...current, requestedDimensions: event.target.value }))
              }
              placeholder="comparison sensitivity, praise resistance, overpreparation"
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Emotional goal</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.emotionalGoal}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, emotionalGoal: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Source prompt</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.sourcePrompt}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, sourcePrompt: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preview emphasis notes</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.previewEmphasisNotes}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    previewEmphasisNotes: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Report emphasis notes</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.reportEmphasisNotes}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    reportEmphasisNotes: event.target.value
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Generation prompt</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.generationPrompt}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    generationPrompt: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin notes</label>
              <Textarea
                className="min-h-[132px]"
                value={metadata.notes}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={savingSection === "metadata"}
              onClick={() =>
                void saveSection("metadata", {
                  ...metadata,
                  requestedQuestionCount: metadata.requestedQuestionCount
                    ? Number(metadata.requestedQuestionCount)
                    : null,
                  draftVersion: metadata.draftVersion ? Number(metadata.draftVersion) : 1,
                  requestedDimensions: metadata.requestedDimensions
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                })
              }
            >
              {savingSection === "metadata" ? "Saving..." : "Save Metadata"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Dimensions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("dimensions")}
            >
              {generatingSection === "dimensions" ? "Generating..." : "Regenerate With AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensions.map((dimension, index) => (
            <div key={`${dimension.key}-${index}`} className="surface-block p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline">Dimension {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDimensions((current) =>
                      current.length === 1
                        ? current
                        : current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Input
                  value={dimension.key}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, key: event.target.value } : item
                      )
                    )
                  }
                  placeholder="dimension key"
                />
                <Input
                  value={dimension.label}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Label"
                />
                <Input
                  type="number"
                  min={1}
                  value={dimension.order}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, order: Number(event.target.value || 0) }
                          : item
                      )
                    )
                  }
                  placeholder="Order"
                />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Textarea
                  className="min-h-[112px]"
                  value={dimension.description ?? ""}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, description: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Description"
                />
                <Textarea
                  className="min-h-[112px]"
                  value={dimension.scoringNotes ?? ""}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, scoringNotes: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Scoring notes"
                />
                <Textarea
                  className="min-h-[112px]"
                  value={dimension.interpretationNotes ?? ""}
                  onChange={(event) =>
                    setDimensions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, interpretationNotes: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Interpretation notes"
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() =>
                setDimensions((current) => [
                  ...current,
                  {
                    key: "",
                    label: "",
                    description: "",
                    order: current.length + 1,
                    scoringNotes: "",
                    interpretationNotes: ""
                  }
                ])
              }
            >
              Add Dimension
            </Button>
            <Button
              size="lg"
              disabled={savingSection === "dimensions"}
              onClick={() =>
                void saveSection("dimensions", {
                  items: dimensions.map((dimension, index) => ({
                    ...dimension,
                    order: dimension.order || index + 1
                  }))
                })
              }
            >
              {savingSection === "dimensions" ? "Saving..." : "Save Dimensions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Questions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("questions")}
            >
              {generatingSection === "questions" ? "Generating..." : "Regenerate With AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div key={`${question.prompt}-${index}`} className="surface-block p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline">Question {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setQuestions((current) =>
                      current.length === 1
                        ? current
                        : current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-4">
                <Input
                  type="number"
                  min={1}
                  value={question.order}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, order: Number(event.target.value || 0) }
                          : item
                      )
                    )
                  }
                  placeholder="Order"
                />
                <SelectField
                  value={question.questionType}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, questionType: event.target.value }
                          : item
                      )
                    )
                  }
                >
                  {questionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  value={question.dimensionKey ?? ""}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, dimensionKey: event.target.value || null }
                          : item
                      )
                    )
                  }
                >
                  <option value="">No dimension selected</option>
                  {dimensionOptions.map((dimension) => (
                    <option key={dimension.key} value={dimension.key}>
                      {dimension.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  value={question.status}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, status: event.target.value } : item
                      )
                    )
                  }
                >
                  {questionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div className="mt-4 space-y-4">
                <Textarea
                  className="min-h-[112px]"
                  value={question.prompt}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, prompt: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Question prompt"
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  <Textarea
                    className="min-h-[160px] font-mono text-sm"
                    value={prettyJson(question.optionSchema)}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                optionSchema: event.target.value
                              }
                            : item
                        )
                      )
                    }
                    placeholder='{"options":[{"label":"Often","value":"often"}]}'
                  />
                  <Textarea
                    className="min-h-[160px] font-mono text-sm"
                    value={prettyJson(question.scoringMapping)}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                scoringMapping: event.target.value
                              }
                            : item
                        )
                      )
                    }
                    placeholder='{"often":{"comparison_sensitivity":2}}'
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={question.reverseScored}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, reverseScored: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    Reverse scored
                  </label>
                  <Textarea
                    className="min-h-[112px]"
                    value={question.notes ?? ""}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, notes: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Internal question notes"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() =>
                setQuestions((current) => [
                  ...current,
                  {
                    dimensionKey: dimensionOptions[0]?.key ?? "",
                    questionType: "likert_scale",
                    prompt: "",
                    optionSchema: null,
                    scoringMapping: null,
                    reverseScored: false,
                    order: current.length + 1,
                    status: "DRAFT",
                    notes: ""
                  }
                ])
              }
            >
              Add Question
            </Button>
            <Button
              size="lg"
              disabled={savingSection === "questions"}
              onClick={() => {
                try {
                  void saveSection("questions", {
                    items: questions.map((question, index) => ({
                      ...question,
                      order: question.order || index + 1,
                      optionSchema:
                        typeof question.optionSchema === "string"
                          ? parseJsonInput(question.optionSchema, `Question ${index + 1} option schema`)
                          : question.optionSchema,
                      scoringMapping:
                        typeof question.scoringMapping === "string"
                          ? parseJsonInput(question.scoringMapping, `Question ${index + 1} scoring mapping`)
                          : question.scoringMapping
                    }))
                  });
                } catch (nextError) {
                  setError(
                    nextError instanceof Error ? nextError.message : "Questions could not be saved."
                  );
                }
              }}
            >
              {savingSection === "questions" ? "Saving..." : "Save Questions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Issue page copy</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("issuePage")}
            >
              {generatingSection === "issuePage" ? "Generating..." : "Regenerate With AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <Input
              value={issuePage.issueSlug}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, issueSlug: event.target.value }))
              }
              placeholder="Issue slug"
            />
            <Input
              value={issuePage.pageTitle}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, pageTitle: event.target.value }))
              }
              placeholder="Page title"
            />
            <Input
              value={issuePage.ctaCopy}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, ctaCopy: event.target.value }))
              }
              placeholder="CTA copy"
            />
          </div>
          <Input
            value={issuePage.headline}
            onChange={(event) =>
              setIssuePage((current) => ({ ...current, headline: event.target.value }))
            }
            placeholder="Headline"
          />
          <Input
            value={issuePage.subheadline}
            onChange={(event) =>
              setIssuePage((current) => ({ ...current, subheadline: event.target.value }))
            }
            placeholder="Subheadline"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <Textarea
              className="min-h-[132px]"
              value={issuePage.emotionalHook}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, emotionalHook: event.target.value }))
              }
              placeholder="Emotional hook"
            />
            <Textarea
              className="min-h-[132px]"
              value={issuePage.introCopy}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, introCopy: event.target.value }))
              }
              placeholder="Intro copy"
            />
            <Textarea
              className="min-h-[132px]"
              value={issuePage.faqItems}
              onChange={(event) =>
                setIssuePage((current) => ({ ...current, faqItems: event.target.value }))
              }
              placeholder={"FAQ items, one per line"}
            />
          </div>
          <Textarea
            className="min-h-[132px]"
            value={issuePage.trustCopy}
            onChange={(event) =>
              setIssuePage((current) => ({ ...current, trustCopy: event.target.value }))
            }
            placeholder="Trust notes, one per line"
          />
          <Button
            size="lg"
            disabled={savingSection === "issuePage"}
            onClick={() =>
              void saveSection("issuePage", {
                ...issuePage,
                faqItems: parseLineList(issuePage.faqItems),
                trustCopy: parseLineList(issuePage.trustCopy)
              })
            }
          >
            {savingSection === "issuePage" ? "Saving..." : "Save Issue Page"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Preview blueprint</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("previewBlueprint")}
            >
              {generatingSection === "previewBlueprint"
                ? "Generating..."
                : "Regenerate With AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              value={previewBlueprint.previewTitle}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  previewTitle: event.target.value
                }))
              }
              placeholder="Preview title"
            />
            <Input
              value={previewBlueprint.strongestSignalLabels}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  strongestSignalLabels: event.target.value
                }))
              }
              placeholder="Strongest signals, comma separated"
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Textarea
              className="min-h-[132px]"
              value={previewBlueprint.summaryFraming}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  summaryFraming: event.target.value
                }))
              }
              placeholder="Summary framing"
            />
            <Textarea
              className="min-h-[132px]"
              value={previewBlueprint.graphFraming}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  graphFraming: event.target.value
                }))
              }
              placeholder="Graph framing"
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Textarea
              className="min-h-[132px]"
              value={previewBlueprint.whyThisMatters}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  whyThisMatters: event.target.value
                }))
              }
              placeholder="Why this matters"
            />
            <Textarea
              className="min-h-[132px]"
              value={previewBlueprint.whatOpensInFullReport}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  whatOpensInFullReport: event.target.value
                }))
              }
              placeholder="What opens in the full report"
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Textarea
              className="min-h-[112px]"
              value={previewBlueprint.pricingFraming}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  pricingFraming: event.target.value
                }))
              }
              placeholder="Pricing framing"
            />
            <Textarea
              className="min-h-[112px]"
              value={previewBlueprint.urgencyNotes}
              onChange={(event) =>
                setPreviewBlueprint((current) => ({
                  ...current,
                  urgencyNotes: event.target.value
                }))
              }
              placeholder="Urgency notes"
            />
          </div>
          <Button
            size="lg"
            disabled={savingSection === "previewBlueprint"}
            onClick={() =>
              void saveSection("previewBlueprint", {
                ...previewBlueprint,
                strongestSignalLabels: previewBlueprint.strongestSignalLabels
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              })
            }
          >
            {savingSection === "previewBlueprint" ? "Saving..." : "Save Preview Blueprint"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-[1.5rem]">Report blueprint</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Boolean(generatingSection) || Boolean(savingSection)}
              onClick={() => void generateSection("reportBlueprint")}
            >
              {generatingSection === "reportBlueprint"
                ? "Generating..."
                : "Regenerate With AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            className="min-h-[132px]"
            value={reportBlueprint.executiveSummaryFraming}
            onChange={(event) =>
              setReportBlueprint((current) => ({
                ...current,
                executiveSummaryFraming: event.target.value
              }))
            }
            placeholder="Executive summary framing"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <Textarea
              className="min-h-[160px]"
              value={reportBlueprint.sectionOrder}
              onChange={(event) =>
                setReportBlueprint((current) => ({
                  ...current,
                  sectionOrder: event.target.value
                }))
              }
              placeholder="Section order, one section per line"
            />
            <Textarea
              className="min-h-[160px] font-mono text-sm"
              value={reportBlueprint.sectionIntents}
              onChange={(event) =>
                setReportBlueprint((current) => ({
                  ...current,
                  sectionIntents: event.target.value
                }))
              }
              placeholder='{"core_pattern":"Explain the main mechanism"}'
            />
            <Textarea
              className="min-h-[160px] font-mono text-sm"
              value={reportBlueprint.sectionRoleBoundaries}
              onChange={(event) =>
                setReportBlueprint((current) => ({
                  ...current,
                  sectionRoleBoundaries: event.target.value
                }))
              }
              placeholder='{"pressure_points":"Do not duplicate core pattern wording"}'
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Textarea
              className="min-h-[132px]"
              value={reportBlueprint.reflectionActionFraming}
              onChange={(event) =>
                setReportBlueprint((current) => ({
                  ...current,
                  reflectionActionFraming: event.target.value
                }))
              }
              placeholder="Reflection/action framing"
            />
            <Textarea
              className="min-h-[132px]"
              value={reportBlueprint.relatedInsightsLogic}
              onChange={(event) =>
                setReportBlueprint((current) => ({
                  ...current,
                  relatedInsightsLogic: event.target.value
                }))
              }
              placeholder="Related insights logic"
            />
          </div>
          <Button
            size="lg"
            disabled={savingSection === "reportBlueprint"}
            onClick={() => {
              try {
                void saveSection("reportBlueprint", {
                  ...reportBlueprint,
                  sectionOrder: parseLineList(reportBlueprint.sectionOrder),
                  sectionIntents: parseJsonInput(
                    reportBlueprint.sectionIntents,
                    "Section intents"
                  ),
                  sectionRoleBoundaries: parseJsonInput(
                    reportBlueprint.sectionRoleBoundaries,
                    "Section role boundaries"
                  )
                });
              } catch (nextError) {
                setError(
                  nextError instanceof Error
                    ? nextError.message
                    : "The report blueprint could not be saved."
                );
              }
            }}
          >
            {savingSection === "reportBlueprint" ? "Saving..." : "Save Report Blueprint"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/admin/assessment-drafts" variant="outline" size="lg">
          Back To Draft List
        </LinkButton>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={
            publishing ||
            metadata.reviewStatus !== "APPROVED" ||
            Boolean(generatingSection) ||
            Boolean(savingSection)
          }
          onClick={() => void publishDraft()}
        >
          {publishing
            ? "Publishing..."
            : metadata.publishStatus === "PUBLISHED"
              ? "Republish Live Draft"
              : "Publish Draft"}
        </Button>
      </div>
    </div>
  );
}
