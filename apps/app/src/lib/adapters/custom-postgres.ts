/**
 * lib/adapters/custom-postgres.ts
 * Custom Auth.js adapter using postgres.js for database access.
 *
 * This uses postgres.js directly to access the Auth.js tables in the public schema,
 * avoiding PostgREST schema exposure limitations.
 */

import type { Adapter } from "next-auth/adapters";
import { db } from "@/lib/db-client";
import { users, accounts, sessions, verificationTokens } from "@/lib/tables/schema";
import { eq, and } from "drizzle-orm";

export function createCustomPostgresAdapter(): Adapter {
  return {
    async createUser(data) {
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
        })
        .returning();
      return user;
    },

    async getUser(id) {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    },

    async getUserByEmail(email) {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || null;
    },

    async getUserByAccount(data) {
      const [account] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, data.provider),
            eq(accounts.providerAccountId, data.providerAccountId)
          )
        );

      if (!account) return null;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, account.userId));

      return user || null;
    },

    async updateUser(data) {
      const [updatedUser] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, data.id!))
        .returning();
      return updatedUser;
    },

    async deleteUser(id) {
      await db.delete(users).where(eq(users.id, id));
    },

    async linkAccount(data) {
      const [account] = await db
        .insert(accounts)
        .values({
          userId: data.userId as any,
          type: data.type as any,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_at,
        })
        .returning();
      return account as any;
    },

    async unlinkAccount(data) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, data.userId as any),
            eq(accounts.provider, data.provider),
            eq(accounts.providerAccountId, data.providerAccountId)
          )
        );
    },

    async createSession(data) {
      const [session] = await db
        .insert(sessions)
        .values({
          userId: data.userId as any,
          sessionToken: data.sessionToken,
          expires: data.expires,
        })
        .returning();
      return session as any;
    },

    async getSessionAndUser(sessionToken) {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken));

      if (!session) {
        return null;
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId));

      if (!user) {
        return null;
      }

      return { session: session as any, user: user as any };
    },

    async updateSession(data) {
      const [session] = await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning();
      return session as any;
    },

    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(data) {
      const [token] = await db
        .insert(verificationTokens)
        .values(data)
        .returning();
      return token as any;
    },

    async useVerificationToken(data) {
      const [token] = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, data.identifier),
            eq(verificationTokens.token, data.token)
          )
        )
        .returning();
      return token || null;
    },
  };
}
