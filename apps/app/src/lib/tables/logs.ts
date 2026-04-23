/**
 * apps/app/src/lib/db/logs.ts
 * Utilities for managing and purging source audit logs.
 */

import { db } from "../db";
import { sourceAuditLogs } from "./schema";
import { eq, and, lt, desc } from "drizzle-orm";

const MAX_LOGS_PER_SOURCE = 10;
const RETENTION_DAYS = 90;

/**
 * Persists a new audit log and triggers a retention check.
 */
export async function saveAuditLog(sourceId: string, logs: any[], dibId?: string) {
  // 1. Save the new log
  await db.insert(sourceAuditLogs).values({
    sourceId,
    dibId,
    logs,
  });

  // 2. Perform retention check (Keep it organized & lean)
  await enforceLogRetention(sourceId);
}

/**
 * Ensures we only keep the most recent logs or those within the retention window.
 * This prevents storage costs from spiraling.
 */
async function enforceLogRetention(sourceId: string) {
  // Find logs beyond the MAX_LOGS_PER_SOURCE limit
  const history = await db
    .select({ id: sourceAuditLogs.id })
    .from(sourceAuditLogs)
    .where(eq(sourceAuditLogs.sourceId, sourceId))
    .orderBy(desc(sourceAuditLogs.created_at))
    .offset(MAX_LOGS_PER_SOURCE);

  if (history.length > 0) {
    const idsToDelete = history.map(h => h.id);
    // TODO: Perform the deletion
    // await db.delete(sourceAuditLogs).where(inArray(sourceAuditLogs.id, idsToDelete));
  }

  // Also purge logs older than RETENTION_DAYS
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  
  // await db.delete(sourceAuditLogs).where(
  //   and(
  //     eq(sourceAuditLogs.sourceId, sourceId),
  //     lt(sourceAuditLogs.created_at, cutoff)
  //   )
  // );
}
