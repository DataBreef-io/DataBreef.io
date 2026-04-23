/**
 * apps/app/src/lib/introspection/engines/postgres.ts
 * PostgreSQL introspection engine.
 */

import { 
  IntrospectionEngine, 
  IntrospectionLog, 
  IntrospectionResult 
} from "../types";

import postgres from "postgres";

export class PostgresEngine implements IntrospectionEngine {
  
  getSecurityEnforcementCommands(): string[] {
    return [
      "SET TRANSACTION READ ONLY",
      "SET statement_timeout = '30s'"
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

    let sql;
    try {
      addLog("info", "Opening secure TLS anchor to PostgreSQL reef...");
      
      sql = postgres(connectionString, {
        ssl: "require",
        connect_timeout: 10,
        max: 1
      });

      // We run the verification inside a READ ONLY transaction.
      // This is safer than modifying the session state which might persist if pooled.
      const isReadOnly = await sql.begin(async (tx) => {
        addLog("info", "Enforcing security protocol: SET TRANSACTION READ ONLY", "SET TRANSACTION READ ONLY");
        await tx`SET TRANSACTION READ ONLY`;

        addLog("info", "Verifying read-only status from pg_catalog...");
        const verifySql = "SELECT current_setting('transaction_read_only') as is_readonly";
        addLog("info", verifySql, verifySql);
        
        const [result] = await tx.unsafe(verifySql);
        return result.is_readonly === "on";
      });

      if (isReadOnly) {
        addLog("info", "Bioluminescent verification: Reef is READ-ONLY.");
        addLog("info", "Connection anchored successfully.");
        return { success: true, logs };
      } else {
        addLog("warn", "Security breach: Database reports READ-WRITE status.");
        return { success: false, logs };
      }
    } catch (error: any) {
      addLog("error", `Depth failure: ${error.message || "Unknown connection error"}`);
      return { success: false, logs };
    } finally {
      if (sql) await sql.end();
    }
  }

  async introspect(
    connectionString: string,
    onLog?: (log: IntrospectionLog) => void
  ): Promise<IntrospectionResult> {
    const start = Date.now();
    const emit = (level: "info" | "warn" | "error", message: string, rawSql?: string) => {
      onLog?.({ timestamp: new Date().toISOString(), level, message, rawSql });
    };

    let sql;
    try {
      emit("info", "Starting deep dive into PostgreSQL schema...");
      
      sql = postgres(connectionString, {
        ssl: "require",
        connect_timeout: 15,
        max: 1
      });

      const tables: TableSchema[] = [];
      let totalSizeBytes = 0;
      let relationCount = 0;

      await sql.begin(async (tx) => {
        emit("info", "Enforcing security protocol: SET TRANSACTION READ ONLY", "SET TRANSACTION READ ONLY");
        await tx`SET TRANSACTION READ ONLY`;

        // 1. Fetch tables, sizes, row counts, and PK status
        emit("info", "Scanning for tables and health metrics...", "SELECT table_schema, table_name, has_pk...");
        const tableData = await tx`
          SELECT 
            t.table_schema,
            t.table_name,
            pg_total_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)) as size_bytes,
            s.n_live_tup as row_estimate,
            s.n_dead_tup as dead_tup,
            EXISTS (
              SELECT 1 FROM information_schema.table_constraints tc 
              WHERE tc.table_name = t.table_name 
              AND tc.table_schema = t.table_schema 
              AND tc.constraint_type = 'PRIMARY KEY'
            ) as has_pk,
            (SELECT count(*) FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid JOIN pg_namespace n ON n.oid = c.relnamespace 
             WHERE c.relname = t.table_name AND n.nspname = t.table_schema) as index_count
          FROM information_schema.tables t
          LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name AND s.schemaname = t.table_schema
          WHERE t.table_schema NOT IN ('information_schema')
          AND t.table_schema NOT LIKE 'pg_%'
          AND t.table_type = 'BASE TABLE'
        `;

        // 2. Fetch Columns
        emit("info", "Mapping column structures & stats...", "SELECT table_schema, table_name, column_name FROM information_schema.columns");
        const columnData = await tx`
          SELECT 
            c.table_schema, 
            c.table_name, 
            c.column_name, 
            c.data_type, 
            c.is_nullable, 
            c.column_default,
            s.null_frac,
            s.n_distinct
          FROM information_schema.columns c
          LEFT JOIN pg_stats s ON s.schemaname = c.table_schema 
            AND s.tablename = c.table_name 
            AND s.attname = c.column_name
          WHERE c.table_schema NOT IN ('information_schema')
          AND c.table_schema NOT LIKE 'pg_%'
        `;

        // 3. Fetch Foreign Keys
        emit("info", "Mapping relationship density...", "SELECT * FROM information_schema.key_column_usage");
        const fkData = await tx`
          SELECT
            kcu.table_schema,
            kcu.table_name,
            kcu.column_name,
            rel_kcu.table_schema AS referenced_schema,
            rel_kcu.table_name AS referenced_table,
            rel_kcu.column_name AS referenced_column
          FROM information_schema.table_constraints tco
          JOIN information_schema.key_column_usage kcu
            ON tco.constraint_name = kcu.constraint_name
            AND tco.table_schema = kcu.table_schema
          JOIN information_schema.referential_constraints rco
            ON tco.constraint_name = rco.constraint_name
            AND tco.table_schema = rco.unique_constraint_schema
          JOIN information_schema.key_column_usage rel_kcu
            ON rco.unique_constraint_name = rel_kcu.constraint_name
            AND rco.unique_constraint_schema = rel_kcu.table_schema
          WHERE tco.constraint_type = 'FOREIGN KEY'
          AND tco.table_schema NOT IN ('information_schema')
          AND tco.table_schema NOT LIKE 'pg_%'
        `;

        // Process tables
        for (const row of tableData) {
          const tableName = row.table_name;
          const schemaName = row.table_schema;
          const tableCols = columnData.filter(c => c.table_name === tableName && c.table_schema === schemaName);
          const tableFks = fkData.filter(f => f.table_name === tableName && f.table_schema === schemaName);

          const size = parseInt(row.size_bytes || "0");
          const rowCount = Math.max(0, parseInt(row.row_estimate || "0"));
          const deadTup = parseInt(row.dead_tup || "0");
          const totalTup = rowCount + deadTup;

          totalSizeBytes += size;
          relationCount += tableFks.length;

          // Simple Health Score: starts at 100
          // -20 if no PK
          // -10 if high dead tuple ratio
          // -X if null density is high across columns
          let healthScore = 100;
          if (row.has_pk !== true) healthScore -= 20;
          if (totalTup > 0 && deadTup / totalTup > 0.1) healthScore -= 10;
          
          tables.push({
            name: tableName,
            schemaName,
            columns: tableCols.map(c => ({
              name: c.column_name,
              type: c.data_type,
              isNullable: c.is_nullable === "YES",
              defaultValue: c.column_default || undefined,
              fieldMetrics: {
                nullFrac: parseFloat(c.null_frac || "0"),
                nDistinct: parseFloat(c.n_distinct || "0")
              }
            })),
            indices: [],
            foreignKeys: tableFks.map(f => ({
              columnNames: [f.column_name],
              referencedTable: f.referenced_table,
              referencedColumns: [f.referenced_column]
            })),
            metrics: {
              sizeBytes: size,
              rowCount,
              relationDensity: tableCols.length > 0 ? tableFks.length / tableCols.length : 0,
              indexCount: parseInt(row.index_count || "0"),
              hasPrimaryKey: row.has_pk === true,
              deadTupleRatio: totalTup > 0 ? deadTup / totalTup : 0,
              dataHealthScore: Math.max(0, healthScore),
              isStrategic: rowCount > 100000 || tableFks.length > 5 // Simple heuristic
            }
          });
        }

        // 4. Deep Metric Pass & Sampling
        const topTables = tables
          .sort((a, b) => (b.metrics?.rowCount ?? 0) - (a.metrics?.rowCount ?? 0))
          .slice(0, 10); // Analyze more tables for sampling

        for (const table of topTables) {
          emit("info", `Analyzing domain context for ${table.schemaName}.${table.name}...`);
          
          // Fetch 5 sample rows for the table
          try {
            const samples = await tx.unsafe(`
              SELECT * FROM "${table.schemaName}"."${table.name}" 
              LIMIT 5
            `);
            
            // Map sample values back to columns
            if (samples.length > 0) {
              for (const col of table.columns) {
                col.fieldMetrics = {
                  ...col.fieldMetrics,
                  sampleValues: samples.map(s => String(s[col.name] ?? "NULL"))
                };
              }
            }
          } catch (e) {
            emit("warn", `Sampling failed for ${table.schemaName}.${table.name}`);
          }

          if ((table.metrics?.rowCount ?? 0) === 0) continue;

          const metricCols = table.columns.filter(c => 
            c.type.includes("int") || 
            c.type.includes("numeric") || 
            c.type.includes("decimal") || 
            c.type.includes("date") || 
            c.type.includes("timestamp")
          );

          if (metricCols.length === 0) continue;
          
          for (const col of metricCols) {
            try {
              const isDate = col.type.includes("date") || col.type.includes("timestamp");
              const stats = await tx.unsafe(`
                SELECT 
                  MIN("${col.name}") as min,
                  MAX("${col.name}") as max
                  ${!isDate ? `, AVG("${col.name}")::float as avg` : ""}
                FROM "${table.schemaName}"."${table.name}"
              `);
              
              const row = stats[0];
              col.fieldMetrics = {
                ...col.fieldMetrics,
                min: row.min,
                max: row.max,
                avg: row.avg ?? undefined
              };
            } catch (e) {
              emit("warn", `Could not fetch ranges for ${table.schemaName}.${table.name}.${col.name}`);
            }
          }
        }
      });

      emit("info", "Introspection complete. Surfacing results.", "DONE");
      
      return {
        engineVersion: "PostgreSQL 16.x (Auto-detected)",
        tables,
        stats: {
          tableCount: tables.length,
          relationCount,
          totalSizeBytes,
          introspectionTimeMs: Date.now() - start
        }
      };

    } catch (error: any) {
      emit("error", `Depth failure: ${error.message || "Unknown error during dive"}`);
      throw error;
    } finally {
      if (sql) await sql.end();
    }
  }

  async getSchemas(connectionString: string): Promise<string[]> {
    let sql;
    try {
      sql = postgres(connectionString, {
        ssl: "require",
        connect_timeout: 10,
        max: 1
      });

      const schemas = await sql`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema') 
        AND schema_name NOT LIKE 'pg_%'
      `;

      return schemas.map(s => s.schema_name);
    } finally {
      if (sql) await sql.end();
    }
  }
}
