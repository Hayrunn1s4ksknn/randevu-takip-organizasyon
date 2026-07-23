import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

export type AppointmentFilters = {
  search?: string
  status?: AppointmentStatus | 'all'
  orgId?: number
}

const SELECT = 'id, title, date, time, location, status, priority, org_id, organizations(name)'

export async function getAppointmentsList(filters: AppointmentFilters, page: number, pageSize = 5) {
  const supabase = await createClient()
  let query = supabase.from('appointments').select(SELECT, { count: 'exact' })
  if (filters.search?.trim()) query = query.ilike('title', `%${filters.search.trim()}%`)
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.orgId) query = query.eq('org_id', filters.orgId)

  const { data, count } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return { rows: data ?? [], totalCount: count ?? 0, page, pageSize }
}

export async function getAppointmentsForExport(filters: AppointmentFilters) {
  const supabase = await createClient()
  let query = supabase.from('appointments').select(SELECT)
  if (filters.search?.trim()) query = query.ilike('title', `%${filters.search.trim()}%`)
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.orgId) query = query.eq('org_id', filters.orgId)

  const { data } = await query.order('date', { ascending: true }).limit(5000)
  return data ?? []
}
