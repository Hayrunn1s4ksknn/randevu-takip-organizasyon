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
    <>
      {/* Mobile: one full-width row per day (7 side-by-side columns don't fit a phone) */}
      <div className="flex flex-col gap-2 md:hidden">
        {cells.map((cell) => (
          <Link
            key={cell.iso}
            href={`/calendar?view=Gün&month=${monthOffset}&day=${cell.iso}`}
            className="block rounded-2xl border border-border p-3"
            style={{
              background: cell.iso === selectedDay ? 'var(--color-accent-bg)' : 'var(--color-surface-solid)',
            }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-text-secondary">{cell.label}</span>
              <span className="text-sm font-bold">{cell.day}</span>
              {cell.events.length > 0 && (
                <span className="ml-auto text-[11px] text-text-secondary">{cell.events.length} randevu</span>
              )}
            </div>
            {cell.events.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {cell.events.map((ev) => (
                  <AppointmentChip key={ev.id} id={ev.id} title={ev.title} status={ev.status} />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden overflow-x-auto md:block">
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
    </>
  )
}
