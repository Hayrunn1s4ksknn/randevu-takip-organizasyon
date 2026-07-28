'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUiStore } from '@/store/ui'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { AppointmentStatus, TaskStatus } from '@/types/database'

type AppointmentRow = { id: number; title: string; status: AppointmentStatus; created_by: string | null }
type TaskRow = { id: number; title: string; status: TaskStatus; created_by: string | null }

function isOwnChange(row: { created_by?: string | null } | undefined, userId: string) {
  return row?.created_by === userId
}

export function RealtimeNotifier({ userId }: { userId: string }) {
  const router = useRouter()
  const showToast = useUiStore((s) => s.showToast)
  const routerRef = useRef(router)
  const showToastRef = useRef(showToast)

  useEffect(() => {
    routerRef.current = router
    showToastRef.current = showToast
  }, [router, showToast])

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    // Postgres only ever sends the primary key in `old` for DELETE — even
    // with replica identity full — so deletions get a generic message and
    // skip the self-change check (best-effort: an own delete may show an
    // extra toast alongside the local one, which is harmless).
    function handleAppointmentChange(payload: RealtimePostgresChangesPayload<AppointmentRow>) {
      if (payload.eventType === 'DELETE') {
        showToastRef.current('Bir randevu silindi')
      } else if (!isOwnChange(payload.new, userId)) {
        if (payload.eventType === 'INSERT') {
          showToastRef.current(`Yeni randevu: ${payload.new.title}`)
        } else {
          const oldStatus = payload.old.status
          if (oldStatus && oldStatus !== payload.new.status) {
            showToastRef.current(`${payload.new.title}: ${payload.new.status}`)
          } else {
            showToastRef.current(`Randevu güncellendi: ${payload.new.title}`)
          }
        }
      }
      routerRef.current.refresh()
    }

    function handleTaskChange(payload: RealtimePostgresChangesPayload<TaskRow>) {
      if (payload.eventType === 'DELETE') {
        showToastRef.current('Bir görev silindi')
      } else if (!isOwnChange(payload.new, userId)) {
        if (payload.eventType === 'INSERT') {
          showToastRef.current(`Yeni görev: ${payload.new.title}`)
        } else {
          const oldStatus = payload.old.status
          if (oldStatus && oldStatus !== payload.new.status) {
            showToastRef.current(
              `${payload.new.title}: ${payload.new.status === 'done' ? 'tamamlandı' : 'yeniden açıldı'}`
            )
          } else {
            showToastRef.current(`Görev güncellendi: ${payload.new.title}`)
          }
        }
      }
      routerRef.current.refresh()
    }

    // @supabase/ssr's browser client doesn't authenticate the Realtime
    // websocket until the session promise resolves; subscribing before that
    // finishes means postgres_changes gets evaluated as the anon role and
    // RLS silently drops INSERT/UPDATE events. Set the token first.
    async function setup() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel('app-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          handleAppointmentChange as (
            payload: RealtimePostgresChangesPayload<Record<string, unknown>>
          ) => void
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          handleTaskChange as (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
        )
        .subscribe()
    }
    setup()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId])

  return null
}
