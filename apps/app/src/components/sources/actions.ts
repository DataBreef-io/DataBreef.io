"use server";

import { z } from "zod";
import { db } from "@/lib/db-client";
import { sources, sourceAuditLogs } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { DatabaseEngineType, IntrospectionLog } from "@/lib/introspection/types";
import { getEngine } from "@/lib/introspection";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";

const anchorSchema = z.object({
  name: z.string().min(2),
  connectionString: z.string().url(),
  dbType: z.enum(["postgres", "mysql", "mssql", "oracle", "snowflake"]),
});

export type ActionState = {
  success: boolean;
  logs: IntrospectionLog[];
  error?: string;
  sourceId?: string;
};

/**
 * Validates and tests a new database connection.
 * Persists it to the database on success.
 */
export async function anchorSourceAction(
  prevState: any,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { success: false, logs: [], error: "Not authenticated." };
  }

  const userId = session.user.id;
  const name = formData.get("name") as string;
  const connectionString = formData.get("connectionString") as string;
  const dbType = formData.get("dbType") as DatabaseEngineType;

  // 1. Validation
  const validationResult = anchorSchema.safeParse({ name, connectionString, dbType });
  if (!validationResult.success) {
    return { success: false, logs: [], error: "Invalid form data." };
  }

  // 2. Duplicate Check
  try {
    const existing = await db.select().from(sources).where(eq(sources.userId, userId));
    const newRoot = connectionString.split("?")[0].replace(/\/$/, "");

    const isDuplicate = existing.some(s => {
      try {
        const decrypted = decrypt(s.connectionStringEncrypted);
        const existingRoot = decrypted.split("?")[0].replace(/\/$/, "");
        return existingRoot === newRoot;
      } catch {
        return false;
      }
    });

    if (isDuplicate) {
      return { 
        success: false, 
        logs: [], 
        error: "This database is already anchored in your collection. Use the existing source to surface new briefs." 
      };
    }
  } catch (err) {
    console.warn("[Duplicate Check Fail]:", err);
  }

  // 3. Resolve Engine
  try {
    const engine = getEngine(dbType);
    
    const testResult = await engine.testConnection(connectionString);

    if (testResult.success) {
      // 4. Extract non-sensitive metadata for dashboard display
      const host = new URL(connectionString).hostname;

      // 5. Persistence
      const encryptedUrl = encrypt(connectionString);
      
      const values = {
        name,
        dbType,
        connectionStringEncrypted: encryptedUrl,
        host,
        userId,
        status: "connected",
        lastConnectedAt: new Date(),
      };
      
      console.log("[Anchor Action] Inserting values:", JSON.stringify(values, null, 2));

      const [newSource] = await db.insert(sources).values(values).returning();

      // Store the audit logs
      await db.insert(sourceAuditLogs).values({
        sourceId: newSource.id,
        logs: testResult.logs,
      });

      return { success: true, logs: testResult.logs, sourceId: newSource.id };
    } else {
      return { success: false, logs: testResult.logs, error: "Connection verification failed." };
    }
  } catch (err: any) {
    console.error("[Anchor Action Error]:", err);
    return { 
      success: false, 
      logs: [{ timestamp: new Date().toISOString(), level: "error", message: `Failure: ${err.message}` }],
      error: `Database persistence failure: ${err.message}` 
    };
  }
}
