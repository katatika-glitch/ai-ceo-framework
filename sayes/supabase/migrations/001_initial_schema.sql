-- users: Googleログインで自動作成
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  google_id text unique not null,
  created_at timestamptz default now()
);

-- profiles: 属性登録（初回のみ）
create table if not exists profiles (
  id uuid primary key references users(id) on delete cascade,
  work_style text not null,       -- 会社員/フリーランス/学生/その他
  industry text not null,         -- IT/医療/教育/小売/サービス業/その他
  side_job_goal text not null,    -- 収益化/業務効率化/趣味/スキルアップ
  tech_level text not null,       -- ほぼゼロ/少しある/ある程度できる
  weekly_hours text not null,     -- 週1h以下/週1〜5h/週5h以上
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- projects: 生成済みプロジェクト
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  yes_no_log jsonb default '[]',   -- YES/NO会話の履歴
  html_content text,               -- 生成された1ファイルHTML
  netlify_url text,                -- デプロイ済みURL
  netlify_deploy_id text,
  status text default 'draft',     -- draft/deployed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;

create policy "users: self only" on users
  for all using (google_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "profiles: self only" on profiles
  for all using (id in (
    select id from users
    where google_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

create policy "projects: self only" on projects
  for all using (user_id in (
    select id from users
    where google_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
