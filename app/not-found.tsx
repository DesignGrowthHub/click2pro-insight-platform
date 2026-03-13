import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";

export default function NotFound() {
  return (
    <main>
      <SectionShell className="pt-16 sm:pt-24">
        <Card variant="raised" className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-3xl sm:text-4xl">
              That route does not exist in the current app shell.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="body-lg">
              Use the assessment library or homepage to continue exploring the
              current foundation.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/" size="lg">
                Return Home
              </LinkButton>
              <LinkButton href="/assessments" variant="outline" size="lg">
                View Assessments
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}
