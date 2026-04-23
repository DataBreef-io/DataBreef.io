import crypto from "crypto";
import { db } from "@/lib/db-client";
import { emailVerificationTokens, users } from "@/lib/tables/schema";
import { eq, and, gt } from "drizzle-orm";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export async function createVerificationToken(userId: string): Promise<string> {
  const existing = await db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.userId, userId),
    columns: { createdAt: true },
  });

  if (existing) {
    const ageMs = Date.now() - existing.createdAt.getTime();
    if (ageMs < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - ageMs) / 1000);
      throw new Error(`RATE_LIMITED:${waitSec}`);
    }
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.insert(emailVerificationTokens).values({ token, userId, expiresAt });

  return token;
}

export async function verifyEmailToken(token: string): Promise<{ userId: string } | null> {
  const record = await db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(emailVerificationTokens.token, token),
      gt(emailVerificationTokens.expiresAt, new Date())
    ),
  });

  if (!record) return null;

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, record.userId));

  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));

  return { userId: record.userId };
}
