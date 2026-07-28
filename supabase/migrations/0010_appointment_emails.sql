create table public.appointment_emails (
  id bigint generated always as identity primary key,
  appointment_id bigint not null references public.appointments (id) on delete cascade,
  sent_by uuid references public.profiles (id),
  to_email text not null,
  subject text not null,
  body text not null,
  kind text not null check (kind in ('manual', 'confirmation', 'reminder')),
  sent_at timestamptz not null default now()
);

create index appointment_emails_appointment_id_idx on public.appointment_emails (appointment_id);

alter table public.appointment_emails enable row level security;

create policy "appointment_emails_select_authenticated" on public.appointment_emails
  for select to authenticated using (true);

create policy "appointment_emails_write_staff" on public.appointment_emails
  for all to authenticated
  using (public.current_role() in ('admin', 'yonetici', 'personel'))
  with check (public.current_role() in ('admin', 'yonetici', 'personel'));

-- Marks when the once-per-appointment reminder was sent, so the daily cron
-- job doesn't send it again on the next run.
alter table public.appointments add column reminder_sent_at timestamptz;
