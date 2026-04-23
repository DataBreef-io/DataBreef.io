/**
 * POST /api/auth/verify-email
 * Validates a token and marks the user as email-verified.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/verification";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const result = await verifyEmailToken(token);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
