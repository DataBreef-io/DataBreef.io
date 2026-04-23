import { db } from "../lib/db-client";
import { sources, dibs } from "../lib/tables/schema";
import { eq } from "drizzle-orm";
import { generateDibBackground } from "../components/dibs/actions";

const EMPLOYEES_CONN = "postgresql://neondb_owner:npg_gsVbk6IKYXe1@ep-shiny-darkness-ane7gg76-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// We'll temporarily proxy the generate function to avoid the encryption layer for verification
async function verifyEmployeesReef() {
  console.log("🌊 Diving into the Employees Research Reef (UNENCRYPTED PASS)...");

  try {
    const [realSource] = await db.select().from(sources).limit(1);
    if (!realSource) throw new Error("Need at least one source in DB to run test.");

    const [newDib] = await db.insert(dibs).values({
      sourceId: realSource.id,
      userId: "demo-user",
      title: "Verifying Employees Reef...",
      summary: "Simulating Workforce Intelligence Brief...",
      contentJson: {},
      status: "pending",
    }).returning();

    console.log(`⚓ Created verification Dib: ${newDib.id}`);

    // Call the engine directly to verify theme detection logic
    const { PostgresEngine } = await import("../lib/introspection/engines/postgres");
    const { synthesizeNarrative } = await import("../lib/intelligence/synthesis");
    
    const engine = new PostgresEngine();
    const result = await engine.introspect(EMPLOYEES_CONN);
    const narrative = await synthesizeNarrative(result);

    console.log("\n✨ EMPLOYEES REEF DATA CAPTURED!");
    console.log("Summary:", narrative.executiveSummary);
    console.log("Tables Scanned:", result.tables.map(t => t.name).join(", "));
    console.log("\nKey Metrics:", narrative.keyMetrics.map((m: { label: string; value: string }) => `${m.label}: ${m.value}`).join(" | "));
    
    // Update the DB so the UI can show it
    await db.update(dibs).set({
      title: "Employee Reef Synergy",
      status: "completed",
      contentJson: { 
        narrative, 
        stats: result.stats, 
        insights: [], 
        charts: { 
          sizeDistribution: [], 
          rowCounts: result.tables.map(t => ({ name: t.name, count: t.metrics?.rowCount ?? 0 }))
        } 
      }
    }).where(eq(dibs.id, newDib.id));

    process.exit(0);
  } catch (err) {
    console.error("💥 Verification failed:", err);
    process.exit(1);
  }
}

verifyEmployeesReef();
