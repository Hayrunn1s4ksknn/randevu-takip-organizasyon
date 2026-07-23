import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getOrganizationOptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organizations')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')
  return data ?? []
}

const LIST_SELECT = 'id, name, sector, logo_letter, contact_person, phone, email, address, total_meetings'

export async function getOrganizationsList(search?: string) {
  const supabase = await createClient()
  let query = supabase.from('organizations').select(LIST_SELECT).is('deleted_at', null)
  if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`)

  const [{ data: organizations }, { data: appointments }] = await Promise.all([
    query.order('name', { ascending: true }),
    supabase.from('appointments').select('org_id, date'),
  ])

  const statsByOrg = new Map<number, { count: number; lastDate: string | null }>()
  ;(appointments ?? []).forEach((a) => {
    if (!a.org_id) return
    const current = statsByOrg.get(a.org_id) ?? { count: 0, lastDate: null }
    current.count += 1
    if (!current.lastDate || a.date > current.lastDate) current.lastDate = a.date
    statsByOrg.set(a.org_id, current)
  })

  return (organizations ?? []).map((o) => {
    const stats = statsByOrg.get(o.id) ?? { count: 0, lastDate: null }
    return {
      ...o,
      totalAppointments: stats.count,
      lastContact: stats.lastDate ? new Date(`${stats.lastDate}T00:00:00`).toLocaleDateString('tr-TR') : '-',
    }
  })
}
