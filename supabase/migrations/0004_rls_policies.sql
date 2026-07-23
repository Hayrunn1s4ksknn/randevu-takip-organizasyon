alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_participants enable row level security;
alter table public.appointment_notes enable row level security;
alter table public.appointment_comments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.activities enable row level security;

-- profiles: everyone authenticated can read (needed to show names/avatars),
-- users may only update their own row (role changes are blocked by the
-- prevent_role_escalation trigger unless the actor is an admin).
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update to authenticated using (public.current_role() = 'admin') with check (true);

-- organizations
create policy "organizations_select_authenticated" on public.organizations
  for select to authenticated using (true);

create policy "organizations_insert_staff" on public.organizations
  for insert to authenticated with check (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "organizations_update_staff" on public.organizations
  for update to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "organizations_delete_admin" on public.organizations
  for delete to authenticated using (public.current_role() = 'admin');

-- contacts
create policy "contacts_select_authenticated" on public.contacts
  for select to authenticated using (true);

create policy "contacts_insert_staff" on public.contacts
  for insert to authenticated with check (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "contacts_update_staff" on public.contacts
  for update to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "contacts_delete_admin" on public.contacts
  for delete to authenticated using (public.current_role() = 'admin');

-- appointments
create policy "appointments_select_authenticated" on public.appointments
  for select to authenticated using (true);

create policy "appointments_insert_staff" on public.appointments
  for insert to authenticated with check (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "appointments_update_staff" on public.appointments
  for update to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "appointments_delete_admin" on public.appointments
  for delete to authenticated using (public.current_role() = 'admin');

-- appointment_participants
create policy "appointment_participants_select_authenticated" on public.appointment_participants
  for select to authenticated using (true);

create policy "appointment_participants_write_staff" on public.appointment_participants
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));

-- appointment_notes
create policy "appointment_notes_select_authenticated" on public.appointment_notes
  for select to authenticated using (true);

create policy "appointment_notes_write_staff" on public.appointment_notes
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));

-- appointment_comments
create policy "appointment_comments_select_authenticated" on public.appointment_comments
  for select to authenticated using (true);

create policy "appointment_comments_write_staff" on public.appointment_comments
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));

-- appointment_status_history: system-written only (triggers use security definer),
-- everyone authenticated can read it.
create policy "appointment_status_history_select_authenticated" on public.appointment_status_history
  for select to authenticated using (true);

-- activities: system-written only, everyone authenticated can read it.
create policy "activities_select_authenticated" on public.activities
  for select to authenticated using (true);
