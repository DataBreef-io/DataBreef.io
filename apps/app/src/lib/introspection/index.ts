/**
 * apps/app/src/lib/introspection/index.ts
 * Factory for retrieving the correct introspection engine.
 */

import { IntrospectionEngine, DatabaseEngineType } from "./types";
import { PostgresEngine, MySQLEngine } from "./engines";

const ENGINES: Record<DatabaseEngineType, new () => IntrospectionEngine> = {
  postgres: PostgresEngine,
  mysql: MySQLEngine,
  mssql: PostgresEngine, // Stub for now
  oracle: PostgresEngine, // Stub for now
  snowflake: PostgresEngine, // Stub for now
};

export function getEngine(type: DatabaseEngineType): IntrospectionEngine {
  const EngineClass = ENGINES[type];
  if (!EngineClass) {
    throw new Error(`Unsupported database engine: ${type}`);
  }
  return new EngineClass();
}

export * from "./types";
