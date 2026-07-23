'use client'

import { usePathname } from 'next/navigation'
import { useUiStore, type ModalKey } from '@/store/ui'

const MODAL_BY_PATH: { prefix: string; modal: ModalKey }[] = [
  { prefix: '/appointments', modal: 'appointment' },
  { prefix: '/contacts', modal: 'contact' },
  { prefix: '/organizations', modal: 'organization' },
]

export function Fab() {
  const pathname = usePathname()
  const openModal = useUiStore((s) => s.openModal)

  const match = MODAL_BY_PATH.find((m) => pathname.startsWith(m.prefix))
  if (!match) return null

  return (
    <button
      onClick={() => openModal(match.modal)}
      aria-label="Yeni ekle"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-lg md:hidden"
    >
      +
    </button>
  )
}
