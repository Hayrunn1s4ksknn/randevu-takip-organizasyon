import Link from 'next/link'
import { AppointmentChip } from './appointment-chip'
import type { CalendarAppointment } from '@/services/calendar'

type Cell = { iso: string; label: string; day: number; events: CalendarAppointment[] }

export function WeekView({
  cells,
  monthOffset,
  selectedDay,
}: {
  cells: Cell[]
  monthOffset: number
  selectedDay: string
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 overflow-hidden rounded-2xl border border-border bg-surface-solid">
        {cells.map((cell) => (
          <Link
            key={cell.iso}
            href={`/calendar?view=Gün&month=${monthOffset}&day=${cell.iso}`}
            className="min-h-[220px] border-r border-border p-2.5 last:border-r-0"
            style={{ background: cell.iso === selectedDay ? 'var(--color-accent-bg)' : 'transparent' }}
          >
            <div className="text-[11px] font-bold text-text-secondary">{cell.label}</div>
            <div className="mt-0.5 text-sm font-bold">{cell.day}</div>
            <div className="mt-2 flex flex-col gap-1">
              {cell.events.map((ev) => (
                <AppointmentChip key={ev.id} id={ev.id} title={ev.title} status={ev.status} />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
