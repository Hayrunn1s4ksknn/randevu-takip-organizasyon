'use client'

import { useEffect } from 'react'

export const NOTIF_STORAGE_KEY = 'technoscope-appointment-notifications'

type TodayAppointment = { id: number; title: string; time: string }

function notify(title: string, body: string) {
  const n = new Notification(title, { body, icon: '/manifest-icons/192', tag: title })
  n.onclick = () => {
    window.focus()
    n.close()
  }
}

// Purely client-side reminders — no server push involved. Only fires while
// this tab/PWA window is open (browsers still surface `Notification` as a
// real desktop/OS-level notification even if the tab isn't focused, it just
// can't wake the app up from fully closed). Re-polls periodically so
// appointments created later in the day still get scheduled.
export function AppointmentReminderNotifier() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(NOTIF_STORAGE_KEY) !== '1') return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

    let cancelled = false
    let timers: ReturnType<typeof setTimeout>[] = []

    async function scheduleAll() {
      try {
        const res = await fetch('/api/appointments/today')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        timers.forEach(clearTimeout)
        timers = []

        const appointments: TodayAppointment[] = data.appointments ?? []
        const now = Date.now()

        for (const appt of appointments) {
          const [h, m, s] = appt.time.split(':').map(Number)
          const target = new Date()
          target.setHours(h, m, s || 0, 0)
          const approachAt = target.getTime() - 15 * 60 * 1000

          if (approachAt > now) {
            timers.push(
              setTimeout(
                () => notify(`Yaklaşan randevu: ${appt.title}`, '15 dakika sonra başlıyor'),
                approachAt - now
              )
            )
          }
          if (target.getTime() > now) {
            timers.push(
              setTimeout(
                () => notify(`Randevu zamanı: ${appt.title}`, 'Şimdi başlıyor'),
                target.getTime() - now
              )
            )
          }
        }
      } catch {
        // best-effort — a failed fetch just means no reminders this cycle
      }
    }

    scheduleAll()
    // Re-poll so appointments created/edited after the tab was opened still
    // get picked up during the rest of the day.
    const interval = setInterval(scheduleAll, 15 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [])

  return null
}
