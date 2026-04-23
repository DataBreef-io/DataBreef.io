/**
 * lib/auth.ts
 * Auth.js v5 configuration for DataBreef.
 *
 * Providers:
 *   - Email + Password (credentials provider with argon2id)
 *   - Google OAuth
 *   - GitHub OAuth
 *
 * Session strategy: JWT (simplified for v5 compatibility)
 * Adapter: Custom postgres adapter (for user + account storage)
 *
 * See CLAUDE.md § Tech Stack for architecture notes.
 */

import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getAdapter } from "./adapters";
import { verifyPassword } from "./auth/password-security-server";
import { db } from "@/lib/db-client";
import { users, auditEvents } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: getAdapter(),
  session: { strategy: "jwt" }, // JWT for simplicity with credentials provider
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/onboarding",
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      // Protected routes
      const protectedRoutes = ["/dashboard", "/settings", "/onboarding", "/(app)"];
      const pathname = request.nextUrl.pathname;
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

      // If accessing protected route, user must be signed in
      if (isProtected) {
        return !!auth;
      }

      // All other routes are allowed
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Log sign-in event for audit trail
      if (user?.id) {
        try {
          await db.insert(auditEvents).values({
            userId: user.id,
            action: account?.provider ? `signin_${account.provider}` : "signin_email",
            details: {
              provider: account?.provider || "credentials",
            },
          });
        } catch (error) {
          console.error("Failed to log sign-in event:", error);
        }
      }
      return true;
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, String(credentials.email)),
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordValid = await verifyPassword(
          String(credentials.password),
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
