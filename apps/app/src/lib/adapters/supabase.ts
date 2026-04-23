/**
 * lib/adapters/supabase.ts
 * ⚠️ DEPRECATED: Use custom-postgres.ts instead
 *
 * The official @auth/supabase-adapter uses PostgREST which only exposes the
 * public and graphql_public schemas. Auth.js expects tables in the next_auth
 * schema which is not accessible via PostgREST.
 *
 * The custom-postgres adapter (custom-postgres.ts) uses postgres.js directly
 * and works with tables in the public schema without PostgREST limitations.
 */
