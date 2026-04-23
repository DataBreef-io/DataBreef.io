/**
 * apps/app/src/components/reefs/ReefCard.tsx
 * High-fidelity card for displaying database sources (reefs).
 */

"use client";

import React from "react";
import { Wifi, WifiOff, AlertCircle, Briefcase, Archive, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DatabaseEngineIcon } from "@/components/ui/Logos";
import { ArchiveButton } from "@/components/ui/ArchiveButton";
import { archiveSourceAction } from "@/lib/tables/archive-actions";
import styles from "./ReefCard.module.css";

export type SourceStatus = "connected" | "error" | "pending";

export interface ReefSource {
  id: string;
  name: string;
  dbType: string;
  host: string | null;
  status: SourceStatus;
  lastConnectedAt: string | null;
  activeBriefs: number;
  archivedBriefs: number;
  tableCount: number | null;
}

interface ReefCardProps {
  source: ReefSource;
  children?: React.ReactNode; // For SurfaceBriefControl
}

export function ReefCard({ source, children }: ReefCardProps) {
  const statusMap: Record<
    SourceStatus,
    { label: string; variant: "kelp" | "urchin" | "neutral"; icon: React.ReactNode }
  > = {
    connected: { label: "Connected", variant: "kelp", icon: <Wifi size={10} /> },
    error: { label: "Error", variant: "urchin", icon: <WifiOff size={10} /> },
    pending: { label: "Pending", variant: "neutral", icon: <AlertCircle size={10} /> },
  };

  const { label, variant } = statusMap[source.status];

  return (
    <Card hoverable className={styles.card} id={`source-card-${source.id}`}>
      <div className={styles.header}>
        <div className={styles.engineWrap}>
          <DatabaseEngineIcon type={source.dbType} size={22} />
          <div className={styles.engineLabel}>{source.dbType.toUpperCase()}</div>
        </div>
        <div className={styles.headerRight}>
          <Badge variant={variant}>{label}</Badge>
          <ArchiveButton id={source.id} type="Source" onArchive={archiveSourceAction} />
        </div>
      </div>

      <div className={styles.mainInfo}>
        <h2 className={styles.name}>{source.name}</h2>
        <div className={styles.hostLine}>
          <span className={styles.hostValue}>{source.host || "Unknown Host"}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <div className={styles.statIcon}><Layers size={14} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{source.tableCount ?? "—"}</span>
            <span className={styles.statLabel}>Tables</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon}><Briefcase size={14} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{source.activeBriefs}</span>
            <span className={styles.statLabel}>Briefs</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon}><Archive size={14} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{source.archivedBriefs}</span>
            <span className={styles.statLabel}>Archived</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {children}
      </div>
    </Card>
  );
}
