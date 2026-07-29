import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/types/database'

const SELECT =
  'id, title, description, deadline, priority, status, appointment_id, assigned_to, created_at, appointments(title), assigned_profile:profiles!tasks_assigned_to_fkey(full_name)'

export async function getTasksList(filter: TaskStatus | 'all' = 'all') {
  const supabase = await createClient()
  let query = supabase.from('tasks').select(SELECT)
  if (filter !== 'all') query = query.eq('status', filter)

  const { data } = await query
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  return data ?? []
}
