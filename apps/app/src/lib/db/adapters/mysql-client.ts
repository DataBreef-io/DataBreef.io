/**
 * apps/app/src/lib/db/adapters/mysql-client.ts
 * MySQL2 connection factory with TLS, 30s query timeout, and connection validation.
 */

import mysql from "mysql2/promise";

export const MYSQL_SYSTEM_SCHEMAS = [
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
];

const QUERY_TIMEOUT_MS = 30_000;

export interface MySQLConnectionOptions {
  connectTimeout?: number;
  ssl?: boolean;
}

function parseConnectionUrl(url: string): mysql.ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1) || undefined,
  };
}

/**
 * Creates a single mysql2 connection with TLS and a 30s SELECT timeout.
 * Caller is responsible for calling conn.end() when done.
 */
export async function createMySQLConnection(
  connectionString: string,
  opts: MySQLConnectionOptions = {}
): Promise<mysql.Connection> {
  const config = parseConnectionUrl(connectionString);

  const conn = await mysql.createConnection({
    ...config,
    connectTimeout: opts.connectTimeout ?? 10_000,
    ssl: opts.ssl !== false ? { rejectUnauthorized: false } : undefined,
  });

  // Apply per-statement timeout for SELECT statements (MySQL 5.7.4+).
  // Silently ignored on older versions.
  try {
    await conn.execute(`SET SESSION MAX_EXECUTION_TIME = ${QUERY_TIMEOUT_MS}`);
  } catch {
    // Older MySQL may not support MAX_EXECUTION_TIME — non-fatal.
  }

  return conn;
}

/**
 * Validates an open connection is still alive via a lightweight ping.
 */
export async function validateMySQLConnection(
  conn: mysql.Connection
): Promise<boolean> {
  try {
    await conn.ping();
    return true;
  } catch {
    return false;
  }
}
