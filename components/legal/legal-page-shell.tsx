import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageShellProps = {
  title: string;
  description: string;
  badge: string;
  sections: LegalSection[];
  note?: string;
};

export function LegalPageShell({
  title,
  description,
  badge,
  sections,
  note
}: LegalPageShellProps) {
  return (
    <main>
      <SectionShell className="pb-8 pt-10 sm:pt-14">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">{badge}</Badge>
            <Badge variant="outline">Updated March 11, 2026</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="page-title max-w-4xl">{title}</h1>
            <p className="body-lg reading-column-tight max-w-3xl">{description}</p>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0" variant="subtle">
        <div className="grid gap-5">
          {sections.map((section, index) => (
            <Card key={section.title} variant={index === 0 ? "raised" : "default"}>
              <CardHeader className="space-y-4">
                <Badge variant="outline">{`Section ${String(index + 1).padStart(2, "0")}`}</Badge>
                <CardTitle className="text-[1.55rem] sm:text-[1.75rem]">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="body-md reading-column-tight">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}

          {note ? (
            <Card>
              <CardHeader className="space-y-4">
                <Badge variant="outline">Note</Badge>
                <CardTitle className="text-[1.4rem]">Platform scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body-md reading-column-tight">{note}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </SectionShell>
    </main>
  );
}
