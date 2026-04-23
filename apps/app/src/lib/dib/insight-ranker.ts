import { DibInsight, InsightCategory } from "./insights/crm-insights";

export type FocusMode = "balanced" | "security" | "performance" | "cost";

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  med: 2,
  low: 1,
};

type CategoryWeights = Record<InsightCategory, number>;

const WEIGHTS: Record<FocusMode, CategoryWeights> = {
  balanced:    { security: 1.0, performance: 1.0, cost: 1.0, data_quality: 0.8 },
  security:    { security: 3.0, performance: 0.5, cost: 0.5, data_quality: 0.5 },
  performance: { security: 0.5, performance: 3.0, cost: 0.5, data_quality: 0.5 },
  cost:        { security: 0.5, performance: 0.5, cost: 3.0, data_quality: 0.5 },
};

function scoreInsight(insight: DibInsight, weights: CategoryWeights): number {
  const sev = SEVERITY_WEIGHT[insight.severity] ?? 1;
  const cat = weights[insight.category] ?? 1;
  const roi = insight.roi.totalImpactScore;
  return sev * cat * (1 + roi / 50);
}

function balancedSelection(ranked: DibInsight[], max: number): DibInsight[] {
  const categories: InsightCategory[] = ["security", "performance", "cost", "data_quality"];
  const buckets = new Map<InsightCategory, DibInsight[]>();
  for (const cat of categories) {
    buckets.set(cat, ranked.filter(i => i.category === cat));
  }

  const result: DibInsight[] = [];
  const perCategory = Math.floor(max / categories.length);

  for (const cat of categories) {
    result.push(...(buckets.get(cat) ?? []).slice(0, perCategory));
  }

  // Fill remaining slots with highest-scoring insights not yet included
  const included = new Set(result);
  for (const insight of ranked) {
    if (result.length >= max) break;
    if (!included.has(insight)) {
      result.push(insight);
      included.add(insight);
    }
  }

  return result.slice(0, max);
}

export function rankInsights(
  insights: DibInsight[],
  focusMode: FocusMode = "balanced",
  maxResults = 12,
): DibInsight[] {
  const weights = WEIGHTS[focusMode];
  const ranked = [...insights].sort(
    (a, b) => scoreInsight(b, weights) - scoreInsight(a, weights)
  );

  if (focusMode === "balanced") {
    return balancedSelection(ranked, maxResults);
  }

  return ranked.slice(0, maxResults);
}
