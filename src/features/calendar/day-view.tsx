import { AppointmentRow } from './appointment-row'
import type { CalendarAppointment } from '@/services/calendar'

export function DayView({ dayIso, appointments }: { dayIso: string; appointments: CalendarAppointment[] }) {
  const label = new Date(`${dayIso}T00:00:00`).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
      <div className="mb-3.5 text-[14.5px] font-bold capitalize">{label}</div>
      {appointments.length === 0 ? (
        <p className="text-[13px] text-text-secondary">Bu gün için randevu yok.</p>
      ) : (
        <div className="-mx-[22px]">
          {appointments.map((a) => (
            <AppointmentRow key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  )
}
