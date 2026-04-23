import { IntrospectionResult } from "@/lib/introspection/types";
import { DatabaseType } from "./classifier";
import { generateCrmInsights, DibInsight } from "./insights/crm-insights";
import { rankInsights, FocusMode } from "./insight-ranker";

export interface DibContent {
  engineVersion: string;
  databaseType: DatabaseType;
  focusMode: FocusMode;
  stats: IntrospectionResult["stats"] & { totalRows: number };
  insights: DibInsight[];
  tables: IntrospectionResult["tables"];
  charts: {
    sizeDistribution: Array<{ name: string; value: number }>;
    rowCounts: Array<{ name: string; count: number }>;
  };
}

export interface GenerateDibParams {
  dibId: string;
  databaseType: DatabaseType;
  focusMode: FocusMode;
  introspectionResult: IntrospectionResult;
}

export interface GenerateDibResult {
  title: string;
  summary: string;
  content: DibContent;
}

function runInsightGenerators(type: DatabaseType, result: IntrospectionResult): DibInsight[] {
  // CRM is the only implemented type; others fall back to CRM generators for MVP
  switch (type) {
    case "CRM":
    default:
      return generateCrmInsights(result.tables);
  }
}

function buildTitle(type: DatabaseType, insights: DibInsight[], tableCount: number): string {
  const critical = insights.filter(i => i.severity === "critical").length;
  const security = insights.filter(i => i.category === "security").length;
  const perf = insights.filter(i => i.category === "performance").length;

  if (critical >= 1) return `Critical Gaps Found in Your ${type} Data`;
  if (security >= 2) return `Security Risks Detected in ${type} Schema`;
  if (perf >= 2) return `Performance Bottlenecks in ${type} Database`;
  return `${type} Data Intelligence Brief — ${tableCount} Tables Analyzed`;
}

function buildSummary(insights: DibInsight[]): string {
  const critical = insights.filter(i => i.severity === "critical").length;
  const high = insights.filter(i => i.severity === "high").length;
  const categories = [...new Set(insights.map(i => i.category))];
  return `Surfaced ${insights.length} insights across ${categories.length} categories. ${critical} critical and ${high} high-priority findings require immediate attention.`;
}

export function buildDibContent(params: GenerateDibParams): GenerateDibResult {
  const { databaseType, focusMode, introspectionResult } = params;

  const raw = runInsightGenerators(databaseType, introspectionResult);
  const insights = rankInsights(raw, focusMode);

  const totalRows = introspectionResult.tables.reduce(
    (acc, t) => acc + (t.metrics?.rowCount ?? 0),
    0,
  );

  const content: DibContent = {
    engineVersion: introspectionResult.engineVersion,
    databaseType,
    focusMode,
    stats: { ...introspectionResult.stats, totalRows },
    insights,
    tables: introspectionResult.tables,
    charts: {
      sizeDistribution: introspectionResult.tables.map(t => ({
        name: t.name,
        value: t.metrics?.sizeBytes ?? 0,
      })),
      rowCounts: introspectionResult.tables.map(t => ({
        name: t.name,
        count: t.metrics?.rowCount ?? 0,
      })),
    },
  };

  return {
    title: buildTitle(databaseType, insights, introspectionResult.stats.tableCount),
    summary: buildSummary(insights),
    content,
  };
}
