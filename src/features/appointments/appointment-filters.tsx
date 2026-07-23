'use client'

import { useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_OPTIONS = ['Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi']

export function AppointmentFilters({ orgOptions }: { orgOptions: { id: number; name: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)

  function submit() {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    const params = new URLSearchParams()
    ;['q', 'status', 'org'].forEach((key) => {
      const value = formData.get(key)
      if (value) params.set(key, String(value))
    })
    router.push(`/appointments?${params.toString()}`)
  }

  return (
    <form ref={formRef} className="flex flex-1 flex-wrap gap-2.5">
      <input
        name="q"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={submit}
        placeholder="Randevu başlığı ara..."
        className="min-w-[220px] flex-1 rounded-[10px] border border-border bg-surface-solid px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
      />
      <select
        name="status"
        defaultValue={searchParams.get('status') ?? 'all'}
        onChange={submit}
        className="rounded-[10px] border border-border bg-surface-solid px-3 py-2.5 text-[13px]"
      >
        <option value="all">Tüm Durumlar</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        name="org"
        defaultValue={searchParams.get('org') ?? 'all'}
        onChange={submit}
        className="rounded-[10px] border border-border bg-surface-solid px-3 py-2.5 text-[13px]"
      >
        <option value="all">Tüm Kurumlar</option>
        {orgOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </form>
  )
}
