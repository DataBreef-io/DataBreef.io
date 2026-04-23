import { db } from "../lib/db-client";
import { sources, dibs } from "../lib/tables/schema";
import { desc, eq } from "drizzle-orm";
import { generateDibBackground } from "../components/dibs/actions";

/**
 * Diagnostic script for Deep Dib generation.
 * Run with: pnpm exec tsx src/scripts/test-deep-dibs.ts
 */
async function testDeepDibs() {
  console.log("🌊 Starting Deep Dive Intelligence Test...");

  try {
    // 1. Get latest source
    const [source] = await db
      .select()
      .from(sources)
      .orderBy(desc(sources.createdAt))
      .limit(1);

    if (!source) throw new Error("No sources found.");

    // 2. Create a fresh test Dib
    const [newDib] = await db.insert(dibs).values({
      sourceId: source.id,
      userId: "demo-user",
      title: "Test Deep Dive...",
      summary: "Testing engine enhancements...",
      contentJson: {},
      status: "pending",
    }).returning();

    console.log(`⚓ Created test Dib: ${newDib.id}`);

    // 3. Run worker directly
    console.log("🚀 Running background worker logic...");
    await generateDibBackground(newDib.id, source.connectionStringEncrypted);

    // 4. Verify result
    const [result] = await db
      .select()
      .from(dibs)
      .where(eq(dibs.id, newDib.id));

    if (result.status === "completed") {
      console.log("\n✨ DEEP DIB GENERATION SUCCESSFUL!");
      const content = result.contentJson as any;
      
      console.log(`Title: ${result.title}`);
      console.log("Row Counts Sample:", content.charts.rowCounts.slice(0, 3));
      
      console.log("\n🔍 INSIGHTS WITH ENTITIES:");
      content.insights.forEach((i: any) => {
        console.log(`- [${i.severity}] ${i.title}`);
        console.log(`  Entities: ${i.entities?.join(", ") || "None found"}`);
      });
    } else {
      console.error("❌ Generation failed:", result.errorLog);
    }

    process.exit(0);
  } catch (err) {
    console.error("💥 Test failed:", err);
    process.exit(1);
  }
}

testDeepDibs();
