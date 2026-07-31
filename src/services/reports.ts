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
  const { data } = await supabase
    .from('appointments')
    .select('assigned_to, profiles:profiles!appointments_assigned_to_fkey(full_name)')

  const counts = new Map<string, { name: string; count: number }>()
  ;(data ?? []).forEach((a) => {
    if (!a.assigned_to) return
    const name = (a.profiles as unknown as { full_name: string | null } | null)?.full_name ?? 'Bilinmeyen'
    const current = counts.get(a.assigned_to) ?? { name, count: 0 }
    current.count += 1
    counts.set(a.assigned_to, current)
  })

  const rows = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit)
  const max = Math.max(...rows.map((r) => r.count), 1)
  return rows.map((r) => ({ ...r, pct: `${Math.round((r.count / max) * 100)}%` }))
}

export async function getMeetingDurationStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select('meeting_type, duration_minutes')
    .not('meeting_type', 'is', null)

  const rows = data ?? []
  const byType = new Map<string, { count: number; totalDuration: number; withDuration: number }>()
  for (const r of rows) {
    if (!r.meeting_type) continue
    const entry = byType.get(r.meeting_type) ?? { count: 0, totalDuration: 0, withDuration: 0 }
    entry.count += 1
    if (r.duration_minutes != null) {
      entry.totalDuration += r.duration_minutes
      entry.withDuration += 1
    }
    byType.set(r.meeting_type, entry)
  }

  const totalCount = rows.length
  const distribution = [...byType.entries()]
    .map(([type, e]) => ({
      type,
      count: e.count,
      pct: totalCount ? Math.round((e.count / totalCount) * 100) : 0,
      avgDuration: e.withDuration ? Math.round(e.totalDuration / e.withDuration) : null,
    }))
    .sort((a, b) => b.count - a.count)

  const withDuration = rows.filter((r) => r.duration_minutes != null)
  const overallAvg = withDuration.length
    ? Math.round(withDuration.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / withDuration.length)
    : null

  return { hasData: totalCount > 0, distribution, overallAvg, totalCount }
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
