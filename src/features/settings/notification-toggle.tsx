'use client'

import { useEffect, useState } from 'react'
import { NOTIF_STORAGE_KEY } from '@/components/appointment-reminder-notifier'

export function NotificationToggle() {
  const [enabled, setEnabled] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const [denied, setDenied] = useState(false)

  function readNotificationState() {
    if (typeof Notification === 'undefined') {
      setUnsupported(true)
      return
    }
    setEnabled(localStorage.getItem(NOTIF_STORAGE_KEY) === '1' && Notification.permission === 'granted')
    setDenied(Notification.permission === 'denied')
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser-only Notification API on mount
    readNotificationState()
  }, [])

  async function handleToggle() {
    if (unsupported) return
    if (enabled) {
      localStorage.setItem(NOTIF_STORAGE_KEY, '0')
      setEnabled(false)
      return
    }

    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    if (permission !== 'granted') {
      setDenied(permission === 'denied')
      return
    }
    localStorage.setItem(NOTIF_STORAGE_KEY, '1')
    setEnabled(true)
    // Reload so AppointmentReminderNotifier (mounted once at app shell level)
    // picks up the freshly-granted permission without needing a manual refresh.
    window.location.reload()
  }

  if (unsupported) {
    return (
      <p className="text-[12.5px] text-text-secondary">Bu tarayıcı masaüstü bildirimlerini desteklemiyor.</p>
    )
  }

  return (
    <div>
      <div
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        className="relative h-[22px] w-10 cursor-pointer rounded-xl transition-colors"
        style={{ background: enabled ? 'var(--color-accent)' : 'var(--color-border)' }}
      >
        <div
          className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all"
          style={{ left: enabled ? '20px' : '2px' }}
        />
      </div>
      {denied && (
        <p className="mt-2 text-[12px] text-danger">
          Bildirim izni engellenmiş. Tarayıcı ayarlarından bu site için bildirimlere izin vermen gerekiyor.
        </p>
      )}
    </div>
  )
}
