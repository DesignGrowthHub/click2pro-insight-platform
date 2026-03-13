import "server-only";

export type InsightDataSourceMode = "local_demo" | "database";

export function getInsightDataSourceMode(): InsightDataSourceMode {
  return process.env.INSIGHT_DATA_SOURCE === "database" ? "database" : "local_demo";
}

export function isDatabaseBackedMode() {
  return getInsightDataSourceMode() === "database";
}

export function shouldUseDatabaseForAccountState(userId?: string | null) {
  return isDatabaseBackedMode() && Boolean(userId);
}
