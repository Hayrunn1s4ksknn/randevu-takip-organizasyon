create type task_status as enum ('todo', 'done');

create table public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  deadline date,
  priority appointment_priority not null default 'Orta',
  status task_status not null default 'todo',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index tasks_status_idx on public.tasks (status);

alter table public.tasks enable row level security;

create policy "tasks_select_authenticated" on public.tasks
  for select to authenticated using (true);

create policy "tasks_insert_staff" on public.tasks
  for insert to authenticated with check (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "tasks_update_staff" on public.tasks
  for update to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "tasks_delete_admin" on public.tasks
  for delete to authenticated using (public.current_role() = 'admin');
