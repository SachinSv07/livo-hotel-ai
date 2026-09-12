create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Engineering', 'Sales', 'Concierge')),
  department text check (department in ('Front Desk', 'Housekeeping', 'Engineering', 'Concierge', 'Food & Beverage', 'Sales', 'Security', 'Spa & Wellness')),
  status text not null default 'Available' check (status in ('Available', 'Busy', 'Away', 'On Break', 'Offline')),
  property_id uuid,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

-- Staff can read their own profile. Broader staff-directory access should be added
-- later with a security-definer policy or backend endpoint.
drop policy if exists "Staff can read own profile" on public.staff_profiles;
create policy "Staff can read own profile"
  on public.staff_profiles for select
  to authenticated
  using (auth.uid() = auth_user_id);

-- Profile creation and role changes should be performed by a protected admin
-- workflow, not by an anonymous browser client.

create index if not exists staff_profiles_auth_user_id_idx
  on public.staff_profiles(auth_user_id);

create index if not exists staff_profiles_role_idx
  on public.staff_profiles(role);

create index if not exists staff_profiles_property_id_idx
  on public.staff_profiles(property_id);
