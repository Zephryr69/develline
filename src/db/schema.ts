/**
 * Schéma PostgreSQL de DEVEL line.
 * Exécuté de façon idempotente au premier accès à la base (CREATE ... IF NOT EXISTS).
 */
export const SCHEMA_SQL = `
create table if not exists users (
  id uuid primary key,
  email text not null,
  name text not null,
  bio text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists users_email_key on users (lower(email));

create table if not exists sessions (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists projects (
  id uuid primary key,
  owner_id uuid not null references users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null,
  context text not null default '',
  docs text not null default '',
  stack text not null default '',
  visibility text not null default 'public' check (visibility in ('public','private')),
  demo_url text not null default '',
  sprint_weeks int not null check (sprint_weeks between 1 and 12),
  sprint_ends_at timestamptz not null,
  target_versions int not null default 4,
  status text not null default 'active' check (status in ('active','delivered')),
  delivered_at timestamptz,
  current_version_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on projects (owner_id);

create table if not exists project_members (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('contribute','view')),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  token text not null unique,
  invited_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
create unique index if not exists members_project_email_key on project_members (project_id, lower(email));
create index if not exists members_user_idx on project_members (user_id);

create table if not exists blobs (
  sha256 text primary key,
  content bytea not null
);

create table if not exists versions (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  number int not null,
  label text not null,
  title text not null,
  kind text not null check (kind in ('initial','contribution','restore')),
  author_id uuid references users(id) on delete set null,
  contribution_id uuid,
  restored_from uuid,
  file_count int not null default 0,
  total_size int not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, number)
);

create table if not exists version_files (
  version_id uuid not null references versions(id) on delete cascade,
  path text not null,
  sha256 text not null references blobs(sha256),
  size int not null,
  is_text boolean not null,
  primary key (version_id, path)
);

create table if not exists contributions (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  summary text not null,
  base_version_id uuid not null references versions(id),
  archive_name text not null,
  archive_size int not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  decided_by uuid references users(id) on delete set null,
  decided_at timestamptz,
  decision_note text not null default '',
  result_version_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists contributions_project_idx on contributions (project_id, created_at desc);

create table if not exists contribution_files (
  contribution_id uuid not null references contributions(id) on delete cascade,
  path text not null,
  sha256 text not null references blobs(sha256),
  size int not null,
  is_text boolean not null,
  primary key (contribution_id, path)
);

create table if not exists audit_logs (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_project_idx on audit_logs (project_id, created_at desc);
`;
