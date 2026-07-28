import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/types/database'

const SELECT = 'id, title, deadline, priority, status, created_at'

export async function getTasksList(filter: TaskStatus | 'all' = 'all') {
  const supabase = await createClient()
  let query = supabase.from('tasks').select(SELECT)
  if (filter !== 'all') query = query.eq('status', filter)

  const { data } = await query
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  return data ?? []
}
