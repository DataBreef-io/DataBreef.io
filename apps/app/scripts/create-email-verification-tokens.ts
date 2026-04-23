/**
 * Run: npx tsx scripts/create-email-verification-tokens.ts
 * Creates the email_verification_tokens table.
 */
import postgres from "postgres";
import * as dotenv from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
try {
  const envContent = dotenv.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {}

const url = process.env.DATABASE_URL!;
const sql = postgres(url, { ssl: "require", max: 1 });

async function main() {
  console.log("Creating email_verification_tokens table...");
  await sql`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token VARCHAR(255) UNIQUE NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_vt_token ON email_verification_tokens(token)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_vt_user_id ON email_verification_tokens(user_id)
  `;
  console.log("Done.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
