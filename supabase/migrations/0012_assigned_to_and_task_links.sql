alter table public.appointments add column assigned_to uuid references public.profiles (id);
create index appointments_assigned_to_idx on public.appointments (assigned_to);

alter table public.tasks add column description text;
alter table public.tasks add column appointment_id bigint references public.appointments (id) on delete set null;
alter table public.tasks add column assigned_to uuid references public.profiles (id);
create index tasks_appointment_id_idx on public.tasks (appointment_id);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
