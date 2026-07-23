'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/store/ui'
import { STATUS_STYLE } from '@/lib/status-styles'
import type { AppointmentStatus } from '@/types/database'

const TABS = [
  { key: 'notlar', label: 'Notlar' },
  { key: 'dosyalar', label: 'Dosyalar' },
  { key: 'yorumlar', label: 'Yorumlar' },
  { key: 'katilimcilar', label: 'Katılımcılar' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'hatirlaticilar', label: 'Hatırlatıcılar' },
  { key: 'mail', label: 'Mail' },
  { key: 'durum', label: 'Durum Geçmişi' },
] as const
type TabKey = (typeof TABS)[number]['key']

type DrawerData = {
  appointment: {
    id: number
    title: string
    date: string
    time: string | null
    location: string | null
    status: AppointmentStatus
    organizations: { name: string } | null
  }
  participants: { id: number; name: string }[]
  notes: { id: number; body: string; created_at: string; profiles: { full_name: string | null } | null }[]
  comments: { id: number; body: string; created_at: string; profiles: { full_name: string | null } | null }[]
  statusHistory: {
    id: number
    from_status: AppointmentStatus | null
    to_status: AppointmentStatus
    changed_at: string
    profiles: { full_name: string | null } | null
  }[]
}

function ComposeBox({
  placeholder,
  onSubmit,
}: {
  placeholder: string
  onSubmit: (body: string) => Promise<void>
}) {
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <div className="mb-4 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-[9px] border border-border bg-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
      />
      <button
        disabled={pending || !value.trim()}
        onClick={async () => {
          setPending(true)
          await onSubmit(value.trim())
          setValue('')
          setPending(false)
        }}
        className="rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
      >
        Ekle
      </button>
    </div>
  )
}

export function AppointmentDrawer() {
  const drawerApptId = useUiStore((s) => s.drawerApptId)
  const closeDrawer = useUiStore((s) => s.closeDrawer)
  const [tab, setTab] = useState<TabKey>('notlar')
  const queryClient = useQueryClient()

  const { data } = useQuery<DrawerData>({
    queryKey: ['appointment-detail', drawerApptId],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${drawerApptId}`)
      return res.json()
    },
    enabled: drawerApptId !== null,
  })

  if (drawerApptId === null) return null

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['appointment-detail', drawerApptId] })

  const a = data?.appointment
  const statusStyle = a ? STATUS_STYLE[a.status] : null

  return (
    <>
      <div onClick={closeDrawer} className="fixed inset-0 z-40 bg-black/35" />
      <div className="animate-slide-in fixed right-0 top-0 z-[41] flex h-full w-[440px] max-w-[92vw] flex-col bg-surface-solid shadow-2xl">
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <div className="text-[17px] font-bold">{a?.title ?? '...'}</div>
            {a && (
              <div className="mt-1 text-[12.5px] text-text-secondary">
                {new Date(`${a.date}T00:00:00`).toLocaleDateString('tr-TR')}
                {a.time ? ` · ${a.time.slice(0, 5)}` : ''}
                {a.location ? ` · ${a.location}` : ''}
              </div>
            )}
            {a && statusStyle && (
              <span
                className="mt-2 inline-block rounded-[7px] px-2.5 py-1 text-[11.5px] font-bold"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {a.status}
              </span>
            )}
          </div>
          <button onClick={closeDrawer} className="text-xl leading-none text-text-secondary">
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border px-6 pt-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-2 text-xs font-semibold"
              style={{
                borderBottom: `2px solid ${tab === t.key ? 'var(--color-accent)' : 'transparent'}`,
                color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {!data && <p className="text-[13px] text-text-secondary">Yükleniyor...</p>}

          {data && tab === 'notlar' && (
            <div>
              <ComposeBox
                placeholder="Not ekle..."
                onSubmit={async (body) => {
                  await fetch(`/api/appointments/${drawerApptId}/notes`, {
                    method: 'POST',
                    body: JSON.stringify({ body }),
                  })
                  invalidate()
                }}
              />
              <div className="flex flex-col gap-3">
                {data.notes.length === 0 && <p className="text-[13px] text-text-secondary">Henüz not yok.</p>}
                {data.notes.map((n) => (
                  <div key={n.id} className="text-[13px] leading-relaxed">
                    <div>{n.body}</div>
                    <div className="mt-0.5 text-[11px] text-text-secondary">
                      {n.profiles?.full_name ?? 'Sistem'} · {new Date(n.created_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && tab === 'dosyalar' && (
            <p className="text-[13px] text-text-secondary">
              Dosya yükleme Faz 2&apos;de Supabase Storage ile eklenecek.
            </p>
          )}

          {data && tab === 'yorumlar' && (
            <div>
              <ComposeBox
                placeholder="Yorum ekle..."
                onSubmit={async (body) => {
                  await fetch(`/api/appointments/${drawerApptId}/comments`, {
                    method: 'POST',
                    body: JSON.stringify({ body }),
                  })
                  invalidate()
                }}
              />
              <div className="flex flex-col gap-3">
                {data.comments.length === 0 && (
                  <p className="text-[13px] text-text-secondary">Henüz yorum yok.</p>
                )}
                {data.comments.map((c) => (
                  <div key={c.id} className="text-[13px]">
                    <strong>{c.profiles?.full_name ?? 'Sistem'}:</strong> {c.body}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && tab === 'katilimcilar' && (
            <div className="flex flex-col gap-2.5">
              {data.participants.length === 0 && (
                <p className="text-[13px] text-text-secondary">Katılımcı eklenmemiş.</p>
              )}
              {data.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 text-[13px]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                    {p.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  {p.name}
                </div>
              ))}
            </div>
          )}

          {data && tab === 'timeline' && (
            <div className="flex flex-col gap-3.5 border-l-2 border-border pl-3.5">
              {[...data.statusHistory]
                .sort((x, y) => new Date(x.changed_at).getTime() - new Date(y.changed_at).getTime())
                .map((h) => (
                  <div key={h.id}>
                    <div className="text-[12.5px] font-bold">
                      {h.from_status
                        ? `${h.from_status} → ${h.to_status}`
                        : `${h.to_status} olarak oluşturuldu`}
                    </div>
                    <div className="text-[11.5px] text-text-secondary">
                      {new Date(h.changed_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {data && tab === 'hatirlaticilar' && (
            <p className="text-[13px] text-text-secondary">
              Otomatik hatırlatma e-postaları Faz 2&apos;de eklenecek.
            </p>
          )}

          {data && tab === 'mail' && (
            <p className="text-[13px] text-text-secondary">Mail entegrasyonu Faz 2&apos;de eklenecek.</p>
          )}

          {data && tab === 'durum' && (
            <div className="flex flex-col gap-2.5 text-[13px]">
              {data.statusHistory.map((h) => (
                <div key={h.id}>
                  {h.from_status ? `${h.from_status} → ${h.to_status}` : `Oluşturuldu: ${h.to_status}`}{' '}
                  <span className="text-text-secondary">
                    ({new Date(h.changed_at).toLocaleDateString('tr-TR')})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
