import { Container } from "@/components/ui/container";
import {
  AssessmentIcon,
  ChartIcon,
  InsightIcon,
  LibraryIcon,
  ShieldIcon,
  SparkIcon
} from "@/components/ui/icons";

const credibilityItems = [
  { label: "Private response handling", Icon: ShieldIcon },
  { label: "Behavioral insight frameworks", Icon: AssessmentIcon },
  { label: "Structured pattern analysis", Icon: ChartIcon },
  { label: "Psychology insight focus", Icon: InsightIcon },
  { label: "Emotional clarity tools", Icon: SparkIcon },
  { label: "Reflection-based reports", Icon: LibraryIcon }
] as const;

export function CredibilityMarquee() {
  const items = [...credibilityItems, ...credibilityItems];

  return (
    <section className="pb-8 sm:pb-10">
      <Container>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="insight-label">Trusted indicators</p>
          <p className="text-sm leading-7 text-muted">
            Signals of privacy, structure, and reflective insight.
          </p>
        </div>
        <div className="credibility-marquee-shell">
          <div className="credibility-marquee-track">
            {items.map(({ label, Icon }, index) => (
              <div
                key={`${label}-${index}`}
                className="credibility-chip"
                aria-hidden={index >= credibilityItems.length}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.03] text-foreground/70">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground/78">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
