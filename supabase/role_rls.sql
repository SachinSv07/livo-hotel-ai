-- Run after staff.sql.
-- These policies make the frontend role model enforceable in Supabase.

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.staff_profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_staff_department()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select department
  from public.staff_profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_staff_role() from public;
revoke all on function public.current_staff_department() from public;
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.current_staff_department() to authenticated;

-- Keep staff profiles private. The existing own-profile policy remains active.
drop policy if exists "Allow public staff profile reads" on public.staff_profiles;

-- Requests are visible to leadership and reception, or to the matching department.
drop policy if exists "Allow public request reads" on public.requests;
drop policy if exists "Allow public request inserts" on public.requests;
drop policy if exists "Allow public request updates" on public.requests;
drop policy if exists "Allow public request deletes" on public.requests;
drop policy if exists "Staff can read permitted requests" on public.requests;
drop policy if exists "Staff can create permitted requests" on public.requests;
drop policy if exists "Staff can update permitted requests" on public.requests;
drop policy if exists "Managers can delete requests" on public.requests;

create policy "Staff can read permitted requests"
  on public.requests for select
  to authenticated
  using (
    public.current_staff_role() in ('Admin', 'Manager', 'Receptionist')
    or (
      public.current_staff_role() = 'Housekeeping'
      and lower(trim(department)) = 'housekeeping'
    )
    or (
      public.current_staff_role() = 'Engineering'
      and lower(trim(department)) in ('engineering', 'maintenance')
    )
    or (
      public.current_staff_role() = 'Sales'
      and lower(trim(department)) = 'sales'
    )
    or (
      public.current_staff_role() = 'Concierge'
      and lower(trim(department)) = 'concierge'
    )
  );

create policy "Staff can create permitted requests"
  on public.requests for insert
  to authenticated
  with check (
    public.current_staff_role() in ('Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Engineering', 'Concierge')
    and (
      public.current_staff_role() in ('Admin', 'Manager', 'Receptionist')
      or (public.current_staff_role() = 'Housekeeping' and lower(trim(department)) = 'housekeeping')
      or (public.current_staff_role() = 'Engineering' and lower(trim(department)) in ('engineering', 'maintenance'))
      or (public.current_staff_role() = 'Concierge' and lower(trim(department)) = 'concierge')
    )
  );

create policy "Staff can update permitted requests"
  on public.requests for update
  to authenticated
  using (
    public.current_staff_role() in ('Admin', 'Manager', 'Receptionist')
    or (
      public.current_staff_role() = 'Housekeeping'
      and lower(trim(department)) = 'housekeeping'
    )
    or (
      public.current_staff_role() = 'Engineering'
      and lower(trim(department)) in ('engineering', 'maintenance')
    )
    or (
      public.current_staff_role() = 'Concierge'
      and lower(trim(department)) = 'concierge'
    )
  )
  with check (
    public.current_staff_role() in ('Admin', 'Manager', 'Receptionist')
    or (
      public.current_staff_role() = 'Housekeeping'
      and lower(trim(department)) = 'housekeeping'
    )
    or (
      public.current_staff_role() = 'Engineering'
      and lower(trim(department)) in ('engineering', 'maintenance')
    )
    or (
      public.current_staff_role() = 'Concierge'
      and lower(trim(department)) = 'concierge'
    )
  );

create policy "Managers can delete requests"
  on public.requests for delete
  to authenticated
  using (public.current_staff_role() in ('Admin', 'Manager'));

-- Conversation transcripts are staff-only.
drop policy if exists "Allow conversation reads" on public.guest_conversations;
drop policy if exists "Staff can read conversations" on public.guest_conversations;

create policy "Staff can read conversations"
  on public.guest_conversations for select
  to authenticated
  using (public.current_staff_role() in ('Admin', 'Manager', 'Receptionist', 'Concierge'));
