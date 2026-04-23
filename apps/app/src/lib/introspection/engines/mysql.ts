/**
 * apps/app/src/lib/introspection/engines/mysql.ts
 * MySQL introspection engine — implements IntrospectionEngine.
 */

import mysql from "mysql2/promise";
import {
  IntrospectionEngine,
  IntrospectionLog,
  IntrospectionResult,
  TableSchema,
} from "../types";
import {
  createMySQLConnection,
  MYSQL_SYSTEM_SCHEMAS,
} from "../../db/adapters/mysql-client";

const EXCLUDED = MYSQL_SYSTEM_SCHEMAS.map((s) => `'${s}'`).join(", ");

function makeEmitter(onLog?: (log: IntrospectionLog) => void) {
  return (level: "info" | "warn" | "error", message: string, rawSql?: string) => {
    onLog?.({ timestamp: new Date().toISOString(), level, message, rawSql });
  };
}

async function fetchSchemaData(conn: mysql.Connection) {
  const [tableRows] = await conn.execute<mysql.RowDataPacket[]>(`
    SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS,
           COALESCE(DATA_LENGTH + INDEX_LENGTH, 0) AS size_bytes
    FROM information_schema.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA NOT IN (${EXCLUDED})
  `);

  const [colRows] = await conn.execute<mysql.RowDataPacket[]>(`
    SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA NOT IN (${EXCLUDED})
    ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
  `);

  const [fkRows] = await conn.execute<mysql.RowDataPacket[]>(`
    SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME,
           REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA NOT IN (${EXCLUDED})
  `);

  const [pkRows] = await conn.execute<mysql.RowDataPacket[]>(`
    SELECT TABLE_SCHEMA, TABLE_NAME FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_TYPE = 'PRIMARY KEY' AND TABLE_SCHEMA NOT IN (${EXCLUDED})
  `);

  const [idxRows] = await conn.execute<mysql.RowDataPacket[]>(`
    SELECT TABLE_SCHEMA, TABLE_NAME, COUNT(DISTINCT INDEX_NAME) AS index_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA NOT IN (${EXCLUDED})
    GROUP BY TABLE_SCHEMA, TABLE_NAME
  `);

  return { tableRows, colRows, fkRows, pkRows, idxRows };
}

function buildTableSchemas(
  tableRows: mysql.RowDataPacket[],
  colRows: mysql.RowDataPacket[],
  fkRows: mysql.RowDataPacket[],
  pkSet: Set<string>,
  idxMap: Map<string, number>
): { tables: TableSchema[]; totalSizeBytes: number; relationCount: number } {
  const tables: TableSchema[] = [];
  let totalSizeBytes = 0;
  let relationCount = 0;

  for (const row of tableRows) {
    const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`;
    const tableCols = colRows.filter(
      (c) => c.TABLE_SCHEMA === row.TABLE_SCHEMA && c.TABLE_NAME === row.TABLE_NAME
    );
    const tableFks = fkRows.filter(
      (f) => f.TABLE_SCHEMA === row.TABLE_SCHEMA && f.TABLE_NAME === row.TABLE_NAME
    );

    const sizeBytes = parseInt(row.size_bytes ?? "0", 10);
    const rowCount = parseInt(row.TABLE_ROWS ?? "0", 10);
    const hasPk = pkSet.has(key);
    const indexCount = idxMap.get(key) ?? 0;

    totalSizeBytes += sizeBytes;
    relationCount += tableFks.length;

    const healthScore = hasPk ? 100 : 80;

    tables.push({
      name: row.TABLE_NAME,
      schemaName: row.TABLE_SCHEMA,
      columns: tableCols.map((c) => ({
        name: c.COLUMN_NAME,
        type: c.DATA_TYPE,
        isNullable: c.IS_NULLABLE === "YES",
        defaultValue: c.COLUMN_DEFAULT ?? undefined,
        fieldMetrics: { nullFrac: 0, nDistinct: 0 },
      })),
      indices: [],
      foreignKeys: tableFks.map((f) => ({
        columnNames: [f.COLUMN_NAME],
        referencedTable: f.REFERENCED_TABLE_NAME,
        referencedColumns: [f.REFERENCED_COLUMN_NAME],
      })),
      metrics: {
        sizeBytes,
        rowCount,
        relationDensity: tableCols.length > 0 ? tableFks.length / tableCols.length : 0,
        indexCount,
        hasPrimaryKey: hasPk,
        deadTupleRatio: 0,
        dataHealthScore: healthScore,
        isStrategic: rowCount > 100_000 || tableFks.length > 5,
      },
    });
  }

  return { tables, totalSizeBytes, relationCount };
}

const DATE_TYPES = new Set(["date", "datetime", "timestamp", "time", "year"]);
const NUMERIC_TYPES = new Set(["int", "bigint", "smallint", "tinyint", "mediumint", "decimal", "float", "double", "numeric"]);

async function enrichTableSamples(
  conn: mysql.Connection,
  table: TableSchema,
  emit: ReturnType<typeof makeEmitter>
) {
  emit("info", `Analyzing domain context for ${table.schemaName}.${table.name}...`);

  try {
    const [samples] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM \`${table.schemaName}\`.\`${table.name}\` LIMIT 5`
    );
    if (samples.length > 0) {
      for (const col of table.columns) {
        col.fieldMetrics = {
          ...col.fieldMetrics,
          sampleValues: samples.map((s) => String(s[col.name] ?? "NULL")),
        };
      }
    }
  } catch {
    emit("warn", `Sampling failed for ${table.schemaName}.${table.name}`);
  }

  for (const col of table.columns) {
    if (!NUMERIC_TYPES.has(col.type) && !DATE_TYPES.has(col.type)) continue;
    const avgClause = DATE_TYPES.has(col.type) ? "" : `, AVG(\`${col.name}\`) AS avg`;
    try {
      const [stats] = await conn.execute<mysql.RowDataPacket[]>(`
        SELECT MIN(\`${col.name}\`) AS min, MAX(\`${col.name}\`) AS max${avgClause}
        FROM \`${table.schemaName}\`.\`${table.name}\`
      `);
      const r = stats[0];
      if (r) {
        col.fieldMetrics = { ...col.fieldMetrics, min: r.min, max: r.max, avg: r.avg };
      }
    } catch {
      emit("warn", `Could not fetch ranges for ${table.schemaName}.${table.name}.${col.name}`);
    }
  }
}

export class MySQLEngine implements IntrospectionEngine {
  getSecurityEnforcementCommands(): string[] {
    return [
      "SET SESSION MAX_EXECUTION_TIME = 30000",
      "START TRANSACTION READ ONLY",
    ];
  }

  async testConnection(connectionString: string): Promise<{
    success: boolean;
    logs: IntrospectionLog[];
  }> {
    const logs: IntrospectionLog[] = [];
    const addLog = (level: "info" | "warn" | "error", message: string, rawSql?: string) => {
      logs.push({ timestamp: new Date().toISOString(), level, message, rawSql });
    };

    let conn: mysql.Connection | undefined;
    try {
      addLog("info", "Opening secure TLS anchor to MySQL reef...");
      conn = await createMySQLConnection(connectionString);

      const txSql = "START TRANSACTION READ ONLY";
      addLog("info", `Enforcing security protocol: ${txSql}`, txSql);
      await conn.execute(txSql);

      const verifySql = "SELECT @@transaction_read_only AS is_readonly";
      addLog("info", verifySql, verifySql);
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(verifySql);

      const isReadOnly = rows[0]?.is_readonly === 1;
      await conn.execute("ROLLBACK");

      if (isReadOnly) {
        addLog("info", "Bioluminescent verification: Reef is READ-ONLY.");
        addLog("info", "Connection anchored successfully.");
        return { success: true, logs };
      }

      addLog("warn", "Security breach: Database reports READ-WRITE status.");
      return { success: false, logs };
    } catch (error: any) {
      addLog("error", `Depth failure: ${error.message ?? "Unknown connection error"}`);
      return { success: false, logs };
    } finally {
      await conn?.end().catch(() => {});
    }
  }

  async introspect(
    connectionString: string,
    onLog?: (log: IntrospectionLog) => void
  ): Promise<IntrospectionResult> {
    const start = Date.now();
    const emit = makeEmitter(onLog);

    let conn: mysql.Connection | undefined;
    try {
      emit("info", "Starting deep dive into MySQL schema...");
      conn = await createMySQLConnection(connectionString, { connectTimeout: 15_000 });

      emit("info", "Enforcing security protocol: START TRANSACTION READ ONLY", "START TRANSACTION READ ONLY");
      await conn.execute("START TRANSACTION READ ONLY");

      emit("info", "Scanning tables, columns, foreign keys and indexes from information_schema...");
      const { tableRows, colRows, fkRows, pkRows, idxRows } = await fetchSchemaData(conn);

      const pkSet = new Set(
        (pkRows as mysql.RowDataPacket[]).map((r) => `${r.TABLE_SCHEMA}.${r.TABLE_NAME}`)
      );
      const idxMap = new Map(
        (idxRows as mysql.RowDataPacket[]).map((r) => [
          `${r.TABLE_SCHEMA}.${r.TABLE_NAME}`,
          parseInt(r.index_count ?? "0", 10),
        ])
      );

      const { tables, totalSizeBytes, relationCount } = buildTableSchemas(
        tableRows as mysql.RowDataPacket[],
        colRows as mysql.RowDataPacket[],
        fkRows as mysql.RowDataPacket[],
        pkSet,
        idxMap
      );

      const topTables = [...tables]
        .sort((a, b) => (b.metrics?.rowCount ?? 0) - (a.metrics?.rowCount ?? 0))
        .slice(0, 10);

      for (const table of topTables) {
        await enrichTableSamples(conn, table, emit);
      }

      await conn.execute("COMMIT");
      emit("info", "Introspection complete. Surfacing results.", "DONE");

      return {
        engineVersion: "MySQL 8.x (Auto-detected)",
        tables,
        stats: {
          tableCount: tables.length,
          relationCount,
          totalSizeBytes,
          introspectionTimeMs: Date.now() - start,
        },
      };
    } catch (error: any) {
      emit("error", `Depth failure: ${error.message ?? "Unknown error during dive"}`);
      throw error;
    } finally {
      await conn?.end().catch(() => {});
    }
  }

  async getSchemas(connectionString: string): Promise<string[]> {
    let conn: mysql.Connection | undefined;
    try {
      conn = await createMySQLConnection(connectionString);
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME NOT IN (${EXCLUDED})`
      );
      return (rows as mysql.RowDataPacket[]).map((r) => r.SCHEMA_NAME);
    } finally {
      await conn?.end().catch(() => {});
    }
  }
}
