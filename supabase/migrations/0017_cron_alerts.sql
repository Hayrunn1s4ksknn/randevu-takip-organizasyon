-- One row per named cron job, tracking when its failure alert was last sent
-- so a prolonged outage (workflow re-running every 15 min) doesn't spam the
-- owner's phone with a new SMS on every single failed run.
create table public.cron_alerts (
  key text primary key,
  last_sent_at timestamptz not null default now()
);

alter table public.cron_alerts enable row level security;
-- No policies: this table is only ever touched by the service-role client
-- (the alert route uses createAdminClient), which bypasses RLS entirely.
