'use client'

import { useUiStore } from '@/store/ui'

export function NewContactButton() {
  const openModal = useUiStore((s) => s.openModal)
  return (
    <button
      onClick={() => openModal('contact')}
      className="rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-white"
    >
      + Yeni Kişi
    </button>
  )
}
