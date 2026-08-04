import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

const STATUS_ORDER: AppointmentStatus[] = [
  'Tamamlandı',
  'Planlandı',
  'Devam Ediyor',
  'Ertelendi',
  'İptal Edildi',
]
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  Tamamlandı: 'var(--color-success)',
  Planlandı: 'var(--color-accent)',
  'Devam Ediyor': 'var(--color-warning)',
  Ertelendi: 'var(--color-neutral)',
  'İptal Edildi': 'var(--color-danger)',
}
const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function isoWeekday(dateISO: string) {
  // 0 = Monday ... 6 = Sunday
  return (new Date(`${dateISO}T00:00:00`).getDay() + 6) % 7
}

export async function getDashboardData() {
  const supabase = await createClient()
  const now = new Date()
  const yearStart = `${now.getFullYear()}-01-01`
  const yearEnd = `${now.getFullYear()}-12-31`
  const todayISO = now.toISOString().slice(0, 10)

  const [appointmentsRes, orgsRes, tasksRes, activitiesRes, contactsCountRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, title, date, time, status, priority, org_id, organizations(name)')
      .gte('date', yearStart)
      .lte('date', yearEnd),
    supabase.from('organizations').select('id, name').is('deleted_at', null),
    supabase.from('tasks').select('id, title, deadline, status'),
    supabase
      .from('activities')
      .select('id, description, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const appointments = appointmentsRes.data ?? []
  const organizations = orgsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const activities = activitiesRes.data ?? []
  const contactsCount = contactsCountRes.count ?? 0

  const totalAppts = appointments.length
  const statusCounts: Record<string, number> = {}
  appointments.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1
  })
  const completionRate = totalAppts ? Math.round(((statusCounts['Tamamlandı'] ?? 0) / totalAppts) * 100) : 0
  const cancelRate = totalAppts ? Math.round(((statusCounts['İptal Edildi'] ?? 0) / totalAppts) * 100) : 0

  const todayCount = appointments.filter((a) => a.date === todayISO).length
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - isoWeekday(todayISO))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const thisWeekCount = appointments.filter(
    (a) => a.date >= weekStart.toISOString().slice(0, 10) && a.date <= weekEnd.toISOString().slice(0, 10)
  ).length
  const thisMonthCount = appointments.filter((a) => a.date.slice(0, 7) === todayISO.slice(0, 7)).length

  const monthlyCounts = new Array(12).fill(0)
  appointments.forEach((a) => {
    const monthIndex = Number(a.date.slice(5, 7)) - 1
    monthlyCounts[monthIndex]++
  })
  const maxMonthly = Math.max(...monthlyCounts, 1)
  const monthlyData = MONTH_LABELS.map((label, i) => ({
    label,
    count: monthlyCounts[i],
    heightPct: `${Math.max(4, Math.round((monthlyCounts[i] / maxMonthly) * 100))}%`,
  }))

  let acc = 0
  const gradientStops: string[] = []
  const statusDist = STATUS_ORDER.map((status) => {
    const count = statusCounts[status] ?? 0
    const pct = totalAppts ? Math.round((count / totalAppts) * 100) : 0
    const start = acc
    acc += pct
    gradientStops.push(`${STATUS_COLOR[status]} ${start}% ${acc}%`)
    return { label: status, color: STATUS_COLOR[status], pct }
  })
  if (acc < 100) gradientStops.push(`var(--color-border) ${acc}% 100%`)
  const statusDonutGradient = `conic-gradient(${gradientStops.join(',')})`

  const orgCounts = new Map<number, { name: string; count: number }>()
  organizations.forEach((o) => orgCounts.set(o.id, { name: o.name, count: 0 }))
  appointments.forEach((a) => {
    if (a.org_id && orgCounts.has(a.org_id)) orgCounts.get(a.org_id)!.count++
  })
  const maxOrgCount = Math.max(...[...orgCounts.values()].map((o) => o.count), 1)
  const orgDistribution = [...orgCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((o) => ({ name: o.name, count: o.count, pct: `${Math.round((o.count / maxOrgCount) * 100)}%` }))

  const heatCounts = new Map<string, number>()
  appointments.forEach((a) => {
    if (!a.time) return
    const hour = Number(a.time.slice(0, 2))
    if (hour < 9 || hour > 20) return
    const day = isoWeekday(a.date)
    const key = `${day}-${hour}`
    heatCounts.set(key, (heatCounts.get(key) ?? 0) + 1)
  })
  const maxHeat = Math.max(...heatCounts.values(), 1)
  const heatmap: { color: string; label: string }[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 9; hour <= 20; hour++) {
      const v = heatCounts.get(`${day}-${hour}`) ?? 0
      const alpha = v === 0 ? 0.08 : 0.12 + (v / maxHeat) * 0.75
      heatmap.push({
        color: `rgba(37,99,235,${alpha.toFixed(2)})`,
        label: `${WEEKDAY_LABELS[day]} ${hour}:00`,
      })
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === 'todo').length
  const doneTasks = tasks.filter((t) => t.status === 'done').length

  const overdueAppointments = appointments
    .filter(
      (a) =>
        a.date < todayISO &&
        a.status !== 'Tamamlandı' &&
        a.status !== 'İptal Edildi' &&
        a.status !== 'Ertelendi'
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      orgName: (a.organizations as unknown as { name: string } | null)?.name ?? null,
    }))
  const overdueTasks = tasks
    .filter((t) => !!t.deadline && t.deadline < todayISO && t.status !== 'done')
    .sort((a, b) => (a.deadline as string).localeCompare(b.deadline as string))
    .map((t) => ({ id: t.id, title: t.title, deadline: t.deadline as string }))

  const heroStats = [
    {
      label: 'Toplam Toplantı',
      value: totalAppts,
      trend: `bu ay ${thisMonthCount}`,
      trendColor: 'var(--color-success)',
    },
    {
      label: 'Yaklaşan Randevular',
      value: appointments.filter((a) => a.status === 'Planlandı').length,
      trend: `bu hafta ${appointments.filter((a) => a.status === 'Planlandı' && a.date >= weekStart.toISOString().slice(0, 10) && a.date <= weekEnd.toISOString().slice(0, 10)).length} tanesi`,
      trendColor: 'var(--color-accent)',
    },
    {
      label: 'Bekleyen Görevler',
      value: pendingTasks,
      trend: `${pendingTasks} açık görev`,
      trendColor: 'var(--color-warning)',
    },
    {
      label: 'Tamamlanan Görevler',
      value: doneTasks,
      trend: `toplam ${tasks.length}`,
      trendColor: 'var(--color-success)',
    },
  ]

  const widgets = [
    { label: 'Bugünkü Randevular', value: todayCount },
    { label: 'Bu Hafta', value: thisWeekCount },
    { label: 'Bu Ay', value: thisMonthCount },
    { label: 'Toplam Randevu', value: totalAppts },
    { label: 'İptal Oranı', value: `%${cancelRate}` },
    { label: 'Tamamlanma Oranı', value: `%${completionRate}` },
    { label: 'Aktif Kurum', value: organizations.length },
    { label: 'Toplam Kişi', value: contactsCount },
  ]

  const activityFeed = activities.map((a) => {
    const who = (a.profiles as unknown as { full_name: string | null } | null)?.full_name ?? 'Sistem'
    const initials = who
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    return { who, action: a.description, when: new Date(a.created_at).toLocaleString('tr-TR'), initials }
  })

  return {
    todayLabel: now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    }),
    stats: { today: todayCount, completionRate },
    heroStats,
    widgets,
    monthlyData,
    statusDist,
    statusDonutGradient,
    orgDistribution,
    heatmap,
    activityFeed,
    overdueAppointments,
    overdueTasks,
  }
}
