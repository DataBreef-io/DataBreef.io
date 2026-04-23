import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables/schema";

/**
 * Database connection to Supabase via postgres.js
 *
 * Uses environment variables:
 * - DATABASE_HOST
 * - DATABASE_PORT
 * - DATABASE_USER
 * - DATABASE_PASSWORD
 * - DATABASE_NAME
 */

const connectionString = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?sslmode=require`;

if (!process.env.DATABASE_HOST || !process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD) {
  throw new Error(
    "Missing required database environment variables: DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD"
  );
}

const sql = postgres(connectionString, {
  max: 10,
  ssl: "require",
});

export const db = drizzle(sql, { schema });
export type Database = typeof db;
