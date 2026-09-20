create extension if not exists pgcrypto;

create table if not exists public.daily_lessons (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null,
  slot smallint not null check (slot between 1 and 3),
  category text not null,
  question text not null,
  news_connection text not null,
  core_concept text not null,
  essentials text not null,
  challenge text not null,
  connection_title text not null,
  connection_body text not null,
  quiz_question text not null,
  quiz_a text not null,
  quiz_b text not null,
  quiz_c text not null,
  quiz_answer text not null check (quiz_answer in ('A','B','C')),
  quiz_explanation text not null,
  viewpoint text not null,
  source_title text not null,
  source_url text not null,
  source_published_at timestamptz,
  status text not null default 'published' check (status in ('draft','published','rejected')),
  ai_model text,
  ai_run_id text,
  created_at timestamptz not null default now(),
  unique (publish_date, slot)
);

create index if not exists daily_lessons_publish_date_idx
  on public.daily_lessons (publish_date desc, slot asc);

alter table public.daily_lessons enable row level security;

-- Public read only for published content.
create policy "public can read published lessons"
  on public.daily_lessons
  for select
  to anon
  using (status = 'published');

grant select on public.daily_lessons to anon;
grant all on public.daily_lessons to service_role;
