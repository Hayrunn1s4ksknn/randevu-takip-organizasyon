-- Matches the appointments_delete_staff precedent (0015): the "Sil" button
-- on tasks is shown to every role, but delete was still admin-only at the
-- RLS layer, so personel/yönetici clicks silently deleted zero rows (RLS
-- blocks with no Postgres error — no error toast, task just stayed).
drop policy "tasks_delete_admin" on public.tasks;

create policy "tasks_delete_staff" on public.tasks
  for delete to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));
