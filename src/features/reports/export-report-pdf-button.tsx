'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pdfSafe } from '@/lib/pdf'

type Props = {
  topOrgs: { name: string; count: number }[]
  topStaff: { name: string; count: number }[]
  yearly: { label: string; count: number }[]
}

function addSection(doc: jsPDF, title: string, head: string[], body: string[][]) {
  doc.setFontSize(13)
  doc.text(pdfSafe(title), 14, 18)
  autoTable(doc, {
    startY: 22,
    head: [head.map(pdfSafe)],
    body: body.map((row) => row.map(pdfSafe)),
  })
}

export function ExportReportPdfButton({ topOrgs, topStaff, yearly }: Props) {
  function download() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(pdfSafe('Randevu Raporu'), 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(
      pdfSafe(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })),
      14,
      25
    )
    doc.setTextColor(0)
    doc.setFontSize(13)
    doc.text(pdfSafe('En Aktif Kurumlar'), 14, 36)
    autoTable(doc, {
      startY: 40,
      head: [['Kurum', 'Randevu Sayısı'].map(pdfSafe)],
      body: topOrgs.map((o) => [pdfSafe(o.name), String(o.count)]),
    })

    doc.addPage()
    addSection(
      doc,
      'En Aktif Personel',
      ['Personel', 'Randevu Sayısı'],
      topStaff.map((s) => [s.name, String(s.count)])
    )

    doc.addPage()
    addSection(
      doc,
      'Yıllık Performans',
      ['Yıl', 'Randevu Sayısı'],
      yearly.map((y) => [y.label, String(y.count)])
    )

    doc.save(`rapor_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <button
      onClick={download}
      className="rounded-[9px] border border-border bg-surface-solid px-3.5 py-[9px] text-[12.5px] font-semibold"
    >
      PDF olarak indir
    </button>
  )
}
