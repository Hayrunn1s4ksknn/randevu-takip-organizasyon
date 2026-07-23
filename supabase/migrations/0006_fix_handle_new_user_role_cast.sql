-- 0003's handle_new_user() assigned an uncast CASE expression to profiles.role.
-- PL/pgSQL resolves the CASE result as `text`, and Postgres does not
-- implicitly cast a plain `text` value to an enum column inside a function
-- body (only unknown-typed literals get that treatment) — every signup via
-- the Supabase Admin API failed with "Database error creating new user"
-- until this cast was added.
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
    (case when not exists (select 1 from public.profiles) then 'admin' else 'personel' end)::user_role
  );
  return new;
end;
$$;
