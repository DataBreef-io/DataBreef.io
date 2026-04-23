"use server";

import { db } from "@/lib/db-client";
import { dibs, sources } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";
import { PostgresEngine } from "@/lib/introspection/engines/postgres";
import { buildDibContent } from "@/lib/dib/generate-dib";
import { synthesizeDibNarrative } from "@/lib/dib/synthesis-retry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Discover all schemas in a source without performing full introspection.
 */
export async function discoverSchemasAction(sourceId: string) {
  const [source] = await db.select().from(sources).where(eq(sources.id, sourceId));
  if (!source) throw new Error("Source not found.");

  const conn = decrypt(source.connectionStringEncrypted);
  const engine = new PostgresEngine();
  return await engine.getSchemas(conn);
}

/**
 * Persist the user's schema selection preferences.
 */
export async function updateSourceSchemasAction(sourceId: string, schemas: string[]) {
  await db.update(sources).set({
    selectedSchemas: schemas,
  }).where(eq(sources.id, sourceId));
  revalidatePath("/sources");
}

/**
 * Surface a new Dib (Data Intelligence Brief) from a source.
 * respects the source's 'selectedSchemas' if available.
 */
export async function surfaceBriefAction(sourceId: string) {
  // 0. Authenticate user
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Not authenticated.");
  }

  const userId = session.user.id;

  // 1. Fetch source and verify ownership
  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  if (!source) throw new Error("Source not found.");
  if (source.userId !== userId) throw new Error("Unauthorized: Source does not belong to you.");

  // 2. Create pending Dib record
  const [newDib] = await db.insert(dibs).values({
    sourceId: source.id,
    userId,
    title: `Diving into ${source.name}...`,
    summary: `Analyzing ${source.selectedSchemas?.length || "all"} schemas...`,
    contentJson: {},
    status: "pending",
    synthesisStatus: "pending",
  }).returning();

  // 3. Trigger generation with selection
  generateDibBackground(newDib.id, source.connectionStringEncrypted, source.selectedSchemas || undefined);

  revalidatePath("/sources");
  revalidatePath("/dibs");
  redirect(`/dibs/${newDib.id}`);
}

/**
 * Phase 1: Introspect the database and build schema insights.
 * Saves the dib as 'completed' immediately so the user sees results.
 * Kicks off narrative synthesis in the background (may retry on 503).
 */
export async function generateDibBackground(dibId: string, encryptedConn: string, selectedSchemas?: string[]) {
  try {
    const conn = decrypt(encryptedConn);
    const engine = new PostgresEngine();

    const result = await engine.introspect(conn);

    if (selectedSchemas && selectedSchemas.length > 0) {
      result.tables = result.tables.filter(t => selectedSchemas.includes(t.schemaName));
      result.stats.tableCount = result.tables.length;
      result.stats.totalSizeBytes = result.tables.reduce((acc, t) => acc + (t.metrics?.sizeBytes || 0), 0);
    }

    const [dibRecord] = await db.select({ sourceId: dibs.sourceId }).from(dibs).where(eq(dibs.id, dibId));
    const [sourceRecord] = await db.select({ databaseType: sources.databaseType }).from(sources).where(eq(sources.id, dibRecord.sourceId));

    const dibContent = buildDibContent({
      dibId,
      databaseType: sourceRecord?.databaseType ?? "CRM",
      focusMode: "balanced",
      introspectionResult: result,
    });

    // Save schema insights immediately — user sees results without waiting for AI
    await db.update(dibs).set({
      title: dibContent.title,
      summary: dibContent.summary,
      contentJson: dibContent.content,
      status: "completed",
      synthesisStatus: "pending",
    }).where(eq(dibs.id, dibId));

    // Phase 2: narrative synthesis with retry — runs async, does not block
    synthesizeDibNarrative(dibId, result);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error during dive";
    console.error("[Dib Generation Error]:", message);
    await db.update(dibs).set({
      status: "error",
      errorLog: message,
      synthesisStatus: "failed",
      synthesisError: message,
    }).where(eq(dibs.id, dibId));
  }
}
