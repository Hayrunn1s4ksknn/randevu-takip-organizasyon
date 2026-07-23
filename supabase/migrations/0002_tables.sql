-- profiles: one row per auth.users, created automatically by handle_new_user trigger (0003)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role user_role not null default 'personel',
  avatar_url text,
  dark_mode boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id bigint generated always as identity primary key,
  name text not null,
  sector text,
  logo_letter text,
  contact_person text,
  phone text,
  email text,
  address text,
  total_meetings integer not null default 0,
  deleted_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.contacts (
  id bigint generated always as identity primary key,
  name text not null,
  "position" text,
  company_id bigint references public.organizations (id) on delete set null,
  phone text,
  email text,
  notes text,
  tags text[] not null default '{}',
  last_contact date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.appointments (
  id bigint generated always as identity primary key,
  title text not null,
  org_id bigint references public.organizations (id) on delete set null,
  date date not null,
  "time" time,
  location text,
  status appointment_status not null default 'Planlandı',
  priority appointment_priority not null default 'Orta',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointment_participants (
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  contact_id bigint not null references public.contacts (id) on delete cascade,
  primary key (appointment_id, contact_id)
);

create table public.appointment_notes (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  author_id uuid references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.appointment_comments (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  author_id uuid references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.appointment_status_history (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  from_status appointment_status,
  to_status appointment_status not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create table public.activities (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id),
  action_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index appointments_org_id_idx on public.appointments (org_id);
create index appointments_date_idx on public.appointments (date);
create index appointments_status_idx on public.appointments (status);
create index contacts_company_id_idx on public.contacts (company_id);
create index appointment_participants_contact_id_idx on public.appointment_participants (contact_id);
create index appointment_notes_appointment_id_idx on public.appointment_notes (appointment_id);
create index appointment_comments_appointment_id_idx on public.appointment_comments (appointment_id);
create index appointment_status_history_appointment_id_idx on public.appointment_status_history (appointment_id);
create index activities_created_at_idx on public.activities (created_at desc);
create index organizations_deleted_at_idx on public.organizations (deleted_at);
