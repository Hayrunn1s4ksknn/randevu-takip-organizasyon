'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/store/ui'
import { STATUS_STYLE, PRIORITY_STYLE } from '@/lib/status-styles'
import { onActivateKey } from '@/lib/a11y'
import { bulkUpdateAppointmentStatus } from './actions'
import type { AppointmentPriority, AppointmentStatus } from '@/types/database'

type Row = {
  id: number
  title: string
  date: string
  time: string | null
  location: string | null
  status: AppointmentStatus
  priority: AppointmentPriority
  organizations: { name: string } | null
}

export function AppointmentsTable({ rows }: { rows: Row[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const openDrawer = useUiStore((s) => s.openDrawer)
  const showToast = useUiStore((s) => s.showToast)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
  }
  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function runBulk(status: AppointmentStatus, label: string) {
    const ids = [...selectedIds]
    startTransition(async () => {
      await bulkUpdateAppointmentStatus(ids, status)
      setSelectedIds(new Set())
      showToast(label)
      router.refresh()
    })
  }

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-accent bg-accent-bg px-4 py-2.5 text-[13px]">
          <span>
            <strong>{selectedIds.size}</strong> randevu seçildi
          </span>
          <button
            disabled={pending}
            onClick={() => runBulk('Tamamlandı', 'Seçili randevular tamamlandı olarak işaretlendi')}
            className="ml-auto cursor-pointer font-semibold text-success disabled:opacity-50"
          >
            Tamamlandı yap
          </button>
          <button
            disabled={pending}
            onClick={() => runBulk('İptal Edildi', 'Seçili randevular iptal edildi')}
            className="cursor-pointer font-semibold text-danger disabled:opacity-50"
          >
            İptal et
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="cursor-pointer font-semibold text-text-secondary"
          >
            Vazgeç
          </button>
        </div>
      )}

      {rows.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface-solid px-5 py-8 text-center text-[13px] text-text-secondary">
          Kayıt bulunamadı.
        </div>
      )}

      {/* Desktop table */}
      {rows.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface-solid md:block">
          <div className="grid grid-cols-[36px_1.6fr_1fr_0.8fr_1fr_1fr_0.9fr] gap-2.5 border-b border-border px-5 py-3 text-[11.5px] font-bold text-text-secondary">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <div>Başlık</div>
            <div>Kurum</div>
            <div>Tarih</div>
            <div>Saat</div>
            <div>Öncelik</div>
            <div>Durum</div>
          </div>

          {rows.map((r) => {
            const statusStyle = STATUS_STYLE[r.status]
            const prioStyle = PRIORITY_STYLE[r.priority]
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => openDrawer(r.id)}
                onKeyDown={onActivateKey(() => openDrawer(r.id))}
                className="grid cursor-pointer grid-cols-[36px_1.6fr_1fr_0.8fr_1fr_1fr_0.9fr] items-center gap-2.5 border-b border-border px-5 py-3.5 text-[13px] last:border-b-0 hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleOne(r.id)}
                />
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">{r.title}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-text-secondary">
                  {r.organizations?.name ?? '-'}
                </div>
                <div className="text-text-secondary">
                  {new Date(`${r.date}T00:00:00`).toLocaleDateString('tr-TR')}
                </div>
                <div className="text-text-secondary">{r.time?.slice(0, 5) ?? '-'}</div>
                <div>
                  <span
                    className="rounded-[6px] px-2.5 py-[3px] text-[11px] font-bold"
                    style={{ background: prioStyle.bg, color: prioStyle.color }}
                  >
                    {r.priority}
                  </span>
                </div>
                <div>
                  <span
                    className="rounded-[7px] px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile cards */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-2.5 md:hidden">
          {rows.map((r) => {
            const statusStyle = STATUS_STYLE[r.status]
            const prioStyle = PRIORITY_STYLE[r.priority]
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => openDrawer(r.id)}
                onKeyDown={onActivateKey(() => openDrawer(r.id))}
                className="cursor-pointer rounded-2xl border border-border bg-surface-solid p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleOne(r.id)}
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate text-[13.5px] font-semibold">{r.title}</div>
                      <span
                        className="shrink-0 rounded-[7px] px-2 py-0.5 text-[10.5px] font-bold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-text-secondary">
                      {r.organizations?.name ?? '-'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-text-secondary">
                      <span>{new Date(`${r.date}T00:00:00`).toLocaleDateString('tr-TR')}</span>
                      <span>{r.time?.slice(0, 5) ?? '-'}</span>
                      <span
                        className="rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: prioStyle.bg, color: prioStyle.color }}
                      >
                        {r.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
