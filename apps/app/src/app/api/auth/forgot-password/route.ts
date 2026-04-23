/**
 * POST /api/auth/forgot-password
 * Generate a password reset token and send a reset email.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-client";
import { users } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
      columns: { id: true, email: true, password: true },
    });

    // Only process password-based accounts; always return success to prevent enumeration
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    try {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, token);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("RATE_LIMITED:")) {
        const waitSec = parseInt(err.message.split(":")[1], 10);
        return NextResponse.json(
          { error: "Too many requests. Please wait before requesting another reset.", waitSeconds: waitSec },
          { status: 429 }
        );
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
