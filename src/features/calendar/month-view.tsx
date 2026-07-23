import Link from 'next/link'
import { AppointmentChip } from './appointment-chip'
import { WEEKDAY_LABELS, type CalendarAppointment } from '@/services/calendar'

type Cell = { day: number; otherMonth: boolean; iso: string | null; events: CalendarAppointment[] }

export function MonthView({ cells, monthOffset }: { cells: Cell[]; monthOffset: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-solid">
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((wd) => (
          <div
            key={wd}
            className="border-b border-border p-2.5 text-center text-[11.5px] font-bold text-text-secondary"
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const content = (
            <div
              className="min-h-[104px] border-b border-r border-border p-2"
              style={{ opacity: cell.otherMonth ? 0.35 : 1 }}
            >
              <div className="text-xs font-bold">{cell.day}</div>
              <div className="mt-1.5 flex flex-col gap-1">
                {cell.events.slice(0, 2).map((ev) => (
                  <AppointmentChip key={ev.id} id={ev.id} title={ev.title} status={ev.status} />
                ))}
                {cell.events.length > 2 && (
                  <div className="text-[10px] text-text-secondary">+{cell.events.length - 2} tane</div>
                )}
              </div>
            </div>
          )
          return cell.iso ? (
            <Link key={i} href={`/calendar?view=Gün&month=${monthOffset}&day=${cell.iso}`}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
