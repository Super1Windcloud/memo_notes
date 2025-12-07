-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Main memo records
create table if not exists public.memos (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    tags text[] not null default '{}',
    category text not null default 'note',
    pinned boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Draft storage for Typora-style page (single row keyed by slug)
create table if not exists public.drafts (
    id text primary key,
    content text not null,
    updated_at timestamptz not null default now()
);

-- UI preferences (theme/language) shared for the demo
create table if not exists public.preferences (
    id text primary key,
    accent text,
    language text,
    updated_at timestamptz not null default now()
);

-- Keep things open for the demo environment
alter table public.memos disable row level security;
alter table public.drafts disable row level security;
alter table public.preferences disable row level security;

-- Helpful indexes
create index if not exists memos_created_at_idx on public.memos (created_at desc);
