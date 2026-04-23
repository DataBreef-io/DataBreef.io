/**
 * apps/app/src/scripts/heal-source-hosts.ts
 * One-off script to populate the 'host' column for existing sources.
 */

import { db } from "../lib/db-client";
import { sources } from "../lib/tables/schema";
import { decrypt } from "../lib/encryption";
import { eq } from "drizzle-orm";

async function heal() {
  console.log("🌊 Starting Source Host Healing...");
  
  const allSources = await db.select().from(sources);
  console.log(`🔍 Found ${allSources.length} sources to check.`);

  let healedCount = 0;
  let skippedCount = 0;

  for (const s of allSources) {
    if (s.host) {
      console.log(`- Skipping ${s.name} (already has host: ${s.host})`);
      skippedCount++;
      continue;
    }

    try {
      const decrypted = decrypt(s.connectionStringEncrypted);
      const host = new URL(decrypted).hostname;
      
      await db.update(sources)
        .set({ host })
        .where(eq(sources.id, s.id));
        
      console.log(`+ Healed ${s.name}: ${host}`);
      healedCount++;
    } catch (err) {
      console.error(`! Failed to heal ${s.name}:`, err);
    }
  }

  console.log("\n✅ Healing Complete.");
  console.log(`  - Healed: ${healedCount}`);
  console.log(`  - Skipped: ${skippedCount}`);
  process.exit(0);
}

heal().catch(err => {
  console.error("💥 Fatal Healing Error:", err);
  process.exit(1);
});
