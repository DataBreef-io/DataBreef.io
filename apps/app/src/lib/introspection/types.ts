/**
 * apps/app/src/lib/introspection/types.ts
 * Standard interface for all database introspection engines.
 */

export type DatabaseEngineType = "postgres" | "mysql" | "mssql" | "oracle" | "snowflake";

export interface IntrospectionLog {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  rawSql?: string; // The specific SQL command being executed
}

export interface TableSchema {
  name: string;
  schemaName: string;
  columns: Array<{
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue?: string;
    fieldMetrics?: {
      min?: string | number;
      max?: string | number;
      avg?: number;
      distinctCount?: number;
      nullFrac?: number; // Fraction of rows that are null
      nDistinct?: number; // Estimated number of distinct values
      sampleValues?: string[]; // Small set of real values for context
    };
  }>;
  indices: Array<{
    name: string;
    columnNames: string[];
    isUnique: boolean;
  }>;
  foreignKeys: Array<{
    columnNames: string[];
    referencedTable: string;
    referencedColumns: string[];
  }>;
  metrics?: {
    sizeBytes: number;
    rowCount: number;
    relationDensity: number; // Avg number of relations per column
    indexCount: number;
    hasPrimaryKey: boolean;
    deadTupleRatio: number; // For zombie detection
    dataHealthScore: number; // 0-100 score
    isStrategic: boolean; // Flagged if central to the reef
  };
}

export interface IntrospectionResult {
  engineVersion: string;
  tables: TableSchema[];
  stats: {
    tableCount: number;
    relationCount: number;
    totalSizeBytes: number;
    introspectionTimeMs: number;
  };
}

export interface IntrospectionEngine {
  /**
   * Returns the SQL commands used to enforce a read-only session
   * for this specific database engine.
   */
  getSecurityEnforcementCommands(): string[];

  /**
   * Tests the connection and verifies read-only status.
   * Returns a log stream or thrown error.
   */
  testConnection(connectionString: string): Promise<{
    success: boolean;
    logs: IntrospectionLog[];
  }>;

  /**
   * Performs the full schema introspection.
   * Emits logs via a callback for real-time UI updates.
   */
  introspect(
    connectionString: string,
    onLog?: (log: IntrospectionLog) => void
  ): Promise<IntrospectionResult>;
}
