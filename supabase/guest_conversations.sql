create table if not exists public.guest_conversations (
  id uuid primary key default gen_random_uuid(),
  elevenlabs_conversation_id text unique not null,
  agent_id text,
  agent_name text,
  room_number text,
  request_id uuid references public.requests(id),
  request text,
  department text,
  priority text,
  status text default 'completed',
  transcript jsonb not null default '[]'::jsonb,
  transcript_summary text,
  call_duration_secs integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.guest_conversations enable row level security;

drop policy if exists "Allow conversation reads" on public.guest_conversations;
create policy "Allow conversation reads"
  on public.guest_conversations for select
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.guest_conversations;
