create table public.requests (
  id uuid not null default gen_random_uuid(),
  room_number text not null default ''::text,
  request text null,
  department text null,
  priority text null default 'normal'::text,
  status text null default 'Pending'::text,
  created_at timestamp with time zone null default now(),
  acknowledged_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  constraint requests_pkey primary key (id)
) tablespace pg_default;

alter table public.requests enable row level security;

-- The current UI has no Supabase Auth flow. Tighten these policies before
-- using this table with production guest data.
drop policy if exists "Allow public request reads" on public.requests;
create policy "Allow public request reads"
  on public.requests for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public request inserts" on public.requests;
create policy "Allow public request inserts"
  on public.requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public request updates" on public.requests;
create policy "Allow public request updates"
  on public.requests for update
  to anon, authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table public.requests;
