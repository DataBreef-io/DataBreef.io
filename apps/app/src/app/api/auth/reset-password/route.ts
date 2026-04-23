/**
 * POST /api/auth/reset-password?token=xxx
 * Validate reset token and update the user's password.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-client";
import { users } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { validatePasswordResetToken, consumePasswordResetToken } from "@/lib/auth/password-reset";

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const result = await validatePasswordResetToken(token);
    if (!result) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, result.userId));

    await consumePasswordResetToken(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
