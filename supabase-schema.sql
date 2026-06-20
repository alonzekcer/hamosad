-- ========================
-- חמוסד - סכמת בסיס הנתונים
-- ========================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Groups table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age_range text,
  color text not null default '#16a34a',
  created_at timestamptz default now()
);

-- Profiles table (custom auth via client_id)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  client_id text unique not null,
  full_name text not null,
  role text not null default 'youth' check (role in ('guide', 'youth')),
  approved boolean not null default false,
  group_id uuid references groups(id) on delete set null,
  grade text check (grade in ('ז', 'ח', 'ט', 'י', 'יא', 'יב')),
  created_at timestamptz default now()
);

-- Migration: run this if the table already exists
-- alter table profiles add column if not exists grade text check (grade in ('ז', 'ח', 'ט', 'י', 'יא', 'יב'));

-- Activities table
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  group_ids uuid[] not null default '{}',
  color text not null default '#16a34a',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Attendance table
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz default now(),
  unique(profile_id, activity_id)
);

-- Public links table
create table if not exists public_links (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  created_by uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- ========================
-- Row Level Security
-- ========================
-- For this app we use permissive policies (internal tool).
-- Tighten these for production use.

alter table groups enable row level security;
alter table profiles enable row level security;
alter table activities enable row level security;
alter table attendance enable row level security;
alter table public_links enable row level security;

-- Allow all operations with anon key (internal tool)
create policy "allow_all_groups" on groups for all using (true) with check (true);
create policy "allow_all_profiles" on profiles for all using (true) with check (true);
create policy "allow_all_activities" on activities for all using (true) with check (true);
create policy "allow_all_attendance" on attendance for all using (true) with check (true);
create policy "allow_all_public_links" on public_links for all using (true) with check (true);

-- Presence table (guide roll call — separate from self-reported RSVP)
create table if not exists presence (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  present boolean not null,
  marked_by uuid references profiles(id) on delete set null,
  marked_at timestamptz default now(),
  unique(activity_id, profile_id)
);

alter table presence enable row level security;
create policy "allow_all_presence" on presence for all using (true) with check (true);

-- Migration: run this if tables already exist
-- create table if not exists presence (id uuid primary key default gen_random_uuid(), activity_id uuid not null references activities(id) on delete cascade, profile_id uuid not null references profiles(id) on delete cascade, present boolean not null, marked_by uuid references profiles(id) on delete set null, marked_at timestamptz default now(), unique(activity_id, profile_id));
-- alter table presence enable row level security;
-- create policy "allow_all_presence" on presence for all using (true) with check (true);

-- ========================
-- Indexes
-- ========================
create index if not exists idx_activities_start_time on activities(start_time);
create index if not exists idx_attendance_profile on attendance(profile_id);
create index if not exists idx_attendance_activity on attendance(activity_id);
create index if not exists idx_profiles_client_id on profiles(client_id);
create index if not exists idx_public_links_token on public_links(token);
create index if not exists idx_presence_activity on presence(activity_id);
create index if not exists idx_presence_profile on presence(profile_id);
