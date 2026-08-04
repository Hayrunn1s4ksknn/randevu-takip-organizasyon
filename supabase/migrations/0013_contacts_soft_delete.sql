alter table public.contacts add column deleted_at timestamptz;
create index contacts_deleted_at_idx on public.contacts (deleted_at);
