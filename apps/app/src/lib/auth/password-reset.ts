import crypto from "crypto";
import { db } from "@/lib/db-client";
import { passwordResetTokens } from "@/lib/tables/schema";
import { eq, and, gt } from "drizzle-orm";

const TOKEN_TTL_MS = 15 * 60 * 1000;   // 15 minutes
const RATE_LIMIT_MS = 5 * 60 * 1000;   // 5 minutes

export async function createPasswordResetToken(userId: string): Promise<string> {
  const existing = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.userId, userId),
    columns: { createdAt: true },
  });

  if (existing) {
    const ageMs = Date.now() - existing.createdAt.getTime();
    if (ageMs < RATE_LIMIT_MS) {
      const waitSec = Math.ceil((RATE_LIMIT_MS - ageMs) / 1000);
      throw new Error(`RATE_LIMITED:${waitSec}`);
    }
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.insert(passwordResetTokens).values({ token, userId, expiresAt });

  return token;
}

export async function validatePasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const record = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.token, token),
      gt(passwordResetTokens.expiresAt, new Date())
    ),
  });

  if (!record) return null;
  return { userId: record.userId };
}

export async function consumePasswordResetToken(token: string): Promise<void> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}
