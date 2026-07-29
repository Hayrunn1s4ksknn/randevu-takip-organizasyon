create type meeting_type as enum ('Online', 'Fiziksel', 'Telefon');

alter table public.appointments add column meeting_type meeting_type;
alter table public.appointments add column duration_minutes integer;
