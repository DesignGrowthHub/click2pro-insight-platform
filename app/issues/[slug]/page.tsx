import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { IssuePageTemplate } from "@/components/issues/issue-page-template";
import {
  getAllIssuePageSlugs,
  getIssuePageBySlug,
  validateIssuePageAssessmentLink
} from "@/lib/content/issue-pages";

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
  const issuePage = getIssuePageBySlug(slug);

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
  const issuePage = getIssuePageBySlug(slug);

  if (!issuePage || !validateIssuePageAssessmentLink(issuePage)) {
    notFound();
  }

  return <IssuePageTemplate issuePage={issuePage} />;
}
