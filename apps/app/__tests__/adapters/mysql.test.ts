/**
 * apps/app/__tests__/adapters/mysql.test.ts
 * Conformance tests for the MySQL introspection engine.
 *
 * Run with: pnpm --filter @databreef/app test (requires vitest or jest setup).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MySQLEngine } from "@/lib/introspection/engines/mysql";
import type { IntrospectionLog } from "@/lib/introspection/types";

// ---------------------------------------------------------------------------
// mysql2/promise mock
// ---------------------------------------------------------------------------
const mockExecute = vi.fn();
const mockPing = vi.fn();
const mockEnd = vi.fn().mockResolvedValue(undefined);

const mockConnection = {
  execute: mockExecute,
  ping: mockPing,
  end: mockEnd,
};

vi.mock("mysql2/promise", () => ({
  default: {
    createConnection: vi.fn().mockResolvedValue(mockConnection),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONNECTION_STRING = "mysql://reader:secret@localhost:3306/mydb";

function makeReadOnlyRows() {
  return [[{ is_readonly: 1 }]];
}

function makeTableRows() {
  return [
    [
      {
        TABLE_SCHEMA: "mydb",
        TABLE_NAME: "users",
        TABLE_ROWS: "500",
        size_bytes: "16384",
      },
      {
        TABLE_SCHEMA: "mydb",
        TABLE_NAME: "orders",
        TABLE_ROWS: "1200",
        size_bytes: "32768",
      },
    ],
  ];
}

function makeColRows() {
  return [
    [
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "users", COLUMN_NAME: "id", DATA_TYPE: "int", IS_NULLABLE: "NO", COLUMN_DEFAULT: null },
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "users", COLUMN_NAME: "email", DATA_TYPE: "varchar", IS_NULLABLE: "YES", COLUMN_DEFAULT: null },
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "orders", COLUMN_NAME: "id", DATA_TYPE: "int", IS_NULLABLE: "NO", COLUMN_DEFAULT: null },
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "orders", COLUMN_NAME: "user_id", DATA_TYPE: "int", IS_NULLABLE: "NO", COLUMN_DEFAULT: null },
    ],
  ];
}

function makeFkRows() {
  return [
    [
      {
        TABLE_SCHEMA: "mydb",
        TABLE_NAME: "orders",
        COLUMN_NAME: "user_id",
        REFERENCED_TABLE_SCHEMA: "mydb",
        REFERENCED_TABLE_NAME: "users",
        REFERENCED_COLUMN_NAME: "id",
      },
    ],
  ];
}

function makePkRows() {
  return [
    [
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "users" },
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "orders" },
    ],
  ];
}

function makeIdxRows() {
  return [
    [
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "users", index_count: "2" },
      { TABLE_SCHEMA: "mydb", TABLE_NAME: "orders", index_count: "3" },
    ],
  ];
}

function makeSampleRows() {
  return [[{ id: 1, email: "user@example.com" }]];
}

function makeStatsRows() {
  return [[{ min: 1, max: 500, avg: 250 }]];
}

function makeSchemaRows() {
  return [[{ SCHEMA_NAME: "mydb" }, { SCHEMA_NAME: "analytics" }]];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MySQLEngine.getSecurityEnforcementCommands", () => {
  it("includes MAX_EXECUTION_TIME and START TRANSACTION READ ONLY", () => {
    const engine = new MySQLEngine();
    const cmds = engine.getSecurityEnforcementCommands();
    expect(cmds).toContain("SET SESSION MAX_EXECUTION_TIME = 30000");
    expect(cmds).toContain("START TRANSACTION READ ONLY");
  });
});

describe("MySQLEngine.testConnection", () => {
  let engine: MySQLEngine;

  beforeEach(() => {
    engine = new MySQLEngine();
    vi.clearAllMocks();
    mockEnd.mockResolvedValue(undefined);
  });

  it("returns success=true when read-only transaction is confirmed", async () => {
    mockExecute
      .mockResolvedValueOnce(undefined) // SET SESSION MAX_EXECUTION_TIME
      .mockResolvedValueOnce(undefined) // START TRANSACTION READ ONLY
      .mockResolvedValueOnce(makeReadOnlyRows()) // SELECT @@transaction_read_only
      .mockResolvedValueOnce(undefined); // ROLLBACK

    const result = await engine.testConnection(CONNECTION_STRING);

    expect(result.success).toBe(true);
    expect(result.logs.some((l) => l.message.includes("READ-ONLY"))).toBe(true);
  });

  it("returns success=false when is_readonly is 0", async () => {
    mockExecute
      .mockResolvedValueOnce(undefined) // SET SESSION MAX_EXECUTION_TIME
      .mockResolvedValueOnce(undefined) // START TRANSACTION READ ONLY
      .mockResolvedValueOnce([[{ is_readonly: 0 }]]) // not read-only
      .mockResolvedValueOnce(undefined); // ROLLBACK

    const result = await engine.testConnection(CONNECTION_STRING);

    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.level === "warn")).toBe(true);
  });

  it("returns success=false and logs error on connection failure", async () => {
    const { default: mysql2 } = await import("mysql2/promise");
    vi.mocked(mysql2.createConnection).mockRejectedValueOnce(
      new Error("Connection refused")
    );

    const result = await engine.testConnection(CONNECTION_STRING);

    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.level === "error")).toBe(true);
    expect(result.logs.some((l) => l.message.includes("Connection refused"))).toBe(true);
  });

  it("emits audit logs for START TRANSACTION READ ONLY command", async () => {
    mockExecute
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(makeReadOnlyRows())
      .mockResolvedValueOnce(undefined);

    const result = await engine.testConnection(CONNECTION_STRING);
    const txLog = result.logs.find((l) => l.rawSql === "START TRANSACTION READ ONLY");

    expect(txLog).toBeDefined();
    expect(txLog?.level).toBe("info");
  });
});

describe("MySQLEngine.introspect", () => {
  let engine: MySQLEngine;
  let logs: IntrospectionLog[];

  beforeEach(() => {
    engine = new MySQLEngine();
    logs = [];
    vi.clearAllMocks();
    mockEnd.mockResolvedValue(undefined);

    // Default mock sequence for full introspection
    mockExecute
      .mockResolvedValueOnce(undefined) // SET SESSION MAX_EXECUTION_TIME
      .mockResolvedValueOnce(undefined) // START TRANSACTION READ ONLY
      .mockResolvedValueOnce(makeTableRows()) // TABLES
      .mockResolvedValueOnce(makeColRows()) // COLUMNS
      .mockResolvedValueOnce(makeFkRows()) // KEY_COLUMN_USAGE
      .mockResolvedValueOnce(makePkRows()) // TABLE_CONSTRAINTS
      .mockResolvedValueOnce(makeIdxRows()) // STATISTICS
      .mockResolvedValue(makeSampleRows()); // sampling + stats (remaining calls)
  });

  it("returns tables with correct names and schemas", async () => {
    const result = await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));

    expect(result.tables).toHaveLength(2);
    expect(result.tables.map((t) => t.name)).toContain("users");
    expect(result.tables.map((t) => t.name)).toContain("orders");
  });

  it("maps foreign keys correctly", async () => {
    const result = await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));
    const orders = result.tables.find((t) => t.name === "orders")!;

    expect(orders.foreignKeys).toHaveLength(1);
    expect(orders.foreignKeys[0].referencedTable).toBe("users");
    expect(orders.foreignKeys[0].columnNames).toContain("user_id");
  });

  it("marks tables with PKs correctly", async () => {
    const result = await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));

    for (const table of result.tables) {
      expect(table.metrics?.hasPrimaryKey).toBe(true);
    }
  });

  it("emits audit logs for all security enforcement steps", async () => {
    await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));

    expect(logs.some((l) => l.rawSql === "START TRANSACTION READ ONLY")).toBe(true);
    expect(logs.some((l) => l.message.includes("Introspection complete"))).toBe(true);
  });

  it("includes tableCount and introspectionTimeMs in stats", async () => {
    const result = await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));

    expect(result.stats.tableCount).toBe(2);
    expect(result.stats.introspectionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("enforces read-only: COMMIT issued after introspection", async () => {
    await engine.introspect(CONNECTION_STRING, (l) => logs.push(l));

    const calls = mockExecute.mock.calls.map((c: unknown[]) => String(c[0]).trim());
    expect(calls).toContain("COMMIT");
  });

  it("propagates errors and closes the connection", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValueOnce(undefined); // SET SESSION MAX_EXECUTION_TIME
    mockExecute.mockRejectedValueOnce(new Error("Query failed"));

    await expect(
      engine.introspect(CONNECTION_STRING, (l) => logs.push(l))
    ).rejects.toThrow("Query failed");

    expect(mockEnd).toHaveBeenCalled();
  });
});

describe("MySQLEngine.getSchemas", () => {
  let engine: MySQLEngine;

  beforeEach(() => {
    engine = new MySQLEngine();
    vi.clearAllMocks();
    mockEnd.mockResolvedValue(undefined);
    mockExecute
      .mockResolvedValueOnce(undefined) // SET SESSION MAX_EXECUTION_TIME
      .mockResolvedValueOnce(makeSchemaRows()); // SCHEMATA query
  });

  it("returns user schemas excluding system schemas", async () => {
    const schemas = await engine.getSchemas(CONNECTION_STRING);
    expect(schemas).toContain("mydb");
    expect(schemas).toContain("analytics");
    expect(schemas).not.toContain("information_schema");
    expect(schemas).not.toContain("mysql");
  });
});
