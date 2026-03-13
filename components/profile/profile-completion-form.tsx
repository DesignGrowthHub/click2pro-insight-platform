"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeProfileNextPath } from "@/lib/profile/completion";

type ProfileCompletionFormProps = {
  initialValues: {
    fullName: string;
    preferredName: string;
    ageRange: string;
    country: string;
    region: string;
    occupationOrLifeStage: string;
    primaryConcern: string;
    profileCompleted: boolean;
  };
  nextPath: string;
  requireCompletion?: boolean;
};

const ageRangeOptions = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+"
] as const;

const lifeStageOptions = [
  "Student",
  "Early career",
  "Mid-career",
  "Leadership / founder",
  "Parent / caregiver",
  "In transition",
  "Prefer not to label it"
] as const;

export function ProfileCompletionForm({
  initialValues,
  nextPath,
  requireCompletion = false
}: ProfileCompletionFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [preferredName, setPreferredName] = useState(initialValues.preferredName);
  const [ageRange, setAgeRange] = useState(initialValues.ageRange);
  const [country, setCountry] = useState(initialValues.country);
  const [region, setRegion] = useState(initialValues.region);
  const [occupationOrLifeStage, setOccupationOrLifeStage] = useState(
    initialValues.occupationOrLifeStage
  );
  const [primaryConcern, setPrimaryConcern] = useState(initialValues.primaryConcern);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const safeNextPath = useMemo(() => sanitizeProfileNextPath(nextPath), [nextPath]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "complete",
          fullName,
          preferredName,
          ageRange,
          country,
          region,
          occupationOrLifeStage,
          primaryConcern
        })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Your profile could not be saved.");
      }

      router.push(safeNextPath);
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Your profile could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSkip() {
    setIsSkipping(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "skip"
        })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "This step could not be skipped right now.");
      }

      router.push(safeNextPath);
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "This step could not be skipped right now."
      );
    } finally {
      setIsSkipping(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-[20px] border border-border/60 bg-surface-elevated px-4 py-3 text-sm leading-7 text-secondary">
        {requireCompletion
          ? "Complete this short profile to personalize the unlocked report and save it with the right context in your account."
          : "Complete this once to make your dashboard and saved reports feel more personal. You can skip for now and come back later."}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-full-name">
            Full name
          </label>
          <Input
            id="profile-full-name"
            autoComplete="name"
            placeholder="Your name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-preferred-name">
            Preferred name
          </label>
          <Input
            id="profile-preferred-name"
            autoComplete="nickname"
            placeholder="How you want the report addressed"
            value={preferredName}
            onChange={(event) => setPreferredName(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-age-range">
            Age range
          </label>
          <SelectField
            id="profile-age-range"
            value={ageRange}
            onChange={(event) => setAgeRange(event.target.value)}
          >
            <option value="">Select age range</option>
            {ageRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-life-stage">
            Occupation or life stage
          </label>
          <SelectField
            id="profile-life-stage"
            value={occupationOrLifeStage}
            onChange={(event) => setOccupationOrLifeStage(event.target.value)}
          >
            <option value="">Select one</option>
            {lifeStageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-country">
            Country
          </label>
          <Input
            id="profile-country"
            autoComplete="country-name"
            placeholder="United States"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="profile-region">
            State or region
          </label>
          <Input
            id="profile-region"
            autoComplete="address-level1"
            placeholder="California"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="profile-primary-concern">
          Primary concern
        </label>
        <Textarea
          id="profile-primary-concern"
          placeholder="What feels most important to understand right now?"
          value={primaryConcern}
          onChange={(event) => setPrimaryConcern(event.target.value)}
          required
        />
      </div>

      {error ? (
        <div className="rounded-[22px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button size="xl" className="w-full sm:w-auto" disabled={isSaving || isSkipping}>
            {isSaving
              ? "Saving profile..."
              : initialValues.profileCompleted
                ? "Update Profile"
                : "Save And Continue"}
          </Button>
          {!requireCompletion ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => void handleSkip()}
              disabled={isSaving || isSkipping}
            >
              {isSkipping ? "Skipping..." : "Skip For Now"}
            </Button>
          ) : null}
        </div>
        {!requireCompletion ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm leading-6 text-muted">
              You can still continue without completing this step.
            </span>
            <LinkButton
              href={safeNextPath}
              variant="outline"
              size="sm"
              className="h-auto min-h-0 px-3 py-1.5"
            >
              Return Without Saving
            </LinkButton>
          </div>
        ) : null}
      </div>
    </form>
  );
}
