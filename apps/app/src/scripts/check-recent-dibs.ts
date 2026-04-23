import { db } from "../lib/db-client";
import { dibs } from "../lib/tables/schema";
import { desc } from "drizzle-orm";

async function checkRecentDibs() {
  const recentDibs = await db
    .select()
    .from(dibs)
    .orderBy(desc(dibs.generatedAt))
    .limit(3);

  console.log("--- RECENT DIBS ---");
  recentDibs.forEach(d => {
    console.log(`[${d.id}] Status: ${d.status}, Title: ${d.title}`);
    if (d.status === "completed") {
      console.log("Stats:", JSON.stringify((d.contentJson as any).stats, null, 2));
    } else {
      console.log("Error Log:", d.errorLog);
    }
    console.log("------------------");
  });
}

checkRecentDibs();
