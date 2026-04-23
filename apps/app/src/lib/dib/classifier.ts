/**
 * Dib Engine v2 — Database Type Classifier
 * Pattern-matches introspected table names to known database archetypes.
 */

export type DatabaseType = "CRM" | "Analytics" | "Transactional" | "UserManagement" | "Custom";

export interface ClassificationResult {
  type: DatabaseType;
  confidence: number; // 0–100
  scores: Record<DatabaseType, number>;
}

// Keyword stems; substring match against lowercased table names.
// Using stems (not exact names) catches variants like "user_contacts", "payments_v2".
const PATTERNS: Record<Exclude<DatabaseType, "Custom">, string[]> = {
  CRM: [
    "contact", "account", "deal", "opportunit", "customer",
    "lead", "prospect", "pipeline", "company", "client",
  ],
  Analytics: [
    "fact_", "dim_", "aggregate", "summary", "metric",
    "reporting", "event", "pageview", "impression", "analytics",
  ],
  Transactional: [
    "order", "payment", "inventory", "transaction", "shipment",
    "invoice", "cart", "checkout", "product", "fulfillment",
  ],
  UserManagement: [
    "user", "role", "permission", "session", "auth",
    "credential", "token", "organization", "group", "member",
  ],
};

function tableMatchesType(tableName: string, patterns: string[]): boolean {
  const lower = tableName.toLowerCase();
  return patterns.some(p => lower.includes(p));
}

/**
 * Classifies a database schema from its table names.
 * Confidence is the percentage of PATTERN KEYWORDS matched across the full keyword set.
 */
export function classifySchema(tableNames: string[]): ClassificationResult {
  const zero: Record<DatabaseType, number> = {
    CRM: 0, Analytics: 0, Transactional: 0, UserManagement: 0, Custom: 0,
  };

  if (tableNames.length === 0) {
    return { type: "Custom", confidence: 100, scores: { ...zero, Custom: 100 } };
  }

  const lowerTables = tableNames.map(t => t.toLowerCase());

  // Score = number of distinct keywords from each type's list that appear in ANY table name.
  // Then normalize by total keywords in that type's list → 0–100.
  const rawScores = {} as Record<Exclude<DatabaseType, "Custom">, number>;

  for (const [type, keywords] of Object.entries(PATTERNS) as [Exclude<DatabaseType, "Custom">, string[]][]) {
    const hits = keywords.filter(kw => lowerTables.some(t => t.includes(kw))).length;
    rawScores[type] = Math.round((hits / keywords.length) * 100);
  }

  // Find top type
  let topType: Exclude<DatabaseType, "Custom"> = "CRM";
  let topScore = 0;
  for (const [t, s] of Object.entries(rawScores) as [Exclude<DatabaseType, "Custom">, number][]) {
    if (s > topScore) { topScore = s; topType = t; }
  }

  const scores: Record<DatabaseType, number> = { ...rawScores, Custom: 0 };

  // Weak signal → Custom
  if (topScore < 20) {
    return { type: "Custom", confidence: 100, scores: { ...scores, Custom: 100 } };
  }

  return { type: topType, confidence: topScore, scores };
}

/** Human-readable label for a DatabaseType. */
export const DATABASE_TYPE_LABELS: Record<DatabaseType, string> = {
  CRM: "CRM",
  Analytics: "Analytics / Data Warehouse",
  Transactional: "Transactional / E-commerce",
  UserManagement: "User Management / Auth",
  Custom: "Custom",
};

/** Returns the dominant signal tables found for a given type. */
export function getMatchedSignals(tableNames: string[], type: Exclude<DatabaseType, "Custom">): string[] {
  const keywords = PATTERNS[type];
  return tableNames.filter(t => tableMatchesType(t, keywords));
}
