"use client";

import { Badge } from "@/components/ui/badge";

type AssessmentDraftStatusBadgesProps = {
  generationStatus: string;
  reviewStatus: string;
  publishStatus: string;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}

export function AssessmentDraftStatusBadges({
  generationStatus,
  reviewStatus,
  publishStatus
}: AssessmentDraftStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Generation: {formatLabel(generationStatus)}</Badge>
      <Badge variant="outline">Review: {formatLabel(reviewStatus)}</Badge>
      <Badge variant="outline">Publish: {formatLabel(publishStatus)}</Badge>
    </div>
  );
}
