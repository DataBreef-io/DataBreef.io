/**
 * apps/app/src/lib/db/schema.ts
 * Database schema for DataBreef application data.
 */

import { pgTable, text, timestamp, uuid, integer, jsonb, boolean, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// AUTH.JS TABLES (User identity, OAuth, sessions)
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  emailVerified: timestamp("email_verified"),
  password: text("password"), // argon2id hash (email+password auth)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_email").on(table.email),
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "oauth" | "email"
  provider: varchar("provider", { length: 50 }).notNull(), // "google" | "github"
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_accounts_user_id").on(table.userId),
  index("idx_accounts_provider").on(table.provider, table.providerAccountId),
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sessions_user_id").on(table.userId),
  index("idx_sessions_token").on(table.sessionToken),
]);

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => [
  index("idx_verification_tokens_identifier_token").on(table.identifier, table.token),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_email_vt_token").on(table.token),
  index("idx_email_vt_user_id").on(table.userId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_prt_token").on(table.token),
  index("idx_prt_user_id").on(table.userId),
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(), // "signin", "oauth_connected", "reef_anchored", etc.
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_user_id").on(table.userId),
  index("idx_audit_source_id").on(table.sourceId),
  index("idx_audit_created_at").on(table.createdAt),
]);

// ============================================================================
// RELATIONS (for Drizzle querying)
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  sources: many(sources),
  dibs: many(dibs),
  auditEvents: many(auditEvents),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ============================================================================
// APPLICATION TABLES
// ============================================================================

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  dbType: text("db_type", { enum: ["postgres", "mysql", "mssql", "oracle", "snowflake"] }).notNull(),
  connectionStringEncrypted: text("connection_string_encrypted").notNull(),
  encryptionKeyId: varchar("encryption_key_id", { length: 255 }),
  host: text("host"),
  type: text("type"),
  databaseType: text("database_type", {
    enum: ["CRM", "Analytics", "Transactional", "UserManagement", "Custom"],
  }),
  deepDive: boolean("deep_dive").default(false),
  selectedSchemas: jsonb("selected_schemas").$type<string[]>(),
  lastConnectedAt: timestamp("last_connected_at"),
  status: text("status").default("pending"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_sources_user_id").on(table.userId),
]);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  industry: text("industry"),
  role: text("role"),
  goal: text("goal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dibs = pgTable("dibs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  contentJson: jsonb("content_json").notNull(),
  status: text("status", { enum: ["pending", "completed", "error"] }).default("pending"),
  errorLog: text("error_log"),
  synthesisStatus: text("synthesis_status", { enum: ["pending", "success", "failed"] }).default("pending"),
  synthesisError: text("synthesis_error"),
  synthesisRetryCount: integer("synthesis_retry_count").default(0),
  isArchived: boolean("is_archived").default(false),
  isPublic: boolean("is_public").default(false),
  publicSlug: varchar("public_slug", { length: 255 }),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_dibs_source_id").on(table.sourceId),
  index("idx_dibs_user_id").on(table.userId),
  index("idx_dibs_public_slug").on(table.publicSlug),
]);

export const sourceAuditLogs = pgTable("source_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
  dibId: uuid("dib_id").references(() => dibs.id, { onDelete: "cascade" }),
  logs: jsonb("logs").notNull(), // Array of IntrospectionLog objects
  created_at: timestamp("created_at").defaultNow(),
});

// Relations for sources and dibs
export const sourcesRelations = relations(sources, ({ one, many }) => ({
  user: one(users, { fields: [sources.userId], references: [users.id] }),
  dibs: many(dibs),
  auditLogs: many(sourceAuditLogs),
}));

export const dibsRelations = relations(dibs, ({ one }) => ({
  source: one(sources, { fields: [dibs.sourceId], references: [sources.id] }),
  user: one(users, { fields: [dibs.userId], references: [users.id] }),
}));

export const sourceAuditLogsRelations = relations(sourceAuditLogs, ({ one }) => ({
  source: one(sources, { fields: [sourceAuditLogs.sourceId], references: [sources.id] }),
  dib: one(dibs, { fields: [sourceAuditLogs.dibId], references: [dibs.id] }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  user: one(users, { fields: [auditEvents.userId], references: [users.id] }),
  source: one(sources, { fields: [auditEvents.sourceId], references: [sources.id] }),
}));
