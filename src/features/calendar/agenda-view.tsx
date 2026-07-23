import { AppointmentRow } from './appointment-row'
import type { CalendarAppointment } from '@/services/calendar'

export function AgendaView({ appointments }: { appointments: CalendarAppointment[] }) {
  if (appointments.length === 0) {
    return <p className="text-[13px] text-text-secondary">Randevu bulunamadı.</p>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-solid">
      {appointments.map((a) => (
        <AppointmentRow key={a.id} appointment={a} showDate />
      ))}
    </div>
  )
}
