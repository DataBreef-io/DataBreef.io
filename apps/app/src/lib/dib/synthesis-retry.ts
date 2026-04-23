import { db } from "@/lib/db-client";
import { dibs } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { synthesizeNarrative } from "@/lib/intelligence/synthesis";
import type { IntrospectionResult } from "@/lib/introspection/types";

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

function is503Error(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("503") || msg.includes("service unavailable") || msg.includes("overloaded");
  }
  return false;
}

export async function synthesizeDibNarrative(
  dibId: string,
  introspectionResult: IntrospectionResult
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const narrative = await synthesizeNarrative(introspectionResult);

      const [current] = await db
        .select({ contentJson: dibs.contentJson })
        .from(dibs)
        .where(eq(dibs.id, dibId));

      await db.update(dibs).set({
        contentJson: { ...(current?.contentJson as object ?? {}), narrative },
        synthesisStatus: "success",
        synthesisRetryCount: attempt,
      }).where(eq(dibs.id, dibId));

      return;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (!is503Error(err)) {
        break;
      }

      if (attempt < RETRY_DELAYS_MS.length) {
        await db.update(dibs).set({ synthesisRetryCount: attempt + 1 }).where(eq(dibs.id, dibId));
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      }
    }
  }

  await db.update(dibs).set({
    synthesisStatus: "failed",
    synthesisError: lastError?.message ?? "Unknown synthesis error",
  }).where(eq(dibs.id, dibId));
}
