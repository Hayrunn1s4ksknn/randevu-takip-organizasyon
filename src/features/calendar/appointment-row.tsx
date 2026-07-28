'use client'

import { useUiStore } from '@/store/ui'
import { STATUS_STYLE } from '@/lib/status-styles'
import { onActivateKey } from '@/lib/a11y'
import type { CalendarAppointment } from '@/services/calendar'

export function AppointmentRow({
  appointment,
  showDate,
}: {
  appointment: CalendarAppointment
  showDate?: boolean
}) {
  const openDrawer = useUiStore((s) => s.openDrawer)
  const style = STATUS_STYLE[appointment.status]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDrawer(appointment.id)}
      onKeyDown={onActivateKey(() => openDrawer(appointment.id))}
      className="flex cursor-pointer items-center gap-3.5 border-b border-border px-5 py-3 last:border-b-0 hover:bg-bg"
    >
      {showDate && (
        <div className="w-[90px] shrink-0 text-xs text-text-secondary">
          {new Date(`${appointment.date}T00:00:00`).toLocaleDateString('tr-TR')}
        </div>
      )}
      <div className="w-12 shrink-0 text-xs text-text-secondary">{appointment.time?.slice(0, 5) ?? '-'}</div>
      <div className="min-w-0 flex-1 truncate text-[13px] font-semibold">{appointment.title}</div>
      <div className="shrink-0 text-xs text-text-secondary">{appointment.organizations?.name ?? '-'}</div>
      <span
        className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        {appointment.status}
      </span>
    </div>
  )
}
