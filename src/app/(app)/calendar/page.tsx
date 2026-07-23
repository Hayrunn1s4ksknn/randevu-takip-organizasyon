import {
  buildMonthCells,
  buildWeekCells,
  getAgendaAppointments,
  getDayAppointments,
  getMonthAppointments,
  getWeekAppointments,
  monthLabel,
  weekRangeForDay,
} from '@/services/calendar'
import { CalendarViewTabs } from '@/features/calendar/calendar-view-tabs'
import { MonthNav } from '@/features/calendar/month-nav'
import { MonthView } from '@/features/calendar/month-view'
import { WeekView } from '@/features/calendar/week-view'
import { DayView } from '@/features/calendar/day-view'
import { AgendaView } from '@/features/calendar/agenda-view'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string; day?: string }>
}) {
  const params = await searchParams
  const view = params.view ?? 'Ay'
  const monthOffset = Number(params.month) || 0
  const day = params.day ?? todayIso()

  const base = new Date()
  base.setDate(1)
  base.setMonth(base.getMonth() + monthOffset)
  const year = base.getFullYear()
  const month = base.getMonth()

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <MonthNav label={monthLabel(year, month)} monthOffset={monthOffset} view={view} day={day} />
        <CalendarViewTabs view={view} monthOffset={monthOffset} day={day} />
      </div>

      {view === 'Ay' && (
        <MonthView
          cells={buildMonthCells(year, month, await getMonthAppointments(year, month))}
          monthOffset={monthOffset}
        />
      )}

      {view === 'Hafta' && <WeekViewLoader monthOffset={monthOffset} day={day} />}

      {view === 'Gün' && <DayView dayIso={day} appointments={await getDayAppointments(day)} />}

      {view === 'Ajanda' && <AgendaView appointments={await getAgendaAppointments()} />}
    </div>
  )
}

async function WeekViewLoader({ monthOffset, day }: { monthOffset: number; day: string }) {
  const { start, end } = weekRangeForDay(day)
  const appointments = await getWeekAppointments(start, end)
  return <WeekView cells={buildWeekCells(start, appointments)} monthOffset={monthOffset} selectedDay={day} />
}
