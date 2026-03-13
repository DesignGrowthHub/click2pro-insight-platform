import "server-only";

import type { PaymentProvider, PurchaseStatus, PurchaseType, Prisma } from "@prisma/client";

import { getAssessmentDefinitionBySlug } from "@/lib/assessments";
import { prisma } from "@/lib/db/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

type CurrencyAggregateRow = {
  currency: string;
  _sum: {
    amountCents: number | null;
  };
  _count: {
    _all: number;
  };
};

type CurrencyAmount = {
  currency: string;
  amountCents: number;
};

type CurrencyBreakdown = Array<CurrencyAmount>;

type AssessmentMetric = {
  assessmentSlug: string;
  assessmentTitle: string;
  count: number;
  revenueByCurrency?: CurrencyBreakdown;
};

export type AdminOverviewData = {
  headlineMetrics: {
    totalUsers: number;
    newUsersLast7Days: number;
    totalPaidPurchases: number;
    paidPurchasesLast7Days: number;
    paidPurchasesLast30Days: number;
    trackedAssessmentSessions: number;
    completedAssessmentSessions: number;
    paidAssessmentSessions: number;
    readyReports: number;
    unlockedReports: number;
  };
  revenueByCurrency: {
    lifetime: CurrencyBreakdown;
    last7Days: CurrencyBreakdown;
    last30Days: CurrencyBreakdown;
  };
  recentSignups: Array<{
    id: string;
    fullName: string | null;
    email: string;
    country: string | null;
    region: string | null;
    createdAt: Date;
  }>;
  recentPurchases: Array<{
    id: string;
    userEmail: string;
    userName: string | null;
    title: string;
    assessmentSlug: string | null;
    amountCents: number;
    currency: string;
    paymentProvider: PaymentProvider | null;
    purchaseType: PurchaseType;
    purchasedAt: Date | null;
    createdAt: Date;
    status: PurchaseStatus;
  }>;
  topPurchasedAssessments: AssessmentMetric[];
  topCompletedAssessments: AssessmentMetric[];
  topTrackedAssessments: AssessmentMetric[];
  paidPurchaseProviderSplit: Array<{
    provider: PaymentProvider | null;
    purchaseCount: number;
    revenueByCurrency: CurrencyBreakdown;
  }>;
  paidPurchaseRegionSplit: Array<{
    regionKey: string;
    purchaseCount: number;
    revenueByCurrency: CurrencyBreakdown;
  }>;
  unavailableMetrics: string[];
};

export type AdminUsersPageData = {
  summary: {
    totalUsers: number;
    newUsersLast7Days: number;
    buyersCount: number;
    reportOwnersCount: number;
    profileCompletedCount: number;
  };
  query: string;
  users: Array<{
    id: string;
    fullName: string | null;
    preferredName: string | null;
    email: string;
    createdAt: Date;
    country: string | null;
    region: string | null;
    profileCompleted: boolean;
    primaryConcern: string | null;
    purchasesCount: number;
    reportsOwnedCount: number;
    latestPurchaseAt: Date | null;
    lastTrackedActivityAt: Date | null;
  }>;
};

export type AdminPurchasesPageData = {
  filters: {
    query: string;
    status: string;
    provider: string;
    purchaseType: string;
  };
  summary: {
    matchingPurchases: number;
    matchingPaidPurchases: number;
    uniqueBuyers: number;
    paidRevenueByCurrency: CurrencyBreakdown;
  };
  purchases: Array<{
    id: string;
    purchasedAt: Date | null;
    createdAt: Date;
    userEmail: string;
    userName: string | null;
    userProfileCompleted: boolean;
    userPrimaryConcern: string | null;
    title: string | null;
    assessmentSlug: string | null;
    amountCents: number;
    currency: string;
    paymentProvider: PaymentProvider | null;
    purchaseType: PurchaseType;
    status: PurchaseStatus;
    checkoutIntentId: string | null;
    reportCount: number;
  }>;
};

export type AdminAnalyticsPageData = {
  availabilityNotes: string[];
  funnelSnapshot: {
    sourceAttributionRecords: number;
    attributedAssessmentSessions: number;
    attributedPaidPurchases: number;
    completedAssessmentSessions: number;
    paidAssessmentSessions: number;
    paidFromCompletedRate: number | null;
  };
  assessmentAnalytics: Array<{
    assessmentSlug: string;
    assessmentTitle: string;
    trackedSessions: number;
    completedSessions: number;
    paidPurchases: number;
    paidFromCompletedRate: number | null;
    revenueByCurrency: CurrencyBreakdown;
  }>;
  sourceAnalytics: Array<{
    sourceLabel: string;
    sourceTopic: string | null;
    linkedAssessmentSlug: string | null;
    attributedSessions: number;
    attributedCheckouts: number;
    attributedPaidPurchases: number;
    paidRevenueByCurrency: CurrencyBreakdown;
    latestTouchAt: Date;
  }>;
  providerSplit: Array<{
    provider: PaymentProvider | null;
    purchaseCount: number;
    revenueByCurrency: CurrencyBreakdown;
  }>;
  regionSplit: Array<{
    regionKey: string;
    purchaseCount: number;
    revenueByCurrency: CurrencyBreakdown;
  }>;
  currencySplit: CurrencyBreakdown;
};

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

function assessmentTitleForSlug(slug: string | null | undefined, fallback?: string | null) {
  if (!slug) {
    return fallback ?? "Unknown assessment";
  }

  return fallback ?? getAssessmentDefinitionBySlug(slug)?.title ?? slug;
}

function pushCurrencyAmount(map: Map<string, number>, currency: string | null | undefined, amountCents: number | null | undefined) {
  if (!currency || amountCents == null) {
    return;
  }

  map.set(currency, (map.get(currency) ?? 0) + amountCents);
}

function currencyMapToBreakdown(map: Map<string, number>): CurrencyBreakdown {
  return [...map.entries()]
    .map(([currency, amountCents]) => ({
      currency,
      amountCents
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

function normalizeCurrencyRows(rows: CurrencyAggregateRow[]): CurrencyBreakdown {
  return rows
    .map((row) => ({
      currency: row.currency,
      amountCents: row._sum.amountCents ?? 0
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

function maxDate(values: Array<Date | null | undefined>) {
  return values
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
}

function buildPurchaseWhere(filters: {
  query?: string;
  status?: string;
  provider?: string;
  purchaseType?: string;
}): Prisma.PurchaseWhereInput {
  const query = filters.query?.trim();
  const status = filters.status?.trim().toUpperCase();
  const provider = filters.provider?.trim().toUpperCase();
  const purchaseType = filters.purchaseType?.trim().toUpperCase();

  return {
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              assessmentSlug: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              productReference: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              user: {
                email: {
                  contains: query,
                  mode: "insensitive"
                }
              }
            },
            {
              user: {
                fullName: {
                  contains: query,
                  mode: "insensitive"
                }
              }
            }
          ]
        }
      : {}),
    ...(status ? { status: status as PurchaseStatus } : {}),
    ...(provider ? { paymentProvider: provider as PaymentProvider } : {}),
    ...(purchaseType ? { purchaseType: purchaseType as PurchaseType } : {})
  };
}

function sourceLabel(source: {
  sourceBlogUrl: string | null;
  sourceBlogSlug: string | null;
  landingPath: string | null;
  sourceTopic: string | null;
}) {
  return (
    source.sourceBlogUrl ??
    source.sourceBlogSlug ??
    source.landingPath ??
    source.sourceTopic ??
    "Direct / unattributed"
  );
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const sevenDaysAgo = daysAgo(7);
  const thirtyDaysAgo = daysAgo(30);

  const [
    totalUsers,
    newUsersLast7Days,
    totalPaidPurchases,
    paidPurchasesLast7Days,
    paidPurchasesLast30Days,
    trackedAssessmentSessions,
    completedAssessmentSessions,
    paidAssessmentSessions,
    readyReports,
    unlockedReports,
    recentSignups,
    recentPurchases,
    lifetimeRevenueRows,
    last7DayRevenueRows,
    last30DayRevenueRows,
    purchasedAssessmentGroups,
    completedAssessmentGroups,
    trackedAssessmentGroups,
    providerGroups,
    regionGroups
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    }),
    prisma.purchase.count({
      where: {
        status: "PAID"
      }
    }),
    prisma.purchase.count({
      where: {
        status: "PAID",
        purchasedAt: {
          gte: sevenDaysAgo
        }
      }
    }),
    prisma.purchase.count({
      where: {
        status: "PAID",
        purchasedAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    prisma.assessmentSession.count(),
    prisma.assessmentSession.count({
      where: {
        completedAt: {
          not: null
        }
      }
    }),
    prisma.assessmentSession.count({
      where: {
        status: "PAID"
      }
    }),
    prisma.report.count({
      where: {
        status: "READY"
      }
    }),
    prisma.report.count({
      where: {
        accessStatus: {
          in: ["OWNED", "BUNDLE", "MEMBERSHIP"]
        }
      }
    }),
    prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        country: true,
        region: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 8
    }),
    prisma.purchase.findMany({
      where: {
        status: "PAID"
      },
      select: {
        id: true,
        title: true,
        assessmentSlug: true,
        amountCents: true,
        currency: true,
        paymentProvider: true,
        purchaseType: true,
        purchasedAt: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            email: true,
            fullName: true,
            profileCompleted: true,
            primaryConcern: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 8
    }),
    prisma.purchase.groupBy({
      by: ["currency"],
      where: {
        status: "PAID"
      },
      _sum: {
        amountCents: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["currency"],
      where: {
        status: "PAID",
        purchasedAt: {
          gte: sevenDaysAgo
        }
      },
      _sum: {
        amountCents: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["currency"],
      where: {
        status: "PAID",
        purchasedAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        amountCents: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["assessmentSlug", "currency"],
      where: {
        status: "PAID",
        assessmentSlug: {
          not: null
        }
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    }),
    prisma.assessmentSession.groupBy({
      by: ["assessmentSlug"],
      where: {
        completedAt: {
          not: null
        }
      },
      _count: {
        _all: true
      }
    }),
    prisma.assessmentSession.groupBy({
      by: ["assessmentSlug"],
      _count: {
        _all: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["paymentProvider", "currency"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    }),
    prisma.checkoutIntent.groupBy({
      by: ["regionKey", "currency"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    })
  ]);

  const purchasedByAssessment = new Map<
    string,
    { count: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of purchasedAssessmentGroups) {
    if (!row.assessmentSlug) {
      continue;
    }

    const existing =
      purchasedByAssessment.get(row.assessmentSlug) ??
      {
        count: 0,
        revenueByCurrency: new Map<string, number>()
      };

    existing.count += row._count._all;
    pushCurrencyAmount(
      existing.revenueByCurrency,
      row.currency,
      row._sum.amountCents ?? 0
    );
    purchasedByAssessment.set(row.assessmentSlug, existing);
  }

  const topPurchasedAssessments = [...purchasedByAssessment.entries()]
    .map(([assessmentSlug, value]) => ({
      assessmentSlug,
      assessmentTitle: assessmentTitleForSlug(assessmentSlug),
      count: value.count,
      revenueByCurrency: currencyMapToBreakdown(value.revenueByCurrency)
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  const topCompletedAssessments = completedAssessmentGroups
    .map((row) => ({
      assessmentSlug: row.assessmentSlug,
      assessmentTitle: assessmentTitleForSlug(row.assessmentSlug),
      count: row._count._all
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  const topTrackedAssessments = trackedAssessmentGroups
    .map((row) => ({
      assessmentSlug: row.assessmentSlug,
      assessmentTitle: assessmentTitleForSlug(row.assessmentSlug),
      count: row._count._all
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  const providerBreakdown = new Map<
    string,
    { provider: PaymentProvider | null; purchaseCount: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of providerGroups) {
    const key = row.paymentProvider ?? "UNKNOWN";
    const existing =
      providerBreakdown.get(key) ??
      {
        provider: row.paymentProvider,
        purchaseCount: 0,
        revenueByCurrency: new Map<string, number>()
      };

    existing.purchaseCount += row._count._all;
    pushCurrencyAmount(existing.revenueByCurrency, row.currency, row._sum.amountCents ?? 0);
    providerBreakdown.set(key, existing);
  }

  const regionBreakdown = new Map<
    string,
    { regionKey: string; purchaseCount: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of regionGroups) {
    const existing =
      regionBreakdown.get(row.regionKey) ??
      {
        regionKey: row.regionKey,
        purchaseCount: 0,
        revenueByCurrency: new Map<string, number>()
      };

    existing.purchaseCount += row._count._all;
    pushCurrencyAmount(existing.revenueByCurrency, row.currency, row._sum.amountCents ?? 0);
    regionBreakdown.set(row.regionKey, existing);
  }

  return {
    headlineMetrics: {
      totalUsers,
      newUsersLast7Days,
      totalPaidPurchases,
      paidPurchasesLast7Days,
      paidPurchasesLast30Days,
      trackedAssessmentSessions,
      completedAssessmentSessions,
      paidAssessmentSessions,
      readyReports,
      unlockedReports
    },
    revenueByCurrency: {
      lifetime: normalizeCurrencyRows(lifetimeRevenueRows as CurrencyAggregateRow[]),
      last7Days: normalizeCurrencyRows(last7DayRevenueRows as CurrencyAggregateRow[]),
      last30Days: normalizeCurrencyRows(last30DayRevenueRows as CurrencyAggregateRow[])
    },
    recentSignups,
    recentPurchases: recentPurchases.map((purchase) => ({
      id: purchase.id,
      userEmail: purchase.user.email,
      userName: purchase.user.fullName,
      title:
        purchase.title ??
        assessmentTitleForSlug(purchase.assessmentSlug, purchase.title),
      assessmentSlug: purchase.assessmentSlug,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      paymentProvider: purchase.paymentProvider,
      purchaseType: purchase.purchaseType,
      purchasedAt: purchase.purchasedAt,
      createdAt: purchase.createdAt,
      status: purchase.status
    })),
    topPurchasedAssessments,
    topCompletedAssessments,
    topTrackedAssessments,
    paidPurchaseProviderSplit: [...providerBreakdown.values()]
      .map((value) => ({
        provider: value.provider,
        purchaseCount: value.purchaseCount,
        revenueByCurrency: currencyMapToBreakdown(value.revenueByCurrency)
      }))
      .sort((left, right) => right.purchaseCount - left.purchaseCount),
    paidPurchaseRegionSplit: [...regionBreakdown.values()]
      .map((value) => ({
        regionKey: value.regionKey,
        purchaseCount: value.purchaseCount,
        revenueByCurrency: currencyMapToBreakdown(value.revenueByCurrency)
      }))
      .sort((left, right) => right.purchaseCount - left.purchaseCount),
    unavailableMetrics: [
      "True assessment starts are not persisted yet. AssessmentSession records are currently created at completion/preview time, so start counts are unavailable.",
      "Visitor-level landing counts are not stored in the current schema, so homepage/blog traffic totals and landing-to-start conversion rates are unavailable."
    ]
  };
}

export async function getAdminUsersPageData(query = ""): Promise<AdminUsersPageData> {
  const trimmedQuery = query.trim();
  const sevenDaysAgo = daysAgo(7);

  const where: Prisma.UserWhereInput = trimmedQuery
    ? {
        OR: [
          {
            email: {
              contains: trimmedQuery,
              mode: "insensitive"
            }
          },
          {
            fullName: {
              contains: trimmedQuery,
              mode: "insensitive"
            }
          },
          {
            preferredName: {
              contains: trimmedQuery,
              mode: "insensitive"
            }
          }
        ]
      }
    : {};

  const [totalUsers, newUsersLast7Days, profileCompletedCount, paidBuyerGroups, reportOwnerGroups, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    }),
    prisma.user.count({
      where: {
        profileCompleted: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["userId"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _max: {
        purchasedAt: true,
        createdAt: true
      }
    }),
    prisma.report.groupBy({
      by: ["userId"],
      _count: {
        _all: true
      },
      _max: {
        updatedAt: true,
        createdAt: true
      }
    }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        preferredName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        country: true,
        region: true,
        profileCompleted: true,
        primaryConcern: true,
        assessmentSessions: {
          select: {
            updatedAt: true,
            createdAt: true,
            completedAt: true
          },
          orderBy: {
            updatedAt: "desc"
          },
          take: 1
        },
        downloadRecords: {
          select: {
            downloadedAt: true
          },
          orderBy: {
            downloadedAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 150
    })
  ]);

  const paidBuyerMap = new Map(
    paidBuyerGroups.map((row) => [
      row.userId,
      {
        count: row._count._all,
        latestPurchaseAt: row._max.purchasedAt ?? row._max.createdAt ?? null
      }
    ])
  );
  const reportOwnerMap = new Map(
    reportOwnerGroups.map((row) => [
      row.userId,
      {
        count: row._count._all,
        latestReportAt: row._max.updatedAt ?? row._max.createdAt ?? null
      }
    ])
  );

  return {
    summary: {
      totalUsers,
      newUsersLast7Days,
      buyersCount: paidBuyerGroups.length,
      reportOwnersCount: reportOwnerGroups.length,
      profileCompletedCount
    },
    query: trimmedQuery,
    users: users.map((user) => {
      const paidPurchases = paidBuyerMap.get(user.id);
      const reportsOwned = reportOwnerMap.get(user.id);

      return {
        id: user.id,
        fullName: user.fullName,
        preferredName: user.preferredName,
        email: user.email,
        createdAt: user.createdAt,
        country: user.country,
        region: user.region,
        profileCompleted: user.profileCompleted,
        primaryConcern: user.primaryConcern,
        purchasesCount: paidPurchases?.count ?? 0,
        reportsOwnedCount: reportsOwned?.count ?? 0,
        latestPurchaseAt: paidPurchases?.latestPurchaseAt ?? null,
        lastTrackedActivityAt: maxDate([
          user.updatedAt,
          paidPurchases?.latestPurchaseAt ?? null,
          reportsOwned?.latestReportAt ?? null,
          user.assessmentSessions[0]?.updatedAt ?? user.assessmentSessions[0]?.completedAt ?? user.assessmentSessions[0]?.createdAt ?? null,
          user.downloadRecords[0]?.downloadedAt ?? null
        ])
      };
    })
  };
}

export async function getAdminPurchasesPageData(filters: {
  query?: string;
  status?: string;
  provider?: string;
  purchaseType?: string;
}): Promise<AdminPurchasesPageData> {
  const where = buildPurchaseWhere(filters);

  const [matchingPurchases, matchingPaidPurchases, paidRevenueRows, uniqueBuyerGroups, purchases] = await Promise.all([
    prisma.purchase.count({
      where
    }),
    prisma.purchase.count({
      where: {
        ...where,
        status: "PAID"
      }
    }),
    prisma.purchase.groupBy({
      by: ["currency"],
      where: {
        ...where,
        status: "PAID"
      },
      _sum: {
        amountCents: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["userId"],
      where: {
        ...where,
        status: "PAID"
      },
      _count: {
        _all: true
      }
    }),
    prisma.purchase.findMany({
      where,
      select: {
        id: true,
        purchasedAt: true,
        createdAt: true,
        title: true,
        assessmentSlug: true,
        amountCents: true,
        currency: true,
        paymentProvider: true,
        purchaseType: true,
        status: true,
        checkoutIntentId: true,
        reports: {
          select: {
            id: true
          }
        },
        user: {
          select: {
            email: true,
            fullName: true,
            profileCompleted: true,
            primaryConcern: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 150
    })
  ]);

  return {
    filters: {
      query: filters.query?.trim() ?? "",
      status: filters.status?.trim() ?? "",
      provider: filters.provider?.trim() ?? "",
      purchaseType: filters.purchaseType?.trim() ?? ""
    },
    summary: {
      matchingPurchases,
      matchingPaidPurchases,
      uniqueBuyers: uniqueBuyerGroups.length,
      paidRevenueByCurrency: normalizeCurrencyRows(paidRevenueRows as CurrencyAggregateRow[])
    },
    purchases: purchases.map((purchase) => ({
      id: purchase.id,
      purchasedAt: purchase.purchasedAt,
      createdAt: purchase.createdAt,
      userEmail: purchase.user.email,
      userName: purchase.user.fullName,
      userProfileCompleted: purchase.user.profileCompleted,
      userPrimaryConcern: purchase.user.primaryConcern,
      title: purchase.title,
      assessmentSlug: purchase.assessmentSlug,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      paymentProvider: purchase.paymentProvider,
      purchaseType: purchase.purchaseType,
      status: purchase.status,
      checkoutIntentId: purchase.checkoutIntentId,
      reportCount: purchase.reports.length
    }))
  };
}

export async function getAdminAnalyticsPageData(): Promise<AdminAnalyticsPageData> {
  const [sourceAttributionRecords, attributedAssessmentSessions, attributedPaidPurchases, completedAssessmentSessions, paidAssessmentSessions, assessmentSessionGroups, purchaseAssessmentGroups, sourceAttributions, providerGroups, regionGroups, currencyRows] = await Promise.all([
    prisma.sourceAttribution.count(),
    prisma.assessmentSession.count({
      where: {
        sourceAttributionId: {
          not: null
        }
      }
    }),
    prisma.purchase.count({
      where: {
        status: "PAID",
        sourceAttributionId: {
          not: null
        }
      }
    }),
    prisma.assessmentSession.count({
      where: {
        completedAt: {
          not: null
        }
      }
    }),
    prisma.assessmentSession.count({
      where: {
        status: "PAID"
      }
    }),
    prisma.assessmentSession.groupBy({
      by: ["assessmentSlug"],
      _count: {
        _all: true
      },
      _max: {
        completedAt: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["assessmentSlug", "currency"],
      where: {
        status: "PAID",
        assessmentSlug: {
          not: null
        }
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    }),
    prisma.sourceAttribution.findMany({
      select: {
        id: true,
        sourceBlogUrl: true,
        sourceBlogSlug: true,
        sourceTopic: true,
        landingPath: true,
        assessmentSlug: true,
        createdAt: true,
        purchases: {
          where: {
            status: "PAID"
          },
          select: {
            amountCents: true,
            currency: true
          }
        },
        _count: {
          select: {
            assessmentSessions: true,
            checkoutIntents: true,
            purchases: true,
            reports: true
          }
        }
      }
    }),
    prisma.purchase.groupBy({
      by: ["paymentProvider", "currency"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    }),
    prisma.checkoutIntent.groupBy({
      by: ["regionKey", "currency"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    }),
    prisma.purchase.groupBy({
      by: ["currency"],
      where: {
        status: "PAID"
      },
      _count: {
        _all: true
      },
      _sum: {
        amountCents: true
      }
    })
  ]);

  const paidByAssessment = new Map<
    string,
    { paidPurchases: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of purchaseAssessmentGroups) {
    if (!row.assessmentSlug) {
      continue;
    }

    const existing =
      paidByAssessment.get(row.assessmentSlug) ??
      { paidPurchases: 0, revenueByCurrency: new Map<string, number>() };

    existing.paidPurchases += row._count._all;
    pushCurrencyAmount(existing.revenueByCurrency, row.currency, row._sum.amountCents ?? 0);
    paidByAssessment.set(row.assessmentSlug, existing);
  }

  const assessmentAnalytics = assessmentSessionGroups
    .map((row) => {
      const paid = paidByAssessment.get(row.assessmentSlug);
      const completedSessions = row._max.completedAt ? row._count._all : 0;
      const trackedSessions = row._count._all;
      const paidPurchases = paid?.paidPurchases ?? 0;

      return {
        assessmentSlug: row.assessmentSlug,
        assessmentTitle: assessmentTitleForSlug(row.assessmentSlug),
        trackedSessions,
        completedSessions,
        paidPurchases,
        paidFromCompletedRate:
          completedSessions > 0 ? (paidPurchases / completedSessions) * 100 : null,
        revenueByCurrency: paid
          ? currencyMapToBreakdown(paid.revenueByCurrency)
          : []
      };
    })
    .sort((left, right) => right.completedSessions - left.completedSessions);

  const sourceAnalytics = sourceAttributions
    .map((source) => {
      const revenueByCurrency = new Map<string, number>();

      for (const purchase of source.purchases) {
        pushCurrencyAmount(revenueByCurrency, purchase.currency, purchase.amountCents);
      }

      return {
        sourceLabel: sourceLabel(source),
        sourceTopic: source.sourceTopic,
        linkedAssessmentSlug: source.assessmentSlug,
        attributedSessions: source._count.assessmentSessions,
        attributedCheckouts: source._count.checkoutIntents,
        attributedPaidPurchases: source.purchases.length,
        paidRevenueByCurrency: currencyMapToBreakdown(revenueByCurrency),
        latestTouchAt: source.createdAt
      };
    })
    .filter(
      (source) =>
        source.attributedSessions > 0 ||
        source.attributedCheckouts > 0 ||
        source.attributedPaidPurchases > 0
    )
    .sort(
      (left, right) =>
        right.attributedPaidPurchases - left.attributedPaidPurchases ||
        right.attributedSessions - left.attributedSessions
    )
    .slice(0, 25);

  const providerSplit = new Map<
    string,
    { provider: PaymentProvider | null; purchaseCount: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of providerGroups) {
    const key = row.paymentProvider ?? "UNKNOWN";
    const existing =
      providerSplit.get(key) ??
      { provider: row.paymentProvider, purchaseCount: 0, revenueByCurrency: new Map<string, number>() };

    existing.purchaseCount += row._count._all;
    pushCurrencyAmount(existing.revenueByCurrency, row.currency, row._sum.amountCents ?? 0);
    providerSplit.set(key, existing);
  }

  const regionSplit = new Map<
    string,
    { regionKey: string; purchaseCount: number; revenueByCurrency: Map<string, number> }
  >();

  for (const row of regionGroups) {
    const existing =
      regionSplit.get(row.regionKey) ??
      { regionKey: row.regionKey, purchaseCount: 0, revenueByCurrency: new Map<string, number>() };

    existing.purchaseCount += row._count._all;
    pushCurrencyAmount(existing.revenueByCurrency, row.currency, row._sum.amountCents ?? 0);
    regionSplit.set(row.regionKey, existing);
  }

  return {
    availabilityNotes: [
      "Visitor-level landing traffic is not stored in the current schema, so visitor totals and landing-to-start conversion cannot be shown truthfully.",
      "Assessment start events are not persisted separately yet. AssessmentSession rows are created when the user reaches the saved completion/preview stage, so true start counts are unavailable."
    ],
    funnelSnapshot: {
      sourceAttributionRecords,
      attributedAssessmentSessions,
      attributedPaidPurchases,
      completedAssessmentSessions,
      paidAssessmentSessions,
      paidFromCompletedRate:
        completedAssessmentSessions > 0
          ? (paidAssessmentSessions / completedAssessmentSessions) * 100
          : null
    },
    assessmentAnalytics,
    sourceAnalytics,
    providerSplit: [...providerSplit.values()]
      .map((value) => ({
        provider: value.provider,
        purchaseCount: value.purchaseCount,
        revenueByCurrency: currencyMapToBreakdown(value.revenueByCurrency)
      }))
      .sort((left, right) => right.purchaseCount - left.purchaseCount),
    regionSplit: [...regionSplit.values()]
      .map((value) => ({
        regionKey: value.regionKey,
        purchaseCount: value.purchaseCount,
        revenueByCurrency: currencyMapToBreakdown(value.revenueByCurrency)
      }))
      .sort((left, right) => right.purchaseCount - left.purchaseCount),
    currencySplit: normalizeCurrencyRows(currencyRows as CurrencyAggregateRow[])
  };
}
