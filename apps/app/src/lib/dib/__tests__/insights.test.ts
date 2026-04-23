import { buildRoiEstimate } from "../roi-calculator";
import {
  detectUnencryptedPii,
  detectMissingForeignKeys,
  detectMissingIndexes,
  detectZombieTables,
  detectOverIndexedTables,
  detectArchivalOpportunities,
  detectTableBloat,
  detectTimestampProliferation,
  detectSoftDeleteInconsistency,
  detectMissingAuditColumns,
  generateCrmInsights,
} from "../insights/crm-insights";
import { rankInsights } from "../insight-ranker";
import { buildDibContent } from "../generate-dib";
import type { TableSchema, IntrospectionResult } from "@/lib/introspection/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTable(overrides: Partial<TableSchema> & { name: string }): TableSchema {
  return {
    schemaName: "public",
    columns: [],
    indices: [],
    foreignKeys: [],
    ...overrides,
  };
}

function makeMetrics(overrides: Partial<NonNullable<TableSchema["metrics"]>> = {}): NonNullable<TableSchema["metrics"]> {
  return {
    sizeBytes: 1024 * 1024,
    rowCount: 1000,
    relationDensity: 0.05,
    indexCount: 1,
    hasPrimaryKey: true,
    deadTupleRatio: 0.01,
    dataHealthScore: 85,
    isStrategic: false,
    ...overrides,
  };
}

// ── CRM fixture ───────────────────────────────────────────────────────────────

const CRM_TABLES: TableSchema[] = [
  makeTable({
    name: "contacts",
    columns: [
      { name: "id", type: "uuid", isNullable: false },
      { name: "email", type: "text", isNullable: false },
      { name: "phone", type: "varchar", isNullable: true },
      { name: "account_id", type: "uuid", isNullable: true },
      { name: "created_at", type: "timestamp", isNullable: false },
      { name: "updated_at", type: "timestamp", isNullable: false },
    ],
    indices: [],
    foreignKeys: [],
    metrics: makeMetrics({ sizeBytes: 5 * 1024 * 1024, rowCount: 50_000, isStrategic: true }),
  }),
  makeTable({
    name: "accounts",
    columns: [
      { name: "id", type: "uuid", isNullable: false },
      { name: "name", type: "text", isNullable: false },
      { name: "owner_id", type: "uuid", isNullable: true },
      { name: "created_at", type: "timestamp", isNullable: false },
    ],
    indices: [],
    foreignKeys: [],
    metrics: makeMetrics({ sizeBytes: 2 * 1024 * 1024, rowCount: 5_000, isStrategic: true }),
  }),
  makeTable({
    name: "deals",
    columns: [
      { name: "id", type: "uuid", isNullable: false },
      { name: "title", type: "text", isNullable: false },
      { name: "contact_id", type: "uuid", isNullable: true },
      { name: "account_id", type: "uuid", isNullable: true },
      { name: "status", type: "text", isNullable: false },
      { name: "created_at", type: "timestamp", isNullable: false },
      { name: "updated_at", type: "timestamp", isNullable: false },
      { name: "deleted_at", type: "timestamp", isNullable: true },
    ],
    indices: [{ name: "idx_deals_status", columnNames: ["status"], isUnique: false }],
    foreignKeys: [
      { columnNames: ["contact_id"], referencedTable: "contacts", referencedColumns: ["id"] },
    ],
    metrics: makeMetrics({ sizeBytes: 120 * 1024 * 1024, rowCount: 200_000, deadTupleRatio: 0.25, isStrategic: true }),
  }),
];

// ── ROI Calculator ─────────────────────────────────────────────────────────────

describe("buildRoiEstimate", () => {
  it("returns zero cost for zero storage", () => {
    const roi = buildRoiEstimate({ storageSizeBytes: 0 });
    expect(roi.costSavings.amount).toBe(0);
  });

  it("calculates storage cost at $0.10/GB/month annually", () => {
    // 10GB × $0.10 × 12 = $12
    const roi = buildRoiEstimate({ storageSizeBytes: 10 * 1024 ** 3 });
    expect(roi.costSavings.amount).toBe(12);
  });

  it("adds engineering cost for slow queries at $50/hr", () => {
    // 4 hours × $50 = $200
    const roi = buildRoiEstimate({ slowQueryHours: 4 });
    expect(roi.costSavings.amount).toBe(200);
  });

  it("caps risk reduction at 85%", () => {
    const roi = buildRoiEstimate({ securityGaps: 100 });
    expect(roi.riskReduction.percentage).toBe(85);
  });

  it("totalImpactScore is positive for any non-trivial params", () => {
    const roi = buildRoiEstimate({ timeSavingsHours: 5, securityGaps: 2 });
    expect(roi.totalImpactScore).toBeGreaterThan(0);
  });

  it("uses costDescription override when provided", () => {
    const roi = buildRoiEstimate({ costDescription: "Custom cost message" });
    expect(roi.costSavings.description).toBe("Custom cost message");
  });
});

// ── Security insights ─────────────────────────────────────────────────────────

describe("detectUnencryptedPii", () => {
  it("flags tables with plaintext email columns", () => {
    const insight = detectUnencryptedPii(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.category).toBe("security");
    expect(insight!.severity).toBe("critical");
    expect(insight!.entities).toContain("contacts");
  });

  it("returns null when no PII columns present", () => {
    const clean = [makeTable({
      name: "pipelines",
      columns: [
        { name: "id", type: "uuid", isNullable: false },
        { name: "name", type: "text", isNullable: false },
      ],
    })];
    expect(detectUnencryptedPii(clean)).toBeNull();
  });

  it("does not flag non-text PII columns (e.g., jsonb)", () => {
    const table = makeTable({
      name: "contacts",
      columns: [{ name: "email", type: "jsonb", isNullable: false }],
    });
    expect(detectUnencryptedPii([table])).toBeNull();
  });
});

describe("detectMissingForeignKeys", () => {
  it("flags _id columns without FK constraints", () => {
    const insight = detectMissingForeignKeys(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.entities!.some(e => e.includes("account_id"))).toBe(true);
  });

  it("ignores columns that already have FK constraints", () => {
    const table = makeTable({
      name: "deals",
      columns: [{ name: "contact_id", type: "uuid", isNullable: false }],
      foreignKeys: [{ columnNames: ["contact_id"], referencedTable: "contacts", referencedColumns: ["id"] }],
    });
    expect(detectMissingForeignKeys([table])).toBeNull();
  });

  it("ignores the id column itself", () => {
    const table = makeTable({
      name: "contacts",
      columns: [{ name: "id", type: "uuid", isNullable: false }],
    });
    expect(detectMissingForeignKeys([table])).toBeNull();
  });
});

// ── Performance insights ───────────────────────────────────────────────────────

describe("detectMissingIndexes", () => {
  it("flags common CRM columns without indexes", () => {
    const insight = detectMissingIndexes(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.category).toBe("performance");
    expect(insight!.severity).toBe("high");
  });

  it("returns null when all common columns are indexed", () => {
    const table = makeTable({
      name: "contacts",
      columns: [{ name: "email", type: "text", isNullable: false }],
      indices: [{ name: "idx_email", columnNames: ["email"], isUnique: true }],
    });
    expect(detectMissingIndexes([table])).toBeNull();
  });
});

describe("detectZombieTables", () => {
  it("flags tables with deadTupleRatio > 0.15", () => {
    const insight = detectZombieTables(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.entities).toContain("deals");
  });

  it("returns null when all tables are healthy", () => {
    const healthy = CRM_TABLES.map(t => ({
      ...t,
      metrics: makeMetrics({ deadTupleRatio: 0.01 }),
    }));
    expect(detectZombieTables(healthy)).toBeNull();
  });
});

describe("detectOverIndexedTables", () => {
  it("flags tables where indexCount exceeds column count", () => {
    const table = makeTable({
      name: "contacts",
      columns: [{ name: "id", type: "uuid", isNullable: false }],
      metrics: makeMetrics({ indexCount: 5 }),
    });
    const insight = detectOverIndexedTables([table]);
    expect(insight).not.toBeNull();
    expect(insight!.category).toBe("performance");
  });

  it("returns null for normally indexed tables", () => {
    expect(detectOverIndexedTables(CRM_TABLES)).toBeNull();
  });
});

// ── Cost insights ──────────────────────────────────────────────────────────────

describe("detectArchivalOpportunities", () => {
  it("flags large tables (>50MB) without soft-delete columns", () => {
    const table = makeTable({
      name: "activities",
      columns: [
        { name: "id", type: "uuid", isNullable: false },
        { name: "type", type: "text", isNullable: false },
      ],
      metrics: makeMetrics({ sizeBytes: 200 * 1024 * 1024 }),
    });
    const insight = detectArchivalOpportunities([table]);
    expect(insight).not.toBeNull();
    expect(insight!.category).toBe("cost");
  });

  it("excludes tables that already have deleted_at", () => {
    // deals is 120MB but has deleted_at → should not be flagged
    const delsOnly = CRM_TABLES.filter(t => t.name === "deals");
    expect(detectArchivalOpportunities(delsOnly)).toBeNull();
  });

  it("excludes tables under the 50MB threshold", () => {
    // contacts (5MB) and accounts (2MB) are both under threshold
    expect(detectArchivalOpportunities(CRM_TABLES)).toBeNull();
  });
});

describe("detectTableBloat", () => {
  it("flags tables over 100MB", () => {
    const insight = detectTableBloat(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.entities).toContain("deals");
  });

  it("returns null when all tables are small", () => {
    const small = CRM_TABLES.filter(t => t.name !== "deals");
    expect(detectTableBloat(small)).toBeNull();
  });
});

// ── Data quality insights ──────────────────────────────────────────────────────

describe("detectTimestampProliferation", () => {
  it("flags tables with more than 4 timestamp columns", () => {
    const table = makeTable({
      name: "contacts",
      columns: [
        { name: "created_at", type: "timestamp", isNullable: false },
        { name: "updated_at", type: "timestamp", isNullable: false },
        { name: "deleted_at", type: "timestamp", isNullable: true },
        { name: "verified_at", type: "timestamp", isNullable: true },
        { name: "last_synced_at", type: "timestamp", isNullable: true },
      ],
    });
    const insight = detectTimestampProliferation([table]);
    expect(insight).not.toBeNull();
    expect(insight!.entities).toContain("contacts");
  });

  it("returns null when timestamp count is within normal range", () => {
    expect(detectTimestampProliferation(CRM_TABLES)).toBeNull();
  });
});

describe("detectSoftDeleteInconsistency", () => {
  it("detects mixed soft-delete usage across CRM entity tables", () => {
    // contacts and accounts lack deleted_at; deals has it
    const insight = detectSoftDeleteInconsistency(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.category).toBe("data_quality");
    expect(insight!.entities).toContain("contacts");
    expect(insight!.entities).toContain("accounts");
  });

  it("returns null when all CRM tables consistently use soft-delete", () => {
    const consistent = CRM_TABLES.map(t => ({
      ...t,
      columns: [...t.columns, { name: "deleted_at", type: "timestamp", isNullable: true }],
    }));
    expect(detectSoftDeleteInconsistency(consistent)).toBeNull();
  });

  it("returns null when no CRM tables use soft-delete at all", () => {
    const none = CRM_TABLES.map(t => ({
      ...t,
      columns: t.columns.filter(c => c.name !== "deleted_at"),
    }));
    expect(detectSoftDeleteInconsistency(none)).toBeNull();
  });
});

describe("detectMissingAuditColumns", () => {
  it("flags CRM tables missing updated_at", () => {
    // accounts only has created_at, not updated_at
    const insight = detectMissingAuditColumns(CRM_TABLES);
    expect(insight).not.toBeNull();
    expect(insight!.entities).toContain("accounts");
  });

  it("returns null when all CRM tables have both audit timestamps", () => {
    const complete = CRM_TABLES.map(t => ({
      ...t,
      columns: [
        ...t.columns.filter(c => c.name !== "created_at" && c.name !== "updated_at"),
        { name: "created_at", type: "timestamp", isNullable: false },
        { name: "updated_at", type: "timestamp", isNullable: false },
      ],
    }));
    expect(detectMissingAuditColumns(complete)).toBeNull();
  });
});

// ── Insight ranker ─────────────────────────────────────────────────────────────

describe("rankInsights", () => {
  const raw = generateCrmInsights(CRM_TABLES);

  it("returns at most 12 results by default", () => {
    expect(rankInsights(raw, "balanced").length).toBeLessThanOrEqual(12);
  });

  it("respects a custom maxResults cap", () => {
    expect(rankInsights(raw, "balanced", 5).length).toBeLessThanOrEqual(5);
  });

  it("security mode puts critical/security insights near the top", () => {
    const ranked = rankInsights(raw, "security");
    const topThree = ranked.slice(0, 3);
    const hasSecurityOrCritical = topThree.some(
      i => i.category === "security" || i.severity === "critical"
    );
    expect(hasSecurityOrCritical).toBe(true);
  });

  it("balanced mode produces insights from multiple categories", () => {
    const ranked = rankInsights(raw, "balanced");
    const cats = new Set(ranked.map(i => i.category));
    expect(cats.size).toBeGreaterThanOrEqual(2);
  });

  it("does not mutate the input array", () => {
    const copy = [...raw];
    rankInsights(raw, "performance");
    expect(raw).toEqual(copy);
  });
});

// ── Dib generator ─────────────────────────────────────────────────────────────

const MOCK_RESULT: IntrospectionResult = {
  engineVersion: "PostgreSQL 15.0",
  stats: {
    tableCount: 3,
    relationCount: 2,
    totalSizeBytes: 127 * 1024 * 1024,
    introspectionTimeMs: 450,
  },
  tables: CRM_TABLES,
};

describe("buildDibContent", () => {
  it("returns a valid Dib structure with title and summary", () => {
    const result = buildDibContent({
      dibId: "test-id",
      databaseType: "CRM",
      focusMode: "balanced",
      introspectionResult: MOCK_RESULT,
    });

    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.content).toBeDefined();
  });

  it("generates between 4 and 12 insights for the CRM fixture", () => {
    const result = buildDibContent({
      dibId: "test-id",
      databaseType: "CRM",
      focusMode: "balanced",
      introspectionResult: MOCK_RESULT,
    });
    const count = result.content.insights.length;
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(12);
  });

  it("every insight has required fields with valid enum values", () => {
    const { content } = buildDibContent({
      dibId: "test-id",
      databaseType: "CRM",
      focusMode: "balanced",
      introspectionResult: MOCK_RESULT,
    });

    const validCategories = ["security", "performance", "cost", "data_quality"];
    const validSeverities = ["critical", "high", "med", "low"];

    for (const insight of content.insights) {
      expect(insight.title).toBeTruthy();
      expect(insight.description).toBeTruthy();
      expect(insight.recommendation).toBeTruthy();
      expect(validCategories).toContain(insight.category);
      expect(validSeverities).toContain(insight.severity);
      expect(insight.roi).toBeDefined();
      expect(insight.roi.totalImpactScore).toBeGreaterThanOrEqual(0);
    }
  });

  it("includes charts with one entry per table", () => {
    const { content } = buildDibContent({
      dibId: "test-id",
      databaseType: "CRM",
      focusMode: "balanced",
      introspectionResult: MOCK_RESULT,
    });
    expect(content.charts.sizeDistribution).toHaveLength(3);
    expect(content.charts.rowCounts).toHaveLength(3);
  });

  it("stats include totalRows summed from table metrics", () => {
    const { content } = buildDibContent({
      dibId: "test-id",
      databaseType: "CRM",
      focusMode: "balanced",
      introspectionResult: MOCK_RESULT,
    });
    expect(content.stats.totalRows).toBe(50_000 + 5_000 + 200_000);
  });

  it("title mentions Critical when multiple critical insights found", () => {
    // Inject a schema with many PII + FK gap signals
    const tables: TableSchema[] = Array.from({ length: 5 }, (_, i) =>
      makeTable({
        name: `crm_entity_${i}`,
        columns: [
          { name: "id", type: "uuid", isNullable: false },
          { name: "email", type: "text", isNullable: false },
          { name: "ssn", type: "text", isNullable: true },
        ],
        metrics: makeMetrics({ isStrategic: true }),
      })
    );
    const { title } = buildDibContent({
      dibId: "x",
      databaseType: "CRM",
      focusMode: "security",
      introspectionResult: { ...MOCK_RESULT, tables, stats: { ...MOCK_RESULT.stats, tableCount: 5 } },
    });
    expect(title).toMatch(/Critical/i);
  });
});
