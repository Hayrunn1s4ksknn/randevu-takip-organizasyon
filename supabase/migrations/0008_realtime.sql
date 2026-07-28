-- Full replica identity so UPDATE/DELETE realtime payloads include the
-- full previous row (title, created_by, etc.), not just the primary key —
-- needed to show meaningful toast messages and to skip toasts for the
-- user who made the change themselves.
alter table public.appointments replica identity full;
alter table public.tasks replica identity full;

alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.tasks;
