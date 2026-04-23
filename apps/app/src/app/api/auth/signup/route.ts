/**
 * POST /api/auth/signup
 * Create a new user with email + password (already hashed on client).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-client";
import { users } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { createVerificationToken } from "@/lib/auth/verification";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const newUser = await db
      .insert(users)
      .values({
        email,
        password,
        emailVerified: null,
      })
      .returning();

    if (!newUser || newUser.length === 0) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Send verification email (non-fatal)
    try {
      const token = await createVerificationToken(newUser[0].id);
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return NextResponse.json(
      { user: { id: newUser[0].id, email: newUser[0].email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
