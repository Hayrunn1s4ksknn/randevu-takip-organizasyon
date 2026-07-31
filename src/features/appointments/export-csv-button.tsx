'use client'

import { toCsvRow } from '@/lib/csv'

type ExportRow = {
  title: string
  date: string
  time: string | null
  location: string | null
  status: string
  priority: string
  organizations: { name: string } | null
  assigned_profile: { full_name: string | null } | null
}

export function ExportCsvButton({ rows }: { rows: ExportRow[] }) {
  function download() {
    const header = ['Başlık', 'Kurum', 'Tarih', 'Saat', 'Konum', 'Öncelik', 'Durum', 'Sorumlu']
    const lines = rows.map((r) =>
      toCsvRow([
        r.title,
        r.organizations?.name ?? '',
        new Date(`${r.date}T00:00:00`).toLocaleDateString('tr-TR'),
        r.time?.slice(0, 5) ?? '',
        r.location ?? '',
        r.priority,
        r.status,
        r.assigned_profile?.full_name ?? '',
      ])
    )
    const csv = ['﻿' + header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `randevular_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="rounded-[9px] border border-border bg-surface-solid px-3.5 py-[9px] text-[12.5px] font-semibold"
    >
      CSV
    </button>
  )
}
