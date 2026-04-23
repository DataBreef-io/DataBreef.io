"use server";

import postgres from "postgres";
import { db } from "@/lib/db-client";
import { sources } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";
import { classifySchema, ClassificationResult, DatabaseType } from "@/lib/dib/classifier";
import { DatabaseEngineType } from "@/lib/introspection/types";

async function fetchTableNames(connectionString: string, dbType: DatabaseEngineType): Promise<string[]> {
  if (dbType === "mysql") {
    // mysql2 dynamic import to avoid loading it when unused
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(connectionString);
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
      );
      return rows.map((r: any) => String(r.table_name ?? r.TABLE_NAME));
    } finally {
      await conn.end();
    }
  }

  // postgres, mssql, oracle, snowflake — all mapped to PostgresEngine stub; use postgres.js
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(connectionString, { ssl: "require", connect_timeout: 10, max: 1 });
    const rows = await sql.begin(async (tx) => {
      await tx`SET TRANSACTION READ ONLY`;
      return tx<{ table_name: string }[]>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
          AND table_schema NOT LIKE 'pg_%'
          AND table_type = 'BASE TABLE'
      `;
    });
    return rows.map(r => r.table_name);
  } finally {
    if (sql) await sql.end();
  }
}

/**
 * Lightweight classification: lists table names then runs the pattern classifier.
 * Does NOT perform full introspection — returns in < 2s on a warm connection.
 */
export async function classifySourceAction(sourceId: string): Promise<ClassificationResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");

  const [source] = await db.select().from(sources).where(eq(sources.id, sourceId));
  if (!source) throw new Error("Source not found.");
  if (source.userId !== session.user.id) throw new Error("Unauthorized.");

  const connectionString = decrypt(source.connectionStringEncrypted);
  const tableNames = await fetchTableNames(connectionString, source.dbType as DatabaseEngineType);
  return classifySchema(tableNames);
}

/**
 * Persists the user-confirmed database type to the source record.
 */
export async function saveDatabaseTypeAction(
  sourceId: string,
  databaseType: DatabaseType
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");

  const [source] = await db.select().from(sources).where(eq(sources.id, sourceId));
  if (!source) throw new Error("Source not found.");
  if (source.userId !== session.user.id) throw new Error("Unauthorized.");

  await db.update(sources).set({ databaseType }).where(eq(sources.id, sourceId));
}
