'use client'

import Link from 'next/link'
import { useUiStore } from '@/store/ui'

export function QuickActions() {
  const openModal = useUiStore((s) => s.openModal)

  const items = [
    { label: 'Yeni Randevu', onClick: () => openModal('appointment') },
    { label: 'Yeni Kişi', onClick: () => openModal('contact') },
    { label: 'Yeni Kurum', onClick: () => openModal('organization') },
    { label: 'Yeni Görev', onClick: () => openModal('task') },
  ]

  return (
    <div className="mt-[18px] flex flex-wrap gap-2.5">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="rounded-[10px] border border-white/25 bg-white/[0.16] px-[15px] py-[9px] text-[13px] font-semibold text-white backdrop-blur-[6px] transition-all hover:-translate-y-px hover:bg-white/[0.26]"
        >
          {item.label}
        </button>
      ))}
      <Link
        href="/calendar"
        className="rounded-[10px] border border-white/25 bg-white/[0.16] px-[15px] py-[9px] text-[13px] font-semibold text-white backdrop-blur-[6px] transition-all hover:-translate-y-px hover:bg-white/[0.26]"
      >
        Takvimi Aç
      </Link>
    </div>
  )
}
