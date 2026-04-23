/**
 * Server actions for sign-up flow.
 * Runs on server-side only (Node.js modules are safe here).
 */

"use server";

import { hashPassword, checkHIBP } from "@/lib/auth/password-security-server";

export async function hashPasswordAction(plaintext: string): Promise<string> {
  return hashPassword(plaintext);
}

export async function checkHIBPAction(plaintext: string): Promise<{
  isPwned: boolean;
  count: number;
}> {
  return checkHIBP(plaintext);
}
