'use client'

import { useUiStore } from '@/store/ui'
import { STATUS_STYLE } from '@/lib/status-styles'
import type { AppointmentStatus } from '@/types/database'

export function AppointmentChip({
  id,
  title,
  status,
}: {
  id: number
  title: string
  status: AppointmentStatus
}) {
  const openDrawer = useUiStore((s) => s.openDrawer)
  const style = STATUS_STYLE[status]

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        openDrawer(id)
      }}
      title={title}
      className="cursor-pointer truncate rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {title}
    </div>
  )
}
