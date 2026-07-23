'use client'

import { useUiStore } from '@/store/ui'

export function NewOrganizationButton() {
  const openModal = useUiStore((s) => s.openModal)
  return (
    <button
      onClick={() => openModal('organization')}
      className="hidden rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-white md:inline-flex"
    >
      + Yeni Kurum
    </button>
  )
}
