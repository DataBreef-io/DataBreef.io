import type { Metadata } from "next";
import { ScrollText, ArrowRight, Waves, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DibTooltip } from "@/components/ui/DibTooltip";
import { ArchiveButton } from "@/components/ui/ArchiveButton";
import { archiveDibAction } from "@/lib/tables/archive-actions";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Brief History",
};

// ── Types ─────────────────────────────────────────────────────
type Dib = {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary: string;
  generatedAt: string;
  insights: string[];
  synthesisStatus: "pending" | "success" | "failed";
};

// ── Dib card ──────────────────────────────────────────────────
function DibCard({ dib }: { dib: Dib }) {
  return (
    <Card hoverable className={styles.dibCard} id={`dib-card-${dib.id}`}>
      <div className={styles.dibHeader}>
        <div className={styles.dibHeaderLeft}>
          <div className={styles.dibSource}>
            <ScrollText size={14} className={styles.dibSourceIcon} aria-hidden="true" />
            <span className={styles.dibSourceName}>{dib.sourceName}</span>
          </div>
          <time className={styles.dibDate} dateTime={dib.generatedAt}>
            {dib.generatedAt}
          </time>
        </div>
        <ArchiveButton id={dib.id} type="Brief" onArchive={archiveDibAction} />
      </div>

      <h2 className={styles.dibTitle}>{dib.title}</h2>

      {dib.synthesisStatus === "pending" && (
        <p className={styles.dibSummary}>
          <Clock size={13} aria-hidden="true" style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
          Synthesis pending...
        </p>
      )}
      {dib.synthesisStatus === "failed" && (
        <p className={styles.dibSummary}>
          <AlertTriangle size={13} aria-hidden="true" style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
          AI synthesis unavailable (high demand). See schema analysis below.
        </p>
      )}
      {dib.synthesisStatus === "success" && (
        <p className={styles.dibSummary}>{dib.summary}</p>
      )}

      {dib.insights.length > 0 && (
        <div className={styles.dibInsights} aria-label="Key insights">
          {dib.insights.slice(0, 3).map((insight, index) => (
            <Badge key={`${insight}-${index}`} variant="reef" className={styles.dibInsightBadge}>
              {insight}
            </Badge>
          ))}
        </div>
      )}

      <div className={styles.dibFooter}>
        <Link
          href={`/dibs/${dib.id}`}
          className={styles.dibLink}
          id={`view-dib-${dib.id}`}
        >
          <span>View brief</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyDibsState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyGlow} aria-hidden="true">
        <Waves size={32} className={styles.emptyWaveIcon} />
      </div>
      <p className={styles.emptyEyebrow}>No Briefs Yet</p>
      <h2 className={styles.emptyTitle}>The depths are quiet</h2>
      <p className={styles.emptyDescription}>
        Surface your first <DibTooltip>Dib</DibTooltip> by anchoring a data source, then asking
        DataBreef to dive in and report back.
      </p>
      <Button href="/sources" size="md" variant="secondary" id="empty-dibs-cta">
        Go to Sources
      </Button>
    </div>
  );
}

import { db } from "@/lib/db-client";
import { dibs as dibsTable, sources as sourcesTable } from "@/lib/tables/schema";
import { and, eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// ── Dibs page ─────────────────────────────────────────────────
export default async function DibsPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return <div>Not authenticated</div>;
  }

  const userId = session.user.id;

  const result = await db
    .select({
      id: dibsTable.id,
      sourceId: dibsTable.sourceId,
      sourceName: sourcesTable.name,
      title: dibsTable.title,
      summary: dibsTable.summary,
      generatedAt: dibsTable.generatedAt,
      contentJson: dibsTable.contentJson,
      status: dibsTable.status,
      synthesisStatus: dibsTable.synthesisStatus,
    })
    .from(dibsTable)
    .leftJoin(sourcesTable, eq(dibsTable.sourceId, sourcesTable.id))
    .where(and(eq(dibsTable.userId, userId), eq(dibsTable.isArchived, false)))
    .orderBy(desc(dibsTable.generatedAt));

  // Transform to component model
  const formattedDibs: Dib[] = result.map((d) => ({
    id: d.id,
    sourceId: d.sourceId ?? "",
    sourceName: d.sourceName ?? "Unknown Source",
    title: d.title,
    summary: d.summary,
    generatedAt: d.generatedAt ? d.generatedAt.toLocaleDateString() : "Pending",
    insights: (d.contentJson as any)?.insights?.map((i: any) => i.title) ?? [],
    synthesisStatus: (d.synthesisStatus ?? "pending") as Dib["synthesisStatus"],
  }));

  return (
    <div className={styles.page}>
      {formattedDibs.length === 0 ? (
        <EmptyDibsState />
      ) : (
        <div className={styles.list}>
          {formattedDibs.map((dib) => (
            <DibCard key={dib.id} dib={dib} />
          ))}
        </div>
      )}
    </div>
  );
}
