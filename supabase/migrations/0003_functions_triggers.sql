-- Returns the role of the currently authenticated user.
-- security definer so it can read public.profiles regardless of RLS,
-- avoiding recursive policy evaluation on the profiles table itself.
create or replace function public.current_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Creates a profile row for every new auth.users signup.
-- The very first user to sign up becomes 'admin'; everyone after is 'personel'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when not exists (select 1 from public.profiles) then 'admin' else 'personel' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevents non-admins from changing their own (or anyone else's) role.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.current_role() is distinct from 'admin' then
    raise exception 'Only admins can change a user role';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Generic updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Records every status transition into appointment_status_history.
create or replace function public.log_appointment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.appointment_status_history (appointment_id, from_status, to_status, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger appointments_log_status_change
  after insert or update on public.appointments
  for each row execute function public.log_appointment_status_change();

-- Feeds the dashboard "Son Aktiviteler" widget from real CRUD events.
create or replace function public.log_appointment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activities (user_id, action_type, description)
    values (auth.uid(), 'appointment_created', 'yeni randevu oluşturdu: "' || new.title || '"');
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activities (user_id, action_type, description)
    values (auth.uid(), 'appointment_status_changed', '"' || new.title || '" randevusunu ' || new.status || ' olarak güncelledi');
  elsif tg_op = 'UPDATE' then
    insert into public.activities (user_id, action_type, description)
    values (auth.uid(), 'appointment_updated', '"' || new.title || '" randevusunu güncelledi');
  end if;
  return new;
end;
$$;

create trigger appointments_log_activity
  after insert or update on public.appointments
  for each row execute function public.log_appointment_activity();

create or replace function public.log_contact_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activities (user_id, action_type, description)
  values (auth.uid(), 'contact_created', 'yeni kişi ekledi: ' || new.name);
  return new;
end;
$$;

create trigger contacts_log_activity
  after insert on public.contacts
  for each row execute function public.log_contact_activity();
