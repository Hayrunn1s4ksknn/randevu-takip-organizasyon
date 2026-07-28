'use client'

import writeExcelFile from 'write-excel-file/browser'

type ExportRow = {
  title: string
  date: string
  time: string | null
  location: string | null
  status: string
  priority: string
  organizations: { name: string } | null
}

const columns = [
  { header: 'Başlık', cell: (r: ExportRow) => ({ value: r.title }), width: 30 },
  { header: 'Kurum', cell: (r: ExportRow) => ({ value: r.organizations?.name ?? '' }), width: 26 },
  {
    header: 'Tarih',
    cell: (r: ExportRow) => ({ value: new Date(`${r.date}T00:00:00`), type: Date, format: 'dd/mm/yyyy' }),
    width: 14,
  },
  { header: 'Saat', cell: (r: ExportRow) => ({ value: r.time?.slice(0, 5) ?? '' }), width: 10 },
  { header: 'Konum', cell: (r: ExportRow) => ({ value: r.location ?? '' }), width: 22 },
  { header: 'Öncelik', cell: (r: ExportRow) => ({ value: r.priority }), width: 12 },
  { header: 'Durum', cell: (r: ExportRow) => ({ value: r.status }), width: 16 },
]

export function ExportExcelButton({ rows }: { rows: ExportRow[] }) {
  async function download() {
    await writeExcelFile(rows, { columns, sheet: 'Randevular' }).toFile(
      `randevular_${new Date().toISOString().slice(0, 10)}.xlsx`
    )
  }

  return (
    <button
      onClick={download}
      className="rounded-[9px] border border-border bg-surface-solid px-3.5 py-[9px] text-[12.5px] font-semibold"
    >
      Excel
    </button>
  )
}
