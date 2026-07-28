create table public.appointment_files (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  uploaded_by uuid references public.profiles (id),
  file_name text not null,
  storage_path text not null unique,
  size_bytes bigint not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create index appointment_files_appointment_id_idx on public.appointment_files (appointment_id);

alter table public.appointment_files enable row level security;

create policy "appointment_files_select_authenticated" on public.appointment_files
  for select to authenticated using (true);

create policy "appointment_files_write_staff" on public.appointment_files
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));

-- Private bucket for appointment attachments; downloads go through
-- short-lived signed URLs minted server-side (see /api/appointments/[id]/files).
insert into storage.buckets (id, name, public)
values ('appointment-files', 'appointment-files', false)
on conflict (id) do nothing;

create policy "appointment_files_storage_select" on storage.objects
  for select to authenticated using (bucket_id = 'appointment-files');

create policy "appointment_files_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'appointment-files' and public.current_role() in ('admin', 'yonetici', 'personel'));

create policy "appointment_files_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'appointment-files' and public.current_role() in ('admin', 'yonetici', 'personel'));
