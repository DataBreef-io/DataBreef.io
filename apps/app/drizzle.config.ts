import { defineConfig } from "drizzle-kit";
// use .env.local for drizzle-kit rather than the .env vars
// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/tables/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/databreef",
  },
});
