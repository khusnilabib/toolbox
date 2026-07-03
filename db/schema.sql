-- =============================================================================
-- Supabase Production Schema — Phase 2 Sprint 6
-- Browser-First Productivity Ecosystem
-- =============================================================================
-- This SQL file is the source of truth for the Supabase production schema.
-- It creates all tables, indexes, RLS policies, triggers, and storage buckets.
-- Run via: supabase db push (or psql against the Supabase Postgres instance).
-- =============================================================================

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Profiles ──────────────────────────────────────────────────────────────
-- Linked 1:1 to auth.users via the user_id column. Created automatically
-- by the handle_new_user trigger whenever a new auth user signs up.
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_email_idx on public.profiles(email);

-- ─── Tool History ──────────────────────────────────────────────────────────
-- Each row represents one tool execution by a user.
create table if not exists public.tool_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  tool_category text not null,
  input_summary text not null,         -- truncated/scrubbed input metadata
  output_summary text not null,        -- truncated/scrubbed output metadata
  status text not null check (status in ('success', 'failed', 'cancelled')),
  duration_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tool_history_user_id_idx on public.tool_history(user_id);
create index if not exists tool_history_user_created_idx on public.tool_history(user_id, created_at desc);
create index if not exists tool_history_slug_idx on public.tool_history(tool_slug);

-- ─── Favorites ─────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  tool_category text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_user_slug_idx on public.favorites(user_id, tool_slug);

-- ─── Recently Viewed ───────────────────────────────────────────────────────
create table if not exists public.recently_viewed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  tool_category text not null,
  viewed_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create index if not exists recently_viewed_user_idx on public.recently_viewed(user_id, viewed_at desc);

-- ─── Search History ────────────────────────────────────────────────────────
create table if not exists public.search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  result_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists search_history_user_idx on public.search_history(user_id, created_at desc);

-- ─── Downloads ─────────────────────────────────────────────────────────────
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_path text,                   -- set when stored in Supabase Storage
  created_at timestamptz not null default now()
);

create index if not exists downloads_user_idx on public.downloads(user_id, created_at desc);
create index if not exists downloads_slug_idx on public.downloads(tool_slug);

-- ─── Audit Logs ────────────────────────────────────────────────────────────
-- Append-only. RLS allows users to read their own audit entries; only
-- service-role can write (via server actions / API routes).
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_idx on public.audit_logs(user_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs(action, created_at desc);

-- ─── Sessions (device tracking) ────────────────────────────────────────────
create table if not exists public.user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token_hash text not null,
  device_name text,
  device_type text,
  ip_address inet,
  user_agent text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists user_sessions_user_idx on public.user_sessions(user_id, last_active_at desc);

-- ─── Feature Flags (server-side overrides) ─────────────────────────────────
create table if not exists public.feature_flags (
  key text primary key,
  description text not null,
  enabled boolean not null default false,
  rollout_percentage integer not null default 0 check (rollout_percentage between 0 and 100),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- ─── Tool Metadata (admin-managed) ─────────────────────────────────────────
create table if not exists public.tool_metadata (
  slug text primary key,
  category text not null,
  display_name text not null,
  description text,
  lifecycle text not null default 'stable' check (lifecycle in ('stable', 'beta', 'development', 'deprecated')),
  is_premium boolean not null default false,
  requires_auth boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
-- Policy: users can CRUD their own rows in user-scoped tables.
-- Service role bypasses RLS for admin operations.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.tool_history enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.search_history enable row level security;
alter table public.downloads enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_sessions enable row level security;
alter table public.feature_flags enable row level security;
alter table public.tool_metadata enable row level security;

-- ─── Profiles policies ────────────────────────────────────────────────────
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

-- ─── Tool history policies ─────────────────────────────────────────────────
drop policy if exists "tool_history_select_own" on public.tool_history;
create policy "tool_history_select_own" on public.tool_history
  for select using (auth.uid() = user_id);

drop policy if exists "tool_history_insert_own" on public.tool_history;
create policy "tool_history_insert_own" on public.tool_history
  for insert with check (auth.uid() = user_id);

drop policy if exists "tool_history_delete_own" on public.tool_history;
create policy "tool_history_delete_own" on public.tool_history
  for delete using (auth.uid() = user_id);

-- ─── Favorites policies ────────────────────────────────────────────────────
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ─── Recently viewed policies ──────────────────────────────────────────────
drop policy if exists "recently_viewed_select_own" on public.recently_viewed;
create policy "recently_viewed_select_own" on public.recently_viewed
  for select using (auth.uid() = user_id);

drop policy if exists "recently_viewed_upsert_own" on public.recently_viewed;
create policy "recently_viewed_upsert_own" on public.recently_viewed
  for insert with check (auth.uid() = user_id);

drop policy if exists "recently_viewed_update_own" on public.recently_viewed;
create policy "recently_viewed_update_own" on public.recently_viewed
  for update using (auth.uid() = user_id);

drop policy if exists "recently_viewed_delete_own" on public.recently_viewed;
create policy "recently_viewed_delete_own" on public.recently_viewed
  for delete using (auth.uid() = user_id);

-- ─── Search history policies ───────────────────────────────────────────────
drop policy if exists "search_history_select_own" on public.search_history;
create policy "search_history_select_own" on public.search_history
  for select using (auth.uid() = user_id);

drop policy if exists "search_history_insert_own" on public.search_history;
create policy "search_history_insert_own" on public.search_history
  for insert with check (auth.uid() = user_id);

drop policy if exists "search_history_delete_own" on public.search_history;
create policy "search_history_delete_own" on public.search_history
  for delete using (auth.uid() = user_id);

-- ─── Downloads policies ────────────────────────────────────────────────────
drop policy if exists "downloads_select_own" on public.downloads;
create policy "downloads_select_own" on public.downloads
  for select using (auth.uid() = user_id);

drop policy if exists "downloads_insert_own" on public.downloads;
create policy "downloads_insert_own" on public.downloads
  for insert with check (auth.uid() = user_id);

drop policy if exists "downloads_delete_own" on public.downloads;
create policy "downloads_delete_own" on public.downloads
  for delete using (auth.uid() = user_id);

-- ─── Audit logs policies ───────────────────────────────────────────────────
drop policy if exists "audit_logs_select_own" on public.audit_logs;
create policy "audit_logs_select_own" on public.audit_logs
  for select using (auth.uid() = user_id or auth.uid() = user_id);

-- Inserts are performed by the service role only (RLS blocks anon/auth users).

-- ─── User sessions policies ────────────────────────────────────────────────
drop policy if exists "user_sessions_select_own" on public.user_sessions;
create policy "user_sessions_select_own" on public.user_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "user_sessions_delete_own" on public.user_sessions;
create policy "user_sessions_delete_own" on public.user_sessions
  for delete using (auth.uid() = user_id);

-- ─── Feature flags policies (publicly readable) ────────────────────────────
drop policy if exists "feature_flags_select_all" on public.feature_flags;
create policy "feature_flags_select_all" on public.feature_flags
  for select using (true);

-- ─── Tool metadata policies (publicly readable) ────────────────────────────
drop policy if exists "tool_metadata_select_all" on public.tool_metadata;
create policy "tool_metadata_select_all" on public.tool_metadata
  for select using (true);

-- =============================================================================
-- Triggers
-- =============================================================================

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at columns.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists feature_flags_touch_updated_at on public.feature_flags;
create trigger feature_flags_touch_updated_at
  before update on public.feature_flags
  for each row execute function public.touch_updated_at();

drop trigger if exists tool_metadata_touch_updated_at on public.tool_metadata;
create trigger tool_metadata_touch_updated_at
  before update on public.tool_metadata
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Storage Buckets
-- =============================================================================
-- Public-read bucket for tool output downloads (signed URLs for private files).
-- Private bucket for user uploads (tool inputs).
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('tool-outputs', 'tool-outputs', true),
  ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

-- Storage policies: tool-outputs is public-read; user-uploads is per-user.
drop policy if exists "tool_outputs_public_read" on storage.objects;
create policy "tool_outputs_public_read" on storage.objects
  for select using (bucket_id = 'tool-outputs');

drop policy if exists "user_uploads_select_own" on storage.objects;
create policy "user_uploads_select_own" on storage.objects
  for select using (
    bucket_id = 'user-uploads' and auth.uid() = (storage.foldername(name))[1]::uuid
  );

drop policy if exists "user_uploads_insert_own" on storage.objects;
create policy "user_uploads_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'user-uploads' and auth.uid() = (storage.foldername(name))[1]::uuid
  );

drop policy if exists "user_uploads_delete_own" on storage.objects;
create policy "user_uploads_delete_own" on storage.objects
  for delete using (
    bucket_id = 'user-uploads' and auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- ─── Newsletter Subscribers ────────────────────────────────────────────────
-- Sprint 13 Phase 7 — Newsletter platform
create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  country text,
  source text,
  tool text,
  verified boolean not null default false,
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);
create index if not exists newsletter_created_idx on public.newsletter_subscribers(created_at desc);

-- Newsletter is public (anyone can subscribe), but only service role can read
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);
drop policy if exists "newsletter_public_unsubscribe" on public.newsletter_subscribers;
create policy "newsletter_public_unsubscribe" on public.newsletter_subscribers
  for update using (true) with check (true);

-- ─── Feedback ──────────────────────────────────────────────────────────────
-- Sprint 13 Phase 8 — Feedback persistence
create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  tool_slug text not null,
  rating text not null check (rating in ('helpful', 'not-helpful')),
  comment text,
  browser text,
  country text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_tool_idx on public.feedback(tool_slug);
create index if not exists feedback_created_idx on public.feedback(created_at desc);

-- Feedback: anyone can submit, only service role reads
alter table public.feedback enable row level security;
drop policy if exists "feedback_public_insert" on public.feedback;
create policy "feedback_public_insert" on public.feedback
  for insert with check (true);
drop policy if exists "feedback_user_select_own" on public.feedback;
create policy "feedback_user_select_own" on public.feedback
  for select using (auth.uid() = user_id);

-- ─── Premium Waitlist ──────────────────────────────────────────────────────
-- Sprint 13 Phase 9 — Waitlist for future premium tier
create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  company text,
  requested_feature text,
  tool text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_email_idx on public.waitlist(email);
create index if not exists waitlist_created_idx on public.waitlist(created_at desc);

-- Waitlist: anyone can join, only service role reads
alter table public.waitlist enable row level security;
drop policy if exists "waitlist_public_insert" on public.waitlist;
create policy "waitlist_public_insert" on public.waitlist
  for insert with check (true);

-- ─── User Preferences ──────────────────────────────────────────────────────
-- Sprint 13 Phase 6 — Persisted user preferences
create table if not exists public.preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme text default 'system',
  language text default 'en',
  default_category text,
  keyboard_shortcuts jsonb not null default '{}'::jsonb,
  search_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists preferences_user_idx on public.preferences(user_id);

-- Preferences: users can CRUD their own
alter table public.preferences enable row level security;
drop policy if exists "preferences_select_own" on public.preferences;
create policy "preferences_select_own" on public.preferences
  for select using (auth.uid() = user_id);
drop policy if exists "preferences_insert_own" on public.preferences;
create policy "preferences_insert_own" on public.preferences
  for insert with check (auth.uid() = user_id);
drop policy if exists "preferences_update_own" on public.preferences;
create policy "preferences_update_own" on public.preferences
  for update using (auth.uid() = user_id);

-- ─── API Keys (future) ────────────────────────────────────────────────────
create table if not exists public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key_hash text not null unique,
  name text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists api_keys_user_idx on public.api_keys(user_id);
create index if not exists api_keys_hash_idx on public.api_keys(key_hash);

alter table public.api_keys enable row level security;
drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own" on public.api_keys
  for select using (auth.uid() = user_id);
drop policy if exists "api_keys_delete_own" on public.api_keys;
create policy "api_keys_delete_own" on public.api_keys
  for delete using (auth.uid() = user_id);
