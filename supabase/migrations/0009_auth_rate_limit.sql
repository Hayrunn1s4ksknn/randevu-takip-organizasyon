-- Tracks login/password-reset attempts so the app can throttle repeated
-- failures. Only ever read/written via the service-role client from trusted
-- server actions, so RLS is enabled with no policies for anon/authenticated.
create table public.auth_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  action text not null check (action in ('login', 'password_reset')),
  success boolean not null,
  attempted_at timestamptz not null default now()
);

create index auth_attempts_lookup_idx on public.auth_attempts (email, action, attempted_at desc);

alter table public.auth_attempts enable row level security;
