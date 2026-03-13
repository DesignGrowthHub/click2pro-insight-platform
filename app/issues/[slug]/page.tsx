import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { IssuePageTemplate } from "@/components/issues/issue-page-template";
import {
  getAllIssuePageSlugs,
  getIssuePageBySlug,
  validateIssuePageAssessmentLink
} from "@/lib/content/issue-pages";
import { getAssessmentDefinitionBySlug } from "@/lib/assessments";
import {
  getPublishedAssessmentDefinitionBySlug,
  getPublishedIssuePageBySlug
} from "@/lib/server/services/published-assessments";

type IssuePageRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllIssuePageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: IssuePageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const issuePage =
    (await getPublishedIssuePageBySlug(slug)) ?? getIssuePageBySlug(slug);

  if (!issuePage) {
    return {
      title: "Issue Page | Click2Pro Insight",
      description: "Structured issue pages that guide users into the right assessment."
    };
  }

  return {
    title: issuePage.seoTitle,
    description: issuePage.metaDescription
  };
}

export default async function IssuePageRoute({ params }: IssuePageRouteProps) {
  const { slug } = await params;
  const publishedIssuePage = await getPublishedIssuePageBySlug(slug);
  const seededIssuePage = getIssuePageBySlug(slug);
  const issuePage = publishedIssuePage ?? seededIssuePage;

  if (!issuePage) {
    notFound();
  }

  const hasLinkedAssessment = publishedIssuePage
    ? Boolean(
        (await getPublishedAssessmentDefinitionBySlug(issuePage.linkedAssessmentSlug)) ??
          getAssessmentDefinitionBySlug(issuePage.linkedAssessmentSlug)
      )
    : validateIssuePageAssessmentLink(issuePage);

  if (!hasLinkedAssessment) {
    notFound();
  }

  return <IssuePageTemplate issuePage={issuePage} />;
}
