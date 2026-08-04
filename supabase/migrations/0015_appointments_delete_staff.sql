drop policy "appointments_delete_admin" on public.appointments;

create policy "appointments_delete_staff" on public.appointments
  for delete to authenticated using (public.current_role() in ('admin', 'yonetici', 'personel'));
