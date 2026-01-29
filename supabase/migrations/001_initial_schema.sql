-- Users synced from Clerk
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  github_username text,
  email text,
  plan text default 'free' check (plan in ('free', 'developer', 'team')),
  scan_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cached scan results (avoid hitting GitHub API every page load)
create table public.scan_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  owner text not null,
  repos jsonb not null default '[]',
  total_count int not null default 0,
  scan_duration_ms int,
  scanned_at timestamptz default now()
);

-- Individual repo analysis cache
create table public.repo_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  owner text not null,
  repo text not null,
  analysis jsonb not null,
  analyzed_at timestamptz default now(),
  unique(user_id, owner, repo)
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.scan_results enable row level security;
alter table public.repo_analyses enable row level security;

-- RLS policies: users can only see their own data
create policy "users_own_data" on public.users for all using (clerk_user_id = current_setting('app.clerk_user_id', true));
create policy "scans_own_data" on public.scan_results for all using (user_id = (select id from public.users where clerk_user_id = current_setting('app.clerk_user_id', true)));
create policy "analyses_own_data" on public.repo_analyses for all using (user_id = (select id from public.users where clerk_user_id = current_setting('app.clerk_user_id', true)));

-- Indexes
create index idx_scan_results_user_id on public.scan_results(user_id);
create index idx_scan_results_scanned_at on public.scan_results(scanned_at desc);
create index idx_repo_analyses_user_repo on public.repo_analyses(user_id, owner, repo);
