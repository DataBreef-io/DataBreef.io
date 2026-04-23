/**
 * Server-only password utilities (uses Node.js modules).
 * Import only in server components and server actions.
 */

import { hash, verify } from "argon2";

/**
 * Hash a plaintext password with argon2id.
 * Server-side only.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return hash(plaintext, {
    type: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify plaintext against argon2id hash.
 * Server-side only.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await verify(hash, plaintext);
  } catch {
    return false;
  }
}

/**
 * Check if password is in HIBP (Have I Been Pwned) database.
 * Uses range API to avoid sending full hash.
 * Server-side only.
 */
export async function checkHIBP(plaintext: string): Promise<{
  isPwned: boolean;
  count: number;
}> {
  try {
    const crypto = await import("crypto");
    const sha1 = crypto.createHash("sha1").update(plaintext).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      console.warn("HIBP API unavailable");
      return { isPwned: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split("\r\n");
    for (const line of lines) {
      const [hash, count] = line.split(":");
      if (hash === suffix) {
        return { isPwned: true, count: parseInt(count, 10) };
      }
    }

    return { isPwned: false, count: 0 };
  } catch (error) {
    console.error("HIBP check failed:", error);
    return { isPwned: false, count: 0 };
  }
}
