import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/services/profile'
import { getTodayAppointmentsForWidget } from '@/services/appointments'
import { STATUS_STYLE } from '@/lib/status-styles'
import { WidgetAutoRefresh } from './widget-auto-refresh'
import { AppointmentReminderNotifier } from '@/components/appointment-reminder-notifier'

export const metadata = { title: 'Bugünün Randevuları — Technoscope Randevu' }

export default async function WidgetPage() {
  const { user } = await getCurrentUserAndProfile()
  if (!user) redirect('/login')

  const appointments = await getTodayAppointmentsForWidget()
  const todayLabel = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })

  return (
    <div className="flex h-screen flex-col bg-bg text-text-primary">
      <WidgetAutoRefresh />
      <AppointmentReminderNotifier />
      <div className="shrink-0 border-b border-border bg-surface-solid px-4 py-3.5">
        <div className="text-[11px] font-semibold tracking-[0.3px] text-text-secondary">{todayLabel}</div>
        <div className="text-[14.5px] font-bold">Bugünün Randevuları</div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {appointments.length === 0 && (
          <div className="mt-8 text-center text-[13px] text-text-secondary">Bugün randevu yok.</div>
        )}
        <div className="flex flex-col gap-2">
          {appointments.map((a) => {
            const style = STATUS_STYLE[a.status]
            const org = (a.organizations as unknown as { name: string } | null)?.name
            return (
              <div key={a.id} className="rounded-[10px] border border-border bg-surface-solid p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 text-[13px] font-semibold">{a.title}</div>
                  <span
                    className="shrink-0 rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-text-secondary">
                  {a.time?.slice(0, 5) ?? 'Saat yok'}
                  {org ? ` · ${org}` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
