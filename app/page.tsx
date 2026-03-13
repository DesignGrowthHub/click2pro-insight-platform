import Link from "next/link";

import { ProblemSearchEntry } from "@/components/discovery/problem-search-entry";
import { HeroPreviewPanel } from "@/components/home/hero-preview-panel";
import { LaunchAssessmentCard } from "@/components/home/launch-assessment-card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { ArrowUpRightIcon, ClockIcon, ReportIcon, ShieldIcon } from "@/components/ui/icons";
import { SectionShell } from "@/components/ui/section-shell";
import { assessments, featuredAssessmentSlugs } from "@/lib/assessments";

const heroTrustPoints = [
  {
    title: "Private and structured",
    icon: ShieldIcon
  },
  {
    title: "Usually a few focused minutes",
    icon: ClockIcon
  },
  {
    title: "Preview first, full report only if useful",
    icon: ReportIcon
  }
] as const;

export default function HomePage() {
  const topAssessments = assessments.slice(0, 10);
  const featuredAssessments = topAssessments.filter((assessment) =>
    featuredAssessmentSlugs.includes(
      assessment.slug as (typeof featuredAssessmentSlugs)[number]
    )
  );
  const highlightedAssessments =
    featuredAssessments.length > 0 ? featuredAssessments.slice(0, 3) : topAssessments.slice(0, 3);
  const secondaryAssessments = topAssessments.filter(
    (assessment) => !highlightedAssessments.some((featured) => featured.slug === assessment.slug)
  );
  const previewAssessment = highlightedAssessments[1] ?? highlightedAssessments[0] ?? topAssessments[0];

  if (!previewAssessment) {
    return null;
  }

  return (
    <main className="pb-24">
      <SectionShell className="pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center xl:gap-12">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">Behavioral insight platform</Badge>
              <Badge variant="outline">Private guided assessments</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="display-title max-w-4xl">
                Structured assessments for the emotional and behavioral patterns you
                want to understand more clearly.
              </h1>
              <p className="body-lg max-w-[39rem] reading-column-tight">
                Start with the issue already taking up mental space, see a clear
                preview, and only open the deeper report if it feels genuinely
                useful.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <LinkButton href="/assessments" size="xl">
                Start An Assessment
                <ArrowUpRightIcon className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/assessments" variant="outline" size="xl">
                Browse Assessments
              </LinkButton>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroTrustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-muted"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <HeroPreviewPanel
            highlightedAssessments={highlightedAssessments}
            previewAssessment={previewAssessment}
            previewContent={{
              title: "Insight preview",
              summary:
                "A short assessment first, a credible opening read second, and the deeper report only if the pattern already feels real.",
              tendencies: [
                "Pattern read: the clearest active signal",
                "Behavioral proof: strongest scored dimensions",
                "Full report: deeper interpretation stays locked until purchase"
              ],
              boundary:
                "The paid report expands into pressure points, repeating tendencies, hidden friction, and stabilizing directions without turning the experience into a long intake process."
            }}
          />
        </div>
      </SectionShell>

      <SectionShell
        className="pt-0"
        eyebrow="Start with the issue"
        title="Find the right assessment in a few seconds."
        description="Search by question, feeling, or repeated pattern. You do not need to know the assessment name first."
        variant="subtle"
      >
        <ProblemSearchEntry compact className="reveal-soft" />
      </SectionShell>

      <SectionShell
        eyebrow="Featured assessments"
        title="The clearest starting points in the library."
        description="These are the strongest entry assessments for relationship loops, self-doubt, and attachment patterns."
        variant="panel"
        actions={
          <LinkButton href="/assessments" variant="outline" size="lg">
            Browse All Assessments
          </LinkButton>
        }
      >
        <div className="grid gap-5 xl:grid-cols-3">
          {highlightedAssessments.map((assessment, index) => (
            <LaunchAssessmentCard
              key={assessment.slug}
              assessment={assessment}
              launchLabel={`Featured 0${index + 1}`}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Top 10 assessments"
        title="Explore the core assessment library."
        description="A compact view of the most important launch assessments so users can scan quickly without landing in a crowded catalog."
        variant="subtle"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {secondaryAssessments.map((assessment) => (
            <Link
              key={assessment.slug}
              href={`/assessments/${assessment.slug}`}
              className="group rounded-[26px] border border-white/10 bg-white/[0.03] px-5 py-5 transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="insight-label">{assessment.category}</p>
                  <h3 className="text-[1.02rem] font-semibold leading-7 text-foreground transition-colors group-hover:text-primary">
                    {assessment.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted">{assessment.tagline}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted">
                  {assessment.timeEstimate}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="rounded-[34px] border border-primary/18 bg-[linear-gradient(135deg,rgba(28,43,72,0.98),rgba(17,24,39,0.95)_58%,rgba(11,18,32,0.98))] px-7 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="accent">Begin here</Badge>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2.8rem]">
                Start with one question that already feels active.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted">
                The product works best when it helps clarify one live pattern at a time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <LinkButton href="/assessments" size="xl">
                Start Assessment
                <ArrowUpRightIcon className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="xl">
                View Pricing
              </LinkButton>
            </div>
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
