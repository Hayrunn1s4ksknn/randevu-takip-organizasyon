import Link from 'next/link'
import { AppointmentChip } from './appointment-chip'
import { WEEKDAY_LABELS, type CalendarAppointment } from '@/services/calendar'
import { STATUS_STYLE } from '@/lib/status-styles'

type Cell = { day: number; otherMonth: boolean; iso: string | null; events: CalendarAppointment[] }

function CellLink({
  cell,
  monthOffset,
  children,
}: {
  cell: Cell
  monthOffset: number
  children: React.ReactNode
}) {
  return cell.iso ? (
    <Link href={`/calendar?view=Gün&month=${monthOffset}&day=${cell.iso}`}>{children}</Link>
  ) : (
    <div>{children}</div>
  )
}

export function MonthView({ cells, monthOffset }: { cells: Cell[]; monthOffset: number }) {
  return (
    <>
      {/* Compact mobile view: fits 7 columns at phone width, dots instead of chips */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-solid md:hidden">
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((wd) => (
            <div
              key={wd}
              className="border-b border-border py-1.5 text-center text-[9.5px] font-bold text-text-secondary"
            >
              {wd.slice(0, 2)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => (
            <CellLink key={i} cell={cell} monthOffset={monthOffset}>
              <div
                className="flex min-h-[52px] flex-col items-center gap-1 border-b border-r border-border p-1"
                style={{ opacity: cell.otherMonth ? 0.35 : 1 }}
              >
                <div className="text-[11px] font-bold">{cell.day}</div>
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {cell.events.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{ background: STATUS_STYLE[ev.status].color }}
                    />
                  ))}
                  {cell.events.length > 3 && (
                    <span className="text-[8px] leading-none text-text-secondary">
                      +{cell.events.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </CellLink>
          ))}
        </div>
      </div>

      {/* Desktop view: full event-title chips, horizontally scrollable as a safety net */}
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[640px] overflow-hidden rounded-2xl border border-border bg-surface-solid">
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
            {cells.map((cell, i) => (
              <CellLink key={i} cell={cell} monthOffset={monthOffset}>
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
              </CellLink>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
