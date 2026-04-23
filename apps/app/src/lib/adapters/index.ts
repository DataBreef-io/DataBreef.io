/**
 * lib/adapters/index.ts
 * Returns the correct Auth.js database adapter based on AUTH_PROVIDER env var.
 *
 * - AUTH_PROVIDER=supabase → Custom Postgres adapter using postgres.js (Supabase)
 * - AUTH_PROVIDER=postgres → Custom Postgres adapter for self-hosted PostgreSQL
 */

import { createCustomPostgresAdapter } from "./custom-postgres";

export function getAdapter() {
  const provider = process.env.AUTH_PROVIDER ?? "supabase";

  // Both supabase and postgres use the same custom adapter with postgres.js
  if (provider === "supabase" || provider === "postgres") {
    return createCustomPostgresAdapter();
  }

  throw new Error(`Unknown AUTH_PROVIDER: ${provider}. Supported: "supabase", "postgres"`);
}
