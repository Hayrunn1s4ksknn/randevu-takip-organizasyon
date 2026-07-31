'use client'

import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/store/ui'
import { useSwipeToClose } from '@/hooks/use-swipe-to-close'
import { STATUS_STYLE } from '@/lib/status-styles'
import type { AppointmentStatus, MeetingType } from '@/types/database'

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
    meeting_type: MeetingType | null
    duration_minutes: number | null
    assigned_to: string | null
    organizations: { name: string; email: string | null } | null
    assigned_profile: { full_name: string | null } | null
  }
  participants: { id: number; name: string }[]
  notes: { id: number; body: string; created_at: string; profiles: { full_name: string | null } | null }[]
  comments: { id: number; body: string; created_at: string; profiles: { full_name: string | null } | null }[]
  files: {
    id: number
    file_name: string
    size_bytes: number
    mime_type: string | null
    created_at: string
    profiles: { full_name: string | null } | null
  }[]
  statusHistory: {
    id: number
    from_status: AppointmentStatus | null
    to_status: AppointmentStatus
    changed_at: string
    profiles: { full_name: string | null } | null
  }[]
  emails: {
    id: number
    to_email: string
    subject: string
    body: string
    kind: 'manual' | 'confirmation' | 'reminder'
    sent_at: string
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilesTab({
  appointmentId,
  files,
  onChanged,
}: {
  appointmentId: number
  files: DrawerData['files']
  onChanged: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/appointments/${appointmentId}/files`, { method: 'POST', body: formData })
    setUploading(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Dosya yüklenemedi.')
      return
    }
    onChanged()
  }

  async function handleDelete(fileId: number) {
    if (!confirm('Bu dosyayı silmek istediğine emin misin?')) return
    await fetch(`/api/appointments/${appointmentId}/files/${fileId}`, { method: 'DELETE' })
    onChanged()
  }

  return (
    <div>
      <label className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white">
        {uploading ? 'Yükleniyor...' : '+ Dosya Yükle'}
        <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
      </label>
      {error && <p className="mb-3 text-[12.5px] font-medium text-danger">{error}</p>}

      {files.length === 0 && <p className="text-[13px] text-text-secondary">Henüz dosya yok.</p>}
      <div className="flex flex-col gap-2.5">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between gap-2 rounded-[9px] border border-border p-2.5"
          >
            <div className="min-w-0">
              <a
                href={`/api/appointments/${appointmentId}/files/${f.id}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-accent hover:underline"
              >
                {f.file_name}
              </a>
              <div className="text-[11px] text-text-secondary">
                {formatBytes(f.size_bytes)} · {f.profiles?.full_name ?? 'Sistem'} ·{' '}
                {new Date(f.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <button
              onClick={() => handleDelete(f.id)}
              className="shrink-0 rounded-[9px] border border-danger px-2.5 py-1 text-[11.5px] font-bold text-danger"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MailTab({
  appointmentId,
  defaultTo,
  emails,
  onChanged,
}: {
  appointmentId: number
  defaultTo: string
  emails: DrawerData['emails']
  onChanged: () => void
}) {
  const [to, setTo] = useState(defaultTo)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setPending(true)
    setError(null)
    const res = await fetch(`/api/appointments/${appointmentId}/mail`, {
      method: 'POST',
      body: JSON.stringify({ to, subject, body }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Mail gönderilemedi.')
      return
    }
    setSubject('')
    setBody('')
    onChanged()
  }

  const sentEmails = emails.filter((e) => e.kind !== 'reminder')

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 rounded-[10px] border border-border p-3">
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Kime"
          className="rounded-[9px] border border-border bg-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Konu"
          className="rounded-[9px] border border-border bg-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Mesaj"
          rows={3}
          className="rounded-[9px] border border-border bg-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
        />
        {error && <p className="text-[12.5px] font-medium text-danger">{error}</p>}
        <button
          onClick={handleSend}
          disabled={pending || !to.trim() || !subject.trim() || !body.trim()}
          className="self-end rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
        >
          {pending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>

      {sentEmails.length === 0 && <p className="text-[13px] text-text-secondary">Henüz mail gönderilmedi.</p>}
      <div className="flex flex-col gap-2.5">
        {sentEmails.map((e) => (
          <div key={e.id} className="rounded-[9px] border border-border p-2.5 text-[13px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{e.subject}</span>
              <span className="shrink-0 text-[10.5px] text-text-secondary">
                {new Date(e.sent_at).toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="text-[11.5px] text-text-secondary">Kime: {e.to_email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReminderTab({
  appointment,
  emails,
}: {
  appointment: DrawerData['appointment']
  emails: DrawerData['emails']
}) {
  const reminders = emails.filter((e) => e.kind === 'reminder')

  return (
    <div>
      <p className="mb-4 text-[13px] text-text-secondary">
        Randevu tarihinden bir gün önce
        {appointment.organizations?.email
          ? ` kurumun e-posta adresine (${appointment.organizations.email})`
          : ', kurumun e-posta adresi tanımlıysa,'}{' '}
        otomatik hatırlatma maili gönderilir.
      </p>
      {reminders.length === 0 && (
        <p className="text-[13px] text-text-secondary">Henüz hatırlatma gönderilmedi.</p>
      )}
      <div className="flex flex-col gap-2.5">
        {reminders.map((e) => (
          <div key={e.id} className="rounded-[9px] border border-border p-2.5 text-[13px]">
            <div className="font-semibold">{e.subject}</div>
            <div className="text-[11.5px] text-text-secondary">
              {e.to_email} · {new Date(e.sent_at).toLocaleString('tr-TR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MeetingDetailsEditor({
  appointmentId,
  meetingType,
  durationMinutes,
  onChanged,
}: {
  appointmentId: number
  meetingType: MeetingType | null
  durationMinutes: number | null
  onChanged: () => void
}) {
  const [type, setType] = useState(meetingType ?? '')
  const [duration, setDuration] = useState(durationMinutes?.toString() ?? '')
  const [pending, setPending] = useState(false)

  async function handleSave() {
    setPending(true)
    await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        meeting_type: type || null,
        duration_minutes: duration ? Number(duration) : null,
      }),
    })
    setPending(false)
    onChanged()
  }

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as MeetingType | '')}
        className="rounded-[7px] border border-border bg-bg px-2 py-1 text-[11.5px]"
      >
        <option value="">Toplantı tipi yok</option>
        <option value="Online">Online</option>
        <option value="Fiziksel">Fiziksel</option>
        <option value="Telefon">Telefon</option>
      </select>
      <input
        type="number"
        min={1}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Süre (dk)"
        className="w-[90px] rounded-[7px] border border-border bg-bg px-2 py-1 text-[11.5px]"
      />
      <button
        onClick={handleSave}
        disabled={pending}
        className="rounded-[7px] border border-accent px-2.5 py-1 text-[11.5px] font-bold text-accent disabled:opacity-50"
      >
        Kaydet
      </button>
    </div>
  )
}

function AssignedToEditor({
  appointmentId,
  assignedTo,
  staffOptions,
  onChanged,
}: {
  appointmentId: number
  assignedTo: string | null
  staffOptions: { id: string; name: string }[]
  onChanged: () => void
}) {
  const [value, setValue] = useState(assignedTo ?? '')
  const [pending, setPending] = useState(false)

  async function handleChange(next: string) {
    setValue(next)
    setPending(true)
    await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: next || null }),
    })
    setPending(false)
    onChanged()
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="mt-2 rounded-[7px] border border-border bg-bg px-2 py-1 text-[11.5px] disabled:opacity-50"
    >
      <option value="">Sorumlu atanmadı</option>
      {staffOptions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}

function ParticipantsTab({
  appointmentId,
  participants,
  contactOptions,
  onChanged,
}: {
  appointmentId: number
  participants: DrawerData['participants']
  contactOptions: { id: number; name: string }[]
  onChanged: () => void
}) {
  const [selected, setSelected] = useState('')
  const [pending, setPending] = useState(false)

  const available = contactOptions.filter((c) => !participants.some((p) => p.id === c.id))

  async function handleAdd() {
    if (!selected) return
    setPending(true)
    await fetch(`/api/appointments/${appointmentId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ contact_id: Number(selected) }),
    })
    setSelected('')
    setPending(false)
    onChanged()
  }

  async function handleRemove(contactId: number) {
    await fetch(`/api/appointments/${appointmentId}/participants/${contactId}`, { method: 'DELETE' })
    onChanged()
  }

  return (
    <div>
      {available.length > 0 ? (
        <div className="mb-4 flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-[9px] border border-border bg-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
          >
            <option value="">Kişi seçin</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={pending || !selected}
            className="rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      ) : (
        <p className="mb-4 text-[12.5px] text-text-secondary">
          {contactOptions.length === 0
            ? 'Henüz kayıtlı kişi yok.'
            : 'Kayıtlı tüm kişiler zaten katılımcı olarak eklenmiş.'}
        </p>
      )}

      {participants.length === 0 && <p className="text-[13px] text-text-secondary">Katılımcı eklenmemiş.</p>}
      <div className="flex flex-col gap-2.5">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 text-[13px]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {p.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
            <span className="flex-1">{p.name}</span>
            <button
              onClick={() => handleRemove(p.id)}
              className="shrink-0 rounded-[7px] border border-danger px-2 py-1 text-[11px] font-bold text-danger"
            >
              Kaldır
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AppointmentDrawer({
  contactOptions,
  staffOptions,
}: {
  contactOptions: { id: number; name: string }[]
  staffOptions: { id: string; name: string }[]
}) {
  const drawerApptId = useUiStore((s) => s.drawerApptId)
  const closeDrawer = useUiStore((s) => s.closeDrawer)
  const [tab, setTab] = useState<TabKey>('notlar')
  const queryClient = useQueryClient()
  const swipeHandlers = useSwipeToClose(closeDrawer)

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
      <div
        {...swipeHandlers}
        className="animate-slide-in fixed right-0 top-0 z-[41] flex h-full w-[440px] max-w-[92vw] flex-col bg-surface-solid shadow-2xl"
      >
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
            {a && drawerApptId !== null && (
              <MeetingDetailsEditor
                appointmentId={drawerApptId}
                meetingType={a.meeting_type}
                durationMinutes={a.duration_minutes}
                onChanged={invalidate}
              />
            )}
            {a && drawerApptId !== null && (
              <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-text-secondary">
                <span>Sorumlu:</span>
                <AssignedToEditor
                  appointmentId={drawerApptId}
                  assignedTo={a.assigned_to}
                  staffOptions={staffOptions}
                  onChanged={invalidate}
                />
              </div>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="flex h-11 w-11 items-center justify-center text-xl leading-none text-text-secondary"
          >
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

          {data && tab === 'dosyalar' && drawerApptId !== null && (
            <FilesTab appointmentId={drawerApptId} files={data.files} onChanged={invalidate} />
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

          {data && tab === 'katilimcilar' && drawerApptId !== null && (
            <ParticipantsTab
              appointmentId={drawerApptId}
              participants={data.participants}
              contactOptions={contactOptions}
              onChanged={invalidate}
            />
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
            <ReminderTab appointment={data.appointment} emails={data.emails} />
          )}

          {data && tab === 'mail' && drawerApptId !== null && (
            <MailTab
              appointmentId={drawerApptId}
              defaultTo={data.appointment.organizations?.email ?? ''}
              emails={data.emails}
              onChanged={invalidate}
            />
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
