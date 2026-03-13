import { AssessmentLibraryShell } from "@/components/assessments/assessment-library-shell";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "@/components/ui/section-shell";
import { assessments, featuredAssessmentSlugs } from "@/lib/assessments";

type AssessmentsPageProps = {
  searchParams: Promise<{
    q?: string;
    theme?: string;
  }>;
};

export default async function AssessmentsPage({
  searchParams
}: AssessmentsPageProps) {
  const params = await searchParams;

  return (
    <main>
      <SectionShell className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">Insight library</Badge>
            <Badge variant="outline">{`${assessments.length} assessments`}</Badge>
          </div>
          <div className="space-y-2.5">
            <h1 className="page-title max-w-3xl">
              Find the assessment that fits what feels active right now.
            </h1>
            <p className="body-sm reading-column-tight max-w-2xl">
              Search by question, feeling, or pattern first, then narrow quickly
              to the best fit.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <AssessmentLibraryShell
          assessments={assessments}
          featuredSlugs={[...featuredAssessmentSlugs]}
          initialQuery={params.q ?? ""}
          initialThemeSlug={params.theme ?? null}
        />
      </SectionShell>
    </main>
  );
}
