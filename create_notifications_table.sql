-- Notifications table + realtime setup
-- Run in Supabase SQL editor

create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  title text not null,
  message text not null,
  is_read boolean null default false,
  type text null default 'general'::text,
  created_at timestamp with time zone null default now(),
  target_audience text null,
  constraint notifications_pkey primary key (id)
) tablespace pg_default;

create index if not exists notifications_user_id_idx
  on public.notifications using btree (user_id) tablespace pg_default;

create index if not exists notifications_created_at_idx
  on public.notifications using btree (created_at desc) tablespace pg_default;

-- Keep same access model as current app code (frontend reads directly).
alter table public.notifications disable row level security;

-- Ensure table is included in Supabase realtime publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
