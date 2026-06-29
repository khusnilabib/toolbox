// db/schema.ts — Drizzle ORM schema for Supabase Production (Phase 2 Sprint 6).
// This schema mirrors db/schema.sql. Use Drizzle for type-safe queries in
// server actions and API routes.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  bigint,
  inet,
  primaryKey,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Profiles ──────────────────────────────────────────────────────────────
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    preferences: jsonb('preferences').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('profiles_user_id_idx').on(t.userId),
    index('profiles_email_idx').on(t.email),
  ],
);

// ─── Tool History ──────────────────────────────────────────────────────────
export const toolHistory = pgTable(
  'tool_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    toolSlug: text('tool_slug').notNull(),
    toolCategory: text('tool_category').notNull(),
    inputSummary: text('input_summary').notNull(),
    outputSummary: text('output_summary').notNull(),
    status: text('status').notNull(),
    durationMs: integer('duration_ms').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tool_history_user_id_idx').on(t.userId),
    index('tool_history_user_created_idx').on(t.userId, t.createdAt),
    index('tool_history_slug_idx').on(t.toolSlug),
    check('tool_history_status_check', sql`${t.status} in ('success', 'failed', 'cancelled')`),
  ],
);

// ─── Favorites ─────────────────────────────────────────────────────────────
export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    toolSlug: text('tool_slug').notNull(),
    toolCategory: text('tool_category').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('favorites_user_slug_idx').on(t.userId, t.toolSlug),
    index('favorites_user_id_idx').on(t.userId),
  ],
);

// ─── Recently Viewed ───────────────────────────────────────────────────────
export const recentlyViewed = pgTable(
  'recently_viewed',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    toolSlug: text('tool_slug').notNull(),
    toolCategory: text('tool_category').notNull(),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('recently_viewed_user_slug_idx').on(t.userId, t.toolSlug),
    index('recently_viewed_user_idx').on(t.userId, t.viewedAt),
  ],
);

// ─── Search History ────────────────────────────────────────────────────────
export const searchHistory = pgTable(
  'search_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    query: text('query').notNull(),
    resultCount: integer('result_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('search_history_user_idx').on(t.userId, t.createdAt)],
);

// ─── Downloads ─────────────────────────────────────────────────────────────
export const downloads = pgTable(
  'downloads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    toolSlug: text('tool_slug').notNull(),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull().default(0),
    storagePath: text('storage_path'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('downloads_user_idx').on(t.userId, t.createdAt),
    index('downloads_slug_idx').on(t.toolSlug),
  ],
);

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: text('resource_id'),
    metadata: jsonb('metadata').notNull().default({}),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_user_idx').on(t.userId, t.createdAt),
    index('audit_logs_action_idx').on(t.action, t.createdAt),
  ],
);

// ─── User Sessions ─────────────────────────────────────────────────────────
export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    sessionTokenHash: text('session_token_hash').notNull(),
    deviceName: text('device_name'),
    deviceType: text('device_type'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [index('user_sessions_user_idx').on(t.userId, t.lastActiveAt)],
);

// ─── Feature Flags ─────────────────────────────────────────────────────────
export const featureFlags = pgTable(
  'feature_flags',
  {
    key: text('key').primaryKey(),
    description: text('description').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    rolloutPercentage: integer('rollout_percentage').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid('updated_by'),
  },
);

// ─── Tool Metadata ─────────────────────────────────────────────────────────
export const toolMetadata = pgTable(
  'tool_metadata',
  {
    slug: text('slug').primaryKey(),
    category: text('category').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    lifecycle: text('lifecycle').notNull().default('stable'),
    isPremium: boolean('is_premium').notNull().default(false),
    requiresAuth: boolean('requires_auth').notNull().default(false),
    config: jsonb('config').notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// ─── Type Inference ────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ToolHistoryEntry = typeof toolHistory.$inferSelect;
export type NewToolHistoryEntry = typeof toolHistory.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type RecentlyViewedEntry = typeof recentlyViewed.$inferSelect;
export type SearchHistoryEntry = typeof searchHistory.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type FeatureFlagRow = typeof featureFlags.$inferSelect;
export type ToolMetadataRow = typeof toolMetadata.$inferSelect;
