"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AssessmentDraftCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [topicFamily, setTopicFamily] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [emotionalGoal, setEmotionalGoal] = useState("");
  const [requestedQuestionCount, setRequestedQuestionCount] = useState("30");
  const [desiredTone, setDesiredTone] = useState("calm, analytical, premium");
  const [requestedDimensions, setRequestedDimensions] = useState("");
  const [previewEmphasisNotes, setPreviewEmphasisNotes] = useState("");
  const [reportEmphasisNotes, setReportEmphasisNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const derivedSlug = useMemo(() => (slug.trim() ? slug : slugify(title)), [slug, title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/assessment-drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          slug: derivedSlug,
          topicFamily,
          targetAudience,
          emotionalGoal,
          requestedQuestionCount: requestedQuestionCount
            ? Number(requestedQuestionCount)
            : null,
          desiredTone,
          requestedDimensions: requestedDimensions
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          previewEmphasisNotes,
          reportEmphasisNotes,
          notes
        })
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        draft?: { id: string };
      };

      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.error ?? "The draft could not be created.");
      }

      router.push(`/admin/assessment-drafts/${payload.draft.id}`);
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "The draft could not be created."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card variant="raised">
      <CardHeader className="space-y-4">
        <CardTitle className="text-[1.7rem]">Create a draft shell</CardTitle>
        <p className="body-md max-w-3xl">
          This creates a real draft record for editorial work, manual review, and later AI generation.
          Nothing here is published live yet.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-title">
                Title
              </label>
              <Input
                id="draft-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Imposter Syndrome Deep Report"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-slug">
                Slug
              </label>
              <Input
                id="draft-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder={derivedSlug || "imposter-syndrome-deep-report"}
              />
              <p className="text-xs leading-6 text-muted">
                Final slug: <span className="font-medium text-foreground">{derivedSlug || "—"}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-topic-family">
                Topic family
              </label>
              <Input
                id="draft-topic-family"
                value={topicFamily}
                onChange={(event) => setTopicFamily(event.target.value)}
                placeholder="Self-perception"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-target-audience">
                Target audience
              </label>
              <Input
                id="draft-target-audience"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="High-functioning professionals"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-question-count">
                Requested questions
              </label>
              <Input
                id="draft-question-count"
                type="number"
                min={1}
                value={requestedQuestionCount}
                onChange={(event) => setRequestedQuestionCount(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-emotional-goal">
                Emotional goal
              </label>
              <Textarea
                id="draft-emotional-goal"
                className="min-h-[132px]"
                value={emotionalGoal}
                onChange={(event) => setEmotionalGoal(event.target.value)}
                placeholder="Help users feel accurately seen, calmer, and clearer about the loop they are in."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-desired-tone">
                Desired tone
              </label>
              <SelectField
                id="draft-desired-tone"
                value={desiredTone}
                onChange={(event) => setDesiredTone(event.target.value)}
              >
                <option value="calm, analytical, premium">Calm, analytical, premium</option>
                <option value="emotionally precise, reflective, premium">
                  Emotionally precise, reflective, premium
                </option>
                <option value="structured, practical, premium">
                  Structured, practical, premium
                </option>
              </SelectField>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="draft-requested-dimensions">
                  Requested dimensions
                </label>
                <Input
                  id="draft-requested-dimensions"
                  value={requestedDimensions}
                  onChange={(event) => setRequestedDimensions(event.target.value)}
                  placeholder="comparison sensitivity, praise resistance, exposure pressure"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-preview-notes">
                Preview emphasis notes
              </label>
              <Textarea
                id="draft-preview-notes"
                className="min-h-[132px]"
                value={previewEmphasisNotes}
                onChange={(event) => setPreviewEmphasisNotes(event.target.value)}
                placeholder="Keep the locked preview focused on competence pressure and internal doubt."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="draft-report-notes">
                Report emphasis notes
              </label>
              <Textarea
                id="draft-report-notes"
                className="min-h-[132px]"
                value={reportEmphasisNotes}
                onChange={(event) => setReportEmphasisNotes(event.target.value)}
                placeholder="Push interpretation toward performance masking, internal standards, and social evaluation loops."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="draft-notes">
              Admin notes
            </label>
            <Textarea
              id="draft-notes"
              className="min-h-[132px]"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional editorial notes, review reminders, or generation instructions."
            />
          </div>

          {error ? (
            <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button size="xl" disabled={isSubmitting}>
              {isSubmitting ? "Creating draft..." : "Create Draft"}
            </Button>
            <LinkButton href="/admin/assessment-drafts" variant="outline" size="lg">
              Back To Drafts
            </LinkButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
