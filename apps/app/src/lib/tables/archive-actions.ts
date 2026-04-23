"use server";

import { db } from "@/lib/db-client";
import { sources, dibs } from "./schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Marks a source as archived (hidden from main view).
 */
export async function archiveSourceAction(id: string) {
  await db.update(sources).set({
    isArchived: true,
  }).where(eq(sources.id, id));
  
  revalidatePath("/sources");
}

/**
 * Marks a brief (Dib) as archived.
 */
export async function archiveDibAction(id: string) {
  await db.update(dibs).set({
    isArchived: true,
  }).where(eq(dibs.id, id));
  
  revalidatePath("/dibs");
}

/**
 * Permanently deletes a source.
 * To be used from Settings > Archive.
 */
export async function deleteSourceAction(id: string) {
  await db.delete(sources).where(eq(sources.id, id));
  revalidatePath("/sources");
  revalidatePath("/settings/archive");
}

/**
 * Permanently deletes a brief.
 */
export async function deleteDibAction(id: string) {
  await db.delete(dibs).where(eq(dibs.id, id));
  revalidatePath("/dibs");
  revalidatePath("/settings/archive");
}
