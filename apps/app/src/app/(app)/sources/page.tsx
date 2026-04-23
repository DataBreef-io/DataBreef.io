import type { Metadata } from "next";
import { Plus, Layers, Briefcase, Archive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Connected Reefs",
};

import { db } from "@/lib/db-client";
import { sources as sourcesTable, dibs } from "@/lib/tables/schema";
import { and, desc, eq, sql, count, inArray } from "drizzle-orm";
import { SurfaceBriefControl } from "@/components/sources/SurfaceBriefControl";
import { ReefCard, ReefSource } from "@/components/reefs/ReefCard";
import { auth } from "@/lib/auth";

// ── Empty state ───────────────────────────────────────────────
function EmptySourcesState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyAnchor} aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.anchorIcon}
        >
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="22" x2="12" y2="8" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      </div>
      <p className={styles.emptyEyebrow}>No Sources Yet</p>
      <h2 className={styles.emptyTitle}>Drop anchor on your first reef</h2>
      <p className={styles.emptyDescription}>
        Connect a PostgreSQL database using a read-only connection string.
        DataBreef introspects your schema — it never writes a single byte.
      </p>
      <Button href="/sources/new" size="md" id="empty-sources-cta">
        <Plus size={14} aria-hidden="true" />
        Anchor a source
      </Button>
    </div>
  );
}

export default async function SourcesPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return <div>Not authenticated</div>;
  }

  const userId = session.user.id;

  // 1. Fetch all non-archived sources for this user
  const sourcesData = await db
    .select({
      id: sourcesTable.id,
      name: sourcesTable.name,
      dbType: sourcesTable.dbType,
      host: sourcesTable.host,
      status: sourcesTable.status,
      lastConnectedAt: sourcesTable.lastConnectedAt,
    })
    .from(sourcesTable)
    .where(and(eq(sourcesTable.userId, userId), eq(sourcesTable.isArchived, false)))
    .orderBy(desc(sourcesTable.createdAt));

  if (sourcesData.length === 0) {
    return (
      <div className={styles.page}>
        <EmptySourcesState />
      </div>
    );
  }

  const sourceIds = sourcesData.map((s) => s.id);

  // 2. Fetch dib counts grouped by sourceId + isArchived, and latest table count per source
  const [dibCounts, tableCountRows] = await Promise.all([
    db
      .select({
        sourceId: dibs.sourceId,
        isArchived: dibs.isArchived,
        count: count(),
      })
      .from(dibs)
      .where(inArray(dibs.sourceId, sourceIds))
      .groupBy(dibs.sourceId, dibs.isArchived),

    // DISTINCT ON gives the latest completed dib row per source (ordered by generatedAt DESC)
    db
      .selectDistinctOn([dibs.sourceId], {
        sourceId: dibs.sourceId,
        tableCount: sql<number>`("content_json"->'stats'->>'tableCount')::int`,
      })
      .from(dibs)
      .where(and(inArray(dibs.sourceId, sourceIds), eq(dibs.status, "completed")))
      .orderBy(dibs.sourceId, desc(dibs.generatedAt)),
  ]);

  // 3. Build lookup maps for O(1) merging
  const dibMap = new Map<string, { active: number; archived: number }>();
  for (const row of dibCounts) {
    if (!dibMap.has(row.sourceId)) dibMap.set(row.sourceId, { active: 0, archived: 0 });
    const entry = dibMap.get(row.sourceId)!;
    if (row.isArchived) entry.archived = Number(row.count);
    else entry.active = Number(row.count);
  }

  const tableMap = new Map<string, number | null>(
    tableCountRows.map((r) => [r.sourceId, r.tableCount != null ? Number(r.tableCount) : null])
  );

  // 4. Merge into typed sources
  const formattedSources: ReefSource[] = sourcesData.map((s) => ({
    id: s.id,
    name: s.name,
    dbType: s.dbType,
    host: s.host || "External Reef",
    tableCount: tableMap.get(s.id) ?? null,
    activeBriefs: dibMap.get(s.id)?.active ?? 0,
    archivedBriefs: dibMap.get(s.id)?.archived ?? 0,
    lastConnectedAt: s.lastConnectedAt ? s.lastConnectedAt.toLocaleDateString() : null,
    status: s.status as any,
  }));

  const totalTables = formattedSources.reduce((sum, s) => sum + (s.tableCount ?? 0), 0);
  const totalActiveBriefs = formattedSources.reduce((sum, s) => sum + s.activeBriefs, 0);
  const totalArchivedBriefs = formattedSources.reduce((sum, s) => sum + s.archivedBriefs, 0);

  return (
    <div className={styles.page}>
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <Layers size={16} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>{totalTables}</span>
          <span className={styles.statLabel}>Tables</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Briefcase size={16} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>{totalActiveBriefs}</span>
          <span className={styles.statLabel}>Briefs</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Archive size={16} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>{totalArchivedBriefs}</span>
          <span className={styles.statLabel}>Archived Briefs</span>
        </div>
      </div>

      <div className={styles.grid}>
        {formattedSources.map((source) => (
          <ReefCard key={source.id} source={source}>
            <SurfaceBriefControl sourceId={source.id} />
          </ReefCard>
        ))}

        <Button
          href="/sources/new"
          variant="secondary"
          className={styles.addCard}
          id="add-source-button"
        >
          <Plus size={20} aria-hidden="true" />
          <span>Anchor a source</span>
        </Button>
      </div>
    </div>
  );
}
