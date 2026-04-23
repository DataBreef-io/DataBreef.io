import { TableSchema } from "@/lib/introspection/types";
import { buildRoiEstimate, RoiEstimate } from "../roi-calculator";

export type InsightCategory = "security" | "performance" | "cost" | "data_quality";

export interface DibInsight {
  title: string;
  description: string;
  recommendation: string;
  category: InsightCategory;
  severity: "critical" | "high" | "med" | "low";
  roi: RoiEstimate;
  entities?: string[];
}

const PII_PATTERNS = [
  "email", "phone", "ssn", "social_security", "credit_card", "card_number",
  "payment_method", "bank_account", "passport", "date_of_birth", "dob",
];

const HIGH_TRAFFIC_COLUMNS = [
  "account_id", "contact_id", "updated_at", "created_at", "email",
  "status", "owner_id", "user_id", "company_id", "lead_id",
];

const CRM_ENTITY_PATTERNS = [
  "contact", "account", "lead", "deal", "opportunit", "customer", "prospect",
];

const SOFT_DELETE_COLUMNS = ["deleted_at", "archived_at", "is_deleted", "is_archived"];

const TIMESTAMP_TYPES = ["timestamp", "date", "datetime", "timestamptz"];

function isPiiColumn(colName: string): boolean {
  const lower = colName.toLowerCase();
  return PII_PATTERNS.some(p => lower.includes(p));
}

function isTextType(colType: string): boolean {
  return ["text", "varchar", "character varying", "char"].some(t =>
    colType.toLowerCase().includes(t)
  );
}

function hasIndex(table: TableSchema, colName: string): boolean {
  return table.indices.some(idx => idx.columnNames.includes(colName));
}

function hasForeignKey(table: TableSchema, colName: string): boolean {
  return table.foreignKeys.some(fk => fk.columnNames.includes(colName));
}

function hasSoftDeleteColumn(table: TableSchema): boolean {
  return table.columns.some(c => SOFT_DELETE_COLUMNS.includes(c.name.toLowerCase()));
}

function isCrmEntityTable(table: TableSchema): boolean {
  return CRM_ENTITY_PATTERNS.some(p => table.name.toLowerCase().includes(p));
}

// ── Security ──────────────────────────────────────────────────────────────────

export function detectUnencryptedPii(tables: TableSchema[]): DibInsight | null {
  const affected = tables.filter(t =>
    t.columns.some(c => isPiiColumn(c.name) && isTextType(c.type))
  ).map(t => t.name);

  if (affected.length === 0) return null;

  return {
    title: "Unencrypted PII in Plaintext Columns",
    description: `${affected.length} table(s) store sensitive data (email, phone, SSN, payment info) as plaintext. Any SQL injection or data leak exposes raw customer records.`,
    recommendation: "Encrypt PII columns at rest using column-level encryption or tokenization. Audit access controls on these tables.",
    category: "security",
    severity: "critical",
    roi: buildRoiEstimate({
      securityGaps: affected.length,
      riskDescription: `Closes ~${Math.min(affected.length * 15, 85)}% of direct PII exposure vectors`,
    }),
    entities: affected,
  };
}

export function detectMissingForeignKeys(tables: TableSchema[]): DibInsight | null {
  const orphaned: string[] = [];
  for (const table of tables) {
    for (const col of table.columns) {
      const lower = col.name.toLowerCase();
      if (lower.endsWith("_id") && lower !== "id" && !hasForeignKey(table, col.name)) {
        orphaned.push(`${table.name}.${col.name}`);
      }
    }
  }
  if (orphaned.length === 0) return null;

  return {
    title: "Referential Integrity Gaps",
    description: `${orphaned.length} _id column(s) have no foreign key constraint, allowing orphaned or invalid references to accumulate silently.`,
    recommendation: "Add FK constraints where the referenced table exists. For intentionally loose references, add an application-level integrity check.",
    category: "security",
    severity: "high",
    roi: buildRoiEstimate({
      timeSavingsHours: 8,
      timeSavingsDescription: "~8 hours/quarter debugging orphaned-reference data issues",
      securityGaps: 1,
    }),
    entities: orphaned.slice(0, 8),
  };
}

// ── Performance ───────────────────────────────────────────────────────────────

export function detectMissingIndexes(tables: TableSchema[]): DibInsight | null {
  const unindexed: string[] = [];
  for (const table of tables) {
    for (const pattern of HIGH_TRAFFIC_COLUMNS) {
      const col = table.columns.find(c => c.name.toLowerCase() === pattern);
      if (col && !hasIndex(table, col.name)) {
        unindexed.push(`${table.name}.${col.name}`);
      }
    }
  }
  if (unindexed.length === 0) return null;

  return {
    title: "Missing Indexes on High-Traffic Columns",
    description: `${unindexed.length} commonly filtered/sorted column(s) lack indexes, forcing full table scans on every query.`,
    recommendation: "Add B-tree indexes on high-cardinality filter and sort columns. Estimated 2–4 hours to implement.",
    category: "performance",
    severity: "high",
    roi: buildRoiEstimate({
      slowQueryHours: 3,
      timeSavingsHours: 3,
      timeSavingsDescription: "2–4 hours to index; saves ongoing slow-query firefighting",
    }),
    entities: unindexed.slice(0, 8),
  };
}

export function detectZombieTables(tables: TableSchema[]): DibInsight | null {
  const zombies = tables.filter(t => (t.metrics?.deadTupleRatio ?? 0) > 0.15);
  if (zombies.length === 0) return null;

  const wastedBytes = zombies.reduce((acc, t) => acc + (t.metrics?.sizeBytes ?? 0) * 0.15, 0);

  return {
    title: `${zombies.length} Tables with Excessive Dead Tuples`,
    description: `Dead tuples exceed 15% in ${zombies.length} table(s), bloating storage and degrading sequential scan performance.`,
    recommendation: "Run VACUUM ANALYZE on affected tables and tune autovacuum thresholds to prevent recurrence.",
    category: "performance",
    severity: "med",
    roi: buildRoiEstimate({
      storageSizeBytes: wastedBytes,
      timeSavingsHours: 2,
      timeSavingsDescription: "~2 hours to tune autovacuum settings once",
    }),
    entities: zombies.map(t => t.name),
  };
}

export function detectOverIndexedTables(tables: TableSchema[]): DibInsight | null {
  const over = tables.filter(t => (t.metrics?.indexCount ?? 0) > t.columns.length);
  if (over.length === 0) return null;

  return {
    title: "Over-Indexed Tables Slowing Writes",
    description: `${over.length} table(s) have more indexes than columns. Every INSERT/UPDATE must maintain all indexes, adding write latency.`,
    recommendation: "Audit indexes on these tables. Remove redundant or unused ones, and consolidate into composite indexes where possible.",
    category: "performance",
    severity: "med",
    roi: buildRoiEstimate({
      timeSavingsHours: 5,
      timeSavingsDescription: "5–10 hours/quarter saved on write performance optimization",
    }),
    entities: over.map(t => t.name),
  };
}

// ── Cost ──────────────────────────────────────────────────────────────────────

export function detectArchivalOpportunities(tables: TableSchema[]): DibInsight | null {
  const THRESHOLD = 50 * 1024 * 1024; // 50MB
  const candidates = tables.filter(
    t => (t.metrics?.sizeBytes ?? 0) > THRESHOLD && !hasSoftDeleteColumn(t)
  );
  if (candidates.length === 0) return null;

  const totalBytes = candidates.reduce((acc, t) => acc + (t.metrics?.sizeBytes ?? 0), 0);

  return {
    title: "Large Tables Without Retention Policy",
    description: `${candidates.length} table(s) exceed 50MB with no archival signal (deleted_at / archived_at). Stale records accumulate indefinitely.`,
    recommendation: "Add a deleted_at or archived_at column and implement a data retention policy. Archive records beyond your SLA window to cold storage.",
    category: "cost",
    severity: "med",
    roi: buildRoiEstimate({
      storageSizeBytes: totalBytes * 0.3,
      timeSavingsHours: 6,
      timeSavingsDescription: "~6 hours to design and implement an archival pipeline",
    }),
    entities: candidates.map(t => t.name),
  };
}

export function detectTableBloat(tables: TableSchema[]): DibInsight | null {
  const THRESHOLD = 100 * 1024 * 1024; // 100MB
  const large = tables.filter(t => (t.metrics?.sizeBytes ?? 0) > THRESHOLD);
  if (large.length === 0) return null;

  const totalBytes = large.reduce((acc, t) => acc + (t.metrics?.sizeBytes ?? 0), 0);
  const annualCost = Math.round((totalBytes / 1024 ** 3) * 0.10 * 12);

  return {
    title: "Significant Storage Footprint",
    description: `${large.length} table(s) exceed 100MB, increasing backup duration and cold-scan costs.`,
    recommendation: "Partition large tables by date range or tenant. Evaluate moving historical data to object storage.",
    category: "cost",
    severity: "low",
    roi: buildRoiEstimate({
      storageSizeBytes: totalBytes,
      costDescription: `~$${annualCost}/year in storage — partitioning can reduce this by 40–60%`,
    }),
    entities: large.map(t => t.name),
  };
}

// ── Data Quality ──────────────────────────────────────────────────────────────

export function detectTimestampProliferation(tables: TableSchema[]): DibInsight | null {
  const affected = tables.filter(
    t => t.columns.filter(c => TIMESTAMP_TYPES.some(ts => c.type.toLowerCase().includes(ts))).length > 4
  ).map(t => t.name);

  if (affected.length === 0) return null;

  return {
    title: "Timestamp Proliferation",
    description: `${affected.length} table(s) have more than 4 timestamp columns, often indicating overlapping tracking concerns or unresolved migrations.`,
    recommendation: "Consolidate to created_at, updated_at, and one domain-specific timestamp. Remove duplicates after auditing column usage.",
    category: "data_quality",
    severity: "low",
    roi: buildRoiEstimate({
      timeSavingsHours: 4,
      timeSavingsDescription: "~4 hours to audit and consolidate timestamp columns",
    }),
    entities: affected,
  };
}

export function detectSoftDeleteInconsistency(tables: TableSchema[]): DibInsight | null {
  const crmTables = tables.filter(isCrmEntityTable);
  if (crmTables.length < 2) return null;

  const withSoftDelete = crmTables.filter(hasSoftDeleteColumn);
  const without = crmTables.filter(t => !hasSoftDeleteColumn(t));
  if (withSoftDelete.length === 0 || without.length === 0) return null;

  return {
    title: "Inconsistent Soft-Delete Pattern",
    description: `Some CRM entity tables use soft-delete (deleted_at) while others don't, causing inconsistent data visibility and reporting drift.`,
    recommendation: "Standardize on one deletion strategy across all CRM entities. If using soft-delete, add deleted_at to all entity tables and update queries to filter accordingly.",
    category: "data_quality",
    severity: "med",
    roi: buildRoiEstimate({
      timeSavingsHours: 6,
      timeSavingsDescription: "~6 hours to standardize deletion pattern across CRM entities",
    }),
    entities: without.map(t => t.name),
  };
}

export function detectMissingAuditColumns(tables: TableSchema[]): DibInsight | null {
  const crmTables = tables.filter(isCrmEntityTable);
  const missing = crmTables.filter(t => {
    const names = t.columns.map(c => c.name.toLowerCase());
    return !names.includes("created_at") || !names.includes("updated_at");
  });
  if (missing.length === 0) return null;

  return {
    title: "Missing Audit Timestamps on CRM Entities",
    description: `${missing.length} core CRM table(s) are missing created_at or updated_at, preventing change tracking and compliance auditing.`,
    recommendation: "Add created_at DEFAULT NOW() and updated_at to all CRM entity tables. Use an ORM hook or DB trigger to auto-update updated_at.",
    category: "data_quality",
    severity: "high",
    roi: buildRoiEstimate({
      timeSavingsHours: 5,
      timeSavingsDescription: "~5 hours to backfill and add audit columns",
      securityGaps: 1,
    }),
    entities: missing.map(t => t.name),
  };
}

// ── Entry point ───────────────────────────────────────────────────────────────

export function generateCrmInsights(tables: TableSchema[]): DibInsight[] {
  const generators = [
    detectUnencryptedPii,
    detectMissingForeignKeys,
    detectMissingAuditColumns,
    detectMissingIndexes,
    detectZombieTables,
    detectOverIndexedTables,
    detectArchivalOpportunities,
    detectTableBloat,
    detectTimestampProliferation,
    detectSoftDeleteInconsistency,
  ];

  return generators.map(fn => fn(tables)).filter((i): i is DibInsight => i !== null);
}
