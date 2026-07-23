import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getTopOrganizations(limit = 5) {
  const supabase = await createClient()
  const [{ data: organizations }, { data: appointments }] = await Promise.all([
    supabase.from('organizations').select('id, name').is('deleted_at', null),
    supabase.from('appointments').select('org_id'),
  ])

  const counts = new Map<number, number>()
  ;(appointments ?? []).forEach((a) => {
    if (!a.org_id) return
    counts.set(a.org_id, (counts.get(a.org_id) ?? 0) + 1)
  })

  const rows = (organizations ?? [])
    .map((o) => ({ name: o.name, count: counts.get(o.id) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  const max = Math.max(...rows.map((r) => r.count), 1)
  return rows.map((r) => ({ ...r, pct: `${Math.round((r.count / max) * 100)}%` }))
}

export async function getTopStaff(limit = 5) {
  const supabase = await createClient()
  const { data } = await supabase.from('appointments').select('created_by, profiles(full_name)')

  const counts = new Map<string, { name: string; count: number }>()
  ;(data ?? []).forEach((a) => {
    if (!a.created_by) return
    const name = (a.profiles as unknown as { full_name: string | null } | null)?.full_name ?? 'Bilinmeyen'
    const current = counts.get(a.created_by) ?? { name, count: 0 }
    current.count += 1
    counts.set(a.created_by, current)
  })

  const rows = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit)
  const max = Math.max(...rows.map((r) => r.count), 1)
  return rows.map((r) => ({ ...r, pct: `${Math.round((r.count / max) * 100)}%` }))
}

export async function getYearlyPerformance() {
  const supabase = await createClient()
  const { data } = await supabase.from('appointments').select('date')

  const counts = new Map<string, number>()
  ;(data ?? []).forEach((a) => {
    const year = a.date.slice(0, 4)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  })

  const years = [...counts.keys()].sort()
  const max = Math.max(...counts.values(), 1)
  return years.map((year) => ({
    label: year,
    count: counts.get(year) ?? 0,
    heightPct: `${Math.round(((counts.get(year) ?? 0) / max) * 100)}%`,
  }))
}
