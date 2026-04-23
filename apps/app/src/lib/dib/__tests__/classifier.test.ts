import { classifySchema, getMatchedSignals, DatabaseType } from "../classifier";

// ── helpers ───────────────────────────────────────────────────────────────────

function expectType(tables: string[], expected: DatabaseType) {
  const result = classifySchema(tables);
  expect(result.type).toBe(expected);
}

function expectMinConfidence(tables: string[], type: DatabaseType, min: number) {
  const result = classifySchema(tables);
  expect(result.type).toBe(type);
  expect(result.confidence).toBeGreaterThanOrEqual(min);
}

// ── CRM ───────────────────────────────────────────────────────────────────────

describe("CRM detection", () => {
  it("detects a classic CRM schema (HubSpot-like)", () => {
    const tables = ["contacts", "accounts", "deals", "opportunities", "leads", "prospects", "pipelines"];
    expectMinConfidence(tables, "CRM", 70);
  });

  it("detects CRM even with mixed utility tables", () => {
    const tables = ["contacts", "accounts", "customers", "migrations", "settings", "audit_logs"];
    expectType(tables, "CRM");
  });

  it("handles prefixed/suffixed CRM tables", () => {
    const tables = ["crm_contacts", "crm_accounts", "crm_deals", "system_config"];
    expectType(tables, "CRM");
  });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

describe("Analytics detection", () => {
  it("detects a classic analytics / data warehouse schema", () => {
    // fact_, dim_, metric, summary → 4/10 keywords matched = 40%
    const tables = ["fact_orders", "fact_sessions", "dim_users", "dim_products", "dim_dates", "metric_summary"];
    expectMinConfidence(tables, "Analytics", 40);
  });

  it("detects analytics with event-based names", () => {
    const tables = ["events", "pageviews", "impressions", "analytics_daily", "reporting_weekly"];
    expectType(tables, "Analytics");
  });
});

// ── Transactional ─────────────────────────────────────────────────────────────

describe("Transactional detection", () => {
  it("detects e-commerce / transactional schema", () => {
    // order, payment, inventory, shipment, invoice, product → 6/10 keywords = 60%
    const tables = ["orders", "order_items", "payments", "inventory", "shipments", "invoices", "products"];
    expectMinConfidence(tables, "Transactional", 60);
  });

  it("detects transactional with cart / checkout tables", () => {
    const tables = ["cart", "checkout", "transactions", "fulfillment_queue", "products"];
    expectType(tables, "Transactional");
  });
});

// ── UserManagement ────────────────────────────────────────────────────────────

describe("UserManagement detection", () => {
  it("detects auth / user management schema", () => {
    const tables = ["users", "roles", "permissions", "sessions", "credentials", "tokens"];
    expectMinConfidence(tables, "UserManagement", 60);
  });

  it("detects user management with org / group tables", () => {
    const tables = ["users", "organizations", "groups", "members", "auth_providers", "access_policies"];
    expectType(tables, "UserManagement");
  });
});

// ── Custom fallback ───────────────────────────────────────────────────────────

describe("Custom fallback", () => {
  it("returns Custom when no pattern matches", () => {
    const tables = ["widgets", "gadgets", "blobs", "things", "foobar", "baz_table"];
    expectType(tables, "Custom");
  });

  it("returns Custom with 100 confidence on no pattern", () => {
    const result = classifySchema(["widgets", "gadgets", "blobs"]);
    expect(result.type).toBe("Custom");
    expect(result.confidence).toBe(100);
  });

  it("returns Custom for empty table list", () => {
    const result = classifySchema([]);
    expect(result.type).toBe("Custom");
    expect(result.confidence).toBe(100);
  });
});

// ── Confidence threshold boundary ─────────────────────────────────────────────

describe("Confidence scoring", () => {
  it("scores all types independently", () => {
    const tables = ["contacts", "accounts", "deals", "leads", "prospects", "opportunities"];
    const result = classifySchema(tables);
    expect(result.scores.CRM).toBeGreaterThan(result.scores.Analytics);
    expect(result.scores.CRM).toBeGreaterThan(result.scores.Transactional);
    expect(result.scores.CRM).toBeGreaterThan(result.scores.UserManagement);
  });

  it("confidence > 75 for a strongly-typed CRM schema", () => {
    const tables = [
      "contacts", "accounts", "deals", "opportunities", "leads",
      "prospects", "pipeline_stages", "customer_segments", "client_notes",
    ];
    const result = classifySchema(tables);
    expect(result.type).toBe("CRM");
    expect(result.confidence).toBeGreaterThan(75);
  });
});

// ── getMatchedSignals ─────────────────────────────────────────────────────────

describe("getMatchedSignals", () => {
  it("returns tables that match CRM patterns", () => {
    const tables = ["contacts", "orders", "accounts", "payments", "leads"];
    const signals = getMatchedSignals(tables, "CRM");
    expect(signals).toContain("contacts");
    expect(signals).toContain("accounts");
    expect(signals).toContain("leads");
    expect(signals).not.toContain("orders");
    expect(signals).not.toContain("payments");
  });

  it("returns empty array when no tables match", () => {
    const tables = ["widgets", "gadgets", "blobs"];
    expect(getMatchedSignals(tables, "CRM")).toHaveLength(0);
  });
});
