"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRightIcon, ChevronDownIcon, ShieldIcon } from "@/components/ui/icons";
import { SectionShell } from "@/components/ui/section-shell";
import type { IssuePageContent } from "@/lib/content/issue-pages";
import { cn } from "@/lib/utils";

type IssuePageTemplateProps = {
  issuePage: IssuePageContent;
};

function heroVisualClass(imageType: IssuePageContent["heroImageType"]) {
  if (imageType === "soft_gradient") {
    return "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),rgba(15,23,42,0.94)_58%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]";
  }

  if (imageType === "none") {
    return "bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))]";
  }

  return "bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_72%_68%,rgba(59,130,246,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]";
}

export function IssuePageTemplate({ issuePage }: IssuePageTemplateProps) {
  const assessmentHref = `/assessments/${issuePage.linkedAssessmentSlug}/take`;
  const reflectionCards = [...issuePage.reflections, ...issuePage.reflections];
  const issueSectionWidth = "max-w-6xl";

  return (
    <main className="pb-20">
      <SectionShell
        className="pb-6 pt-10 sm:pb-8 sm:pt-14 lg:pt-16"
        contentClassName={issueSectionWidth}
      >
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center xl:gap-10">
          <div className="space-y-5">
            <Badge variant="outline">Issue page</Badge>
            <div className="space-y-3">
              <h1 className="display-title max-w-4xl">{issuePage.publicTopicTitle}</h1>
              <p className="body-lg reading-column-tight max-w-[38rem]">
                {issuePage.publicTopicSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <LinkButton href={assessmentHref} size="xl">
                {issuePage.heroCtaLabel}
                <ArrowUpRightIcon className="h-4 w-4" />
              </LinkButton>
            </div>
            <div className="inline-flex max-w-[34rem] items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-muted">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[14px] border border-primary/18 bg-primary/10 text-primary">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <span>{issuePage.heroTrustNote}</span>
            </div>
          </div>

          <Card
            variant="raised"
            className={cn("min-h-[300px] overflow-hidden", heroVisualClass(issuePage.heroImageType))}
          >
            <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7">
              <div className="space-y-3">
                <p className="insight-label">A quieter starting point</p>
                <p className="max-w-[26rem] text-[1.45rem] font-semibold leading-[1.5] tracking-[-0.03em] text-foreground sm:text-[1.7rem]">
                  Sometimes the pattern is not dramatic. It is just the steady feeling that your own read is harder to trust than it should be.
                </p>
                <p className="max-w-[24rem] text-sm leading-7 text-muted">
                  This page is meant to help you begin from that feeling, without needing to explain it perfectly first.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="space-y-2 text-sm leading-7 text-muted">
                  <p>Start with the issue in plain language.</p>
                  <p>Continue directly into the existing assessment flow.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        title={issuePage.reassuranceTitle}
        description={issuePage.reassuranceBody}
        variant="subtle"
        className="py-6 sm:py-8 lg:py-9"
        contentClassName={issueSectionWidth}
      >
        <div />
      </SectionShell>

      {issuePage.reflections.length > 0 ? (
        <SectionShell
          title="Private reflection examples"
          description="Anonymized reflection-style notes to help you recognize how this issue often feels from the inside."
          className="py-6 sm:py-8 lg:py-9"
          contentClassName={issueSectionWidth}
        >
          <div className="credibility-marquee-shell">
            <div className="credibility-marquee-track">
              {reflectionCards.map((item, index) => (
                <Card
                  key={`${item.label}-${index}`}
                  className="min-h-[220px] w-[320px] shrink-0 overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_18px_40px_rgba(2,6,23,0.18)]"
                  aria-hidden={index >= issuePage.reflections.length}
                >
                  <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/18 bg-primary/10 text-sm font-semibold tracking-[0.08em] text-primary">
                          {item.initials}
                        </span>
                        <p className="text-sm font-medium text-foreground/88">{item.label}</p>
                      </div>
                      <p className="text-sm leading-7 text-foreground/92">“{item.quote}”</p>
                    </div>
                    <p className="insight-label">Anonymized reflection</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SectionShell>
      ) : null}

      <SectionShell
        title={issuePage.clarifiesTitle}
        description="The assessment is meant to make the pattern easier to read before you decide whether the deeper report feels relevant."
        className="py-6 sm:py-8 lg:py-9"
        contentClassName={issueSectionWidth}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {issuePage.clarifiesItems.map((item) => (
            <div
              key={item}
              className="surface-block px-5 py-5 text-base leading-8 text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title={issuePage.faqTitle}
        description="Short answers to the questions people usually have before they begin."
        variant="panel"
        className="py-6 sm:py-8 lg:py-9"
        contentClassName={issueSectionWidth}
      >
        <IssuePageFaq items={issuePage.faqItems} />
      </SectionShell>

      <SectionShell className="py-6 sm:py-8 lg:py-9" contentClassName={issueSectionWidth}>
        <Card variant="raised" className="mx-auto max-w-4xl overflow-hidden">
          <CardHeader className="space-y-4">
            <Badge variant="accent">Ready when you are</Badge>
            <CardTitle className="text-[1.8rem] sm:text-[2rem]">
              {issuePage.finalCtaTitle ?? "Start the assessment when this issue feels close enough to name."}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="body-md max-w-2xl">
              {issuePage.finalCtaBody ??
                "The assessment opens immediately and continues through the existing private reflection flow."}
            </p>
            <LinkButton href={assessmentHref} size="xl">
              {issuePage.finalCtaLabel ?? issuePage.heroCtaLabel}
            </LinkButton>
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}

type IssuePageFaqProps = {
  items: readonly {
    question: string;
    answer: string;
  }[];
};

function IssuePageFaq({ items }: IssuePageFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto grid max-w-5xl gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <Card key={item.question} className="overflow-hidden">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-white/[0.02] sm:px-6 sm:py-4"
              aria-expanded={isOpen}
              onClick={() => {
                setOpenIndex(isOpen ? null : index);
              }}
            >
              <div className="space-y-2 text-left">
                <p className="text-[1rem] font-semibold leading-7 text-foreground sm:text-[1.04rem]">
                  {item.question}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-muted transition-transform duration-300",
                  isOpen && "rotate-180 text-foreground"
                )}
              >
                <ChevronDownIcon className="h-4 w-4" />
              </span>
            </button>
            <div className={cn("faq-panel", isOpen && "faq-panel-open")}>
              <div className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                <div className="subtle-divider mb-4" />
                <p className="text-sm leading-7 text-muted">{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
