import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

export const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

const SELECT = 'id, title, date, time, location, status, organizations(name)'

export type CalendarAppointment = {
  id: number
  title: string
  date: string
  time: string | null
  location: string | null
  status: AppointmentStatus
  organizations: { name: string } | null
}

function isoWeekday(dateISO: string) {
  return (new Date(`${dateISO}T00:00:00`).getDay() + 6) % 7
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function monthLabel(year: number, month: number) {
  const label = new Date(year, month, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function weekRangeForDay(dayIso: string) {
  const d = new Date(`${dayIso}T00:00:00`)
  const monday = new Date(d)
  monday.setDate(d.getDate() - isoWeekday(dayIso))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toIso(monday), end: toIso(sunday) }
}

export async function getMonthAppointments(year: number, month: number) {
  const supabase = await createClient()
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data } = await supabase.from('appointments').select(SELECT).gte('date', start).lte('date', end)
  return (data ?? []) as CalendarAppointment[]
}

export async function getWeekAppointments(startIso: string, endIso: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select(SELECT)
    .gte('date', startIso)
    .lte('date', endIso)
  return (data ?? []) as CalendarAppointment[]
}

export async function getDayAppointments(dayIso: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('appointments').select(SELECT).eq('date', dayIso).order('time')
  return (data ?? []) as CalendarAppointment[]
}

export async function getAgendaAppointments(limit = 200) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select(SELECT)
    .order('date', { ascending: true })
    .limit(limit)
  return (data ?? []) as CalendarAppointment[]
}

export function buildMonthCells(year: number, month: number, appointments: CalendarAppointment[]) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDaysInMonth = new Date(year, month, 0).getDate()

  const eventsByDate = new Map<string, CalendarAppointment[]>()
  appointments.forEach((a) => {
    const list = eventsByDate.get(a.date) ?? []
    list.push(a)
    eventsByDate.set(a.date, list)
  })

  const cells: { day: number; otherMonth: boolean; iso: string | null; events: CalendarAppointment[] }[] = []
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: prevDaysInMonth - startWeekday + i + 1, otherMonth: true, iso: null, events: [] })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, otherMonth: false, iso, events: eventsByDate.get(iso) ?? [] })
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({
      day: cells.length - (startWeekday + daysInMonth) + 1,
      otherMonth: true,
      iso: null,
      events: [],
    })
  }
  return cells
}

export function buildWeekCells(startIso: string, appointments: CalendarAppointment[]) {
  const eventsByDate = new Map<string, CalendarAppointment[]>()
  appointments.forEach((a) => {
    const list = eventsByDate.get(a.date) ?? []
    list.push(a)
    eventsByDate.set(a.date, list)
  })

  const monday = new Date(`${startIso}T00:00:00`)
  const cells: { iso: string; label: string; day: number; events: CalendarAppointment[] }[] = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday)
    cur.setDate(monday.getDate() + i)
    const iso = toIso(cur)
    cells.push({ iso, label: WEEKDAY_LABELS[i], day: cur.getDate(), events: eventsByDate.get(iso) ?? [] })
  }
  return cells
}
