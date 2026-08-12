alter table public.appointments add column sms_reminder_sent_at timestamptz;

create table public.appointment_sms (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  sent_by uuid references public.profiles (id),
  to_phone text not null,
  message text not null,
  kind text not null check (kind in ('reminder', 'manual')),
  sent_at timestamptz not null default now()
);

create index appointment_sms_appointment_id_idx on public.appointment_sms (appointment_id);

alter table public.appointment_sms enable row level security;

create policy "appointment_sms_select_authenticated" on public.appointment_sms
  for select to authenticated using (true);

create policy "appointment_sms_write_staff" on public.appointment_sms
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));
