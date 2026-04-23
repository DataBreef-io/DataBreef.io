import { db } from "../lib/db-client";
import { sources, dibs } from "../lib/tables/schema";
import { eq, desc } from "drizzle-orm";
import { surfaceBriefAction } from "../components/dibs/actions";

/**
 * Verification script for Dib generation and actionable insights.
 * Run with: pnpm exec tsx src/scripts/test-dib-gen.ts
 */
async function verifyDibGeneration() {
  console.log("🌊 Starting Bioluminescent Verification Dive...");

  try {
    // 1. Find the latest source
    const [latestSource] = await db
      .select()
      .from(sources)
      .orderBy(desc(sources.createdAt))
      .limit(1);

    if (!latestSource) {
      console.error("❌ No sources found in the reef. Please anchor a source first.");
      process.exit(1);
    }

    console.log(`⚓ Anchoring to source: ${latestSource.name} (${latestSource.id})`);

    // 2. Trigger Surface Brief (Note: this will throw Redirect error in script, which is expected)
    console.log("🚀 Triggering 'Surface a brief' action...");
    try {
      await surfaceBriefAction(latestSource.id);
    } catch (err: any) {
      // Server Actions throw NEXT_REDIRECT in scripts
      if (err.message === "NEXT_REDIRECT") {
        console.log("✅ Action triggered redirect successfully.");
      } else {
        throw err;
      }
    }

    // 3. Poll for completion
    console.log("⏳ Waiting for introspection and insight generation...");
    let completedDib = null;
    for (let i = 0; i < 10; i++) {
      const [dib] = await db
        .select()
        .from(dibs)
        .where(eq(dibs.sourceId, latestSource.id))
        .orderBy(desc(dibs.generatedAt))
        .limit(1);

      if (dib && dib.status === "completed") {
        completedDib = dib;
        break;
      }
      
      if (dib && dib.status === "error") {
        console.error("❌ Dib generation failed:", dib.errorLog);
        process.exit(1);
      }

      await new Promise(r => setTimeout(r, 2000));
      console.log(`   Scanning depths... (${i+1}/10)`);
    }

    if (!completedDib) {
      console.error("❌ Dib generation timed out.");
      process.exit(1);
    }

    // 4. Verify Content
    console.log("\n✨ DIB GENERATION SUCCESSFUL!");
    console.log("--------------------------------------------------");
    console.log(`Title:   ${completedDib.title}`);
    console.log(`Summary: ${completedDib.summary}`);
    
    const content = completedDib.contentJson as any;
    console.log(`Tables:  ${content.stats.tableCount}`);
    
    console.log("\n🔍 ACTIONABLE INSIGHTS SURFACED:");
    content.insights.forEach((insight: any, idx: number) => {
      console.log(`${idx + 1}. [${insight.severity.toUpperCase()}] ${insight.title}`);
      console.log(`   Description: ${insight.description}`);
      console.log(`   Recommendation: ${insight.recommendation}`);
    });

    console.log("\n📊 VISUALIZATION DATA CAPTURED:");
    console.log(`Distribution points: ${content.charts.sizeDistribution.length}`);
    console.log(`Row count points:    ${content.charts.rowCounts.length}`);
    console.log("--------------------------------------------------");

    process.exit(0);

  } catch (error) {
    console.error("💥 Critical verification failure:", error);
    process.exit(1);
  }
}

verifyDibGeneration();
