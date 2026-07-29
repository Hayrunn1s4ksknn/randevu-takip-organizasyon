import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

export type AppointmentFilters = {
  search?: string
  status?: AppointmentStatus | 'all'
  orgId?: number
  dateFrom?: string
  dateTo?: string
  contactId?: number
  assignedTo?: string
}

const SELECT =
  'id, title, date, time, location, status, priority, org_id, assigned_to, organizations(name), assigned_profile:profiles!appointments_assigned_to_fkey(full_name)'

async function resolveContactAppointmentIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contactId: number
) {
  const { data } = await supabase
    .from('appointment_participants')
    .select('appointment_id')
    .eq('contact_id', contactId)
  const ids = (data ?? []).map((p) => p.appointment_id)
  return ids.length > 0 ? ids : [-1]
}

export async function getAppointmentsList(filters: AppointmentFilters, page: number, pageSize = 5) {
  const supabase = await createClient()
  let query = supabase.from('appointments').select(SELECT, { count: 'exact' })
  if (filters.search?.trim()) query = query.ilike('title', `%${filters.search.trim()}%`)
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.orgId) query = query.eq('org_id', filters.orgId)
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('date', filters.dateTo)
  if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
  if (filters.contactId)
    query = query.in('id', await resolveContactAppointmentIds(supabase, filters.contactId))

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
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('date', filters.dateTo)
  if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
  if (filters.contactId)
    query = query.in('id', await resolveContactAppointmentIds(supabase, filters.contactId))

  const { data } = await query.order('date', { ascending: true }).limit(5000)
  return data ?? []
}

export async function getAppointmentOptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select('id, title')
    .order('date', { ascending: false })
    .limit(200)
  return data ?? []
}
