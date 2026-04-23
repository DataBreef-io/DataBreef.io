/**
 * POST /api/auth/resend-verification
 * Resends the verification email. Rate-limited to 1 per 60 seconds.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createVerificationToken } from "@/lib/auth/verification";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(_req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const token = await createVerificationToken(session.user.id);
    await sendVerificationEmail(session.user.email, token);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.startsWith("RATE_LIMITED:")) {
      const wait = msg.split(":")[1];
      return NextResponse.json(
        { error: "Too many requests", waitSeconds: Number(wait) },
        { status: 429 }
      );
    }
    console.error("Resend verification error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
