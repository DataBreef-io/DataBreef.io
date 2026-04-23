import { db } from "../lib/db";
import { dibs } from "../lib/db/schema";
import { desc, eq } from "drizzle-orm";

async function checkLastCompletedDib() {
  const [lastDib] = await db
    .select()
    .from(dibs)
    .where(eq(dibs.status, "completed"))
    .orderBy(desc(dibs.generatedAt))
    .limit(1);

  if (!lastDib) {
    console.log("No completed Dibs found.");
    return;
  }

  console.log("--- LAST COMPLETED DIB CONTENT ---");
  console.log("Title:", lastDib.title);
  
  const content = lastDib.contentJson as any;
  console.log("Row Counts:", JSON.stringify(content.charts?.rowCounts, null, 2));
  console.log("Insights (with Entities):", JSON.stringify(content.insights, null, 2));
}

checkLastCompletedDib();
