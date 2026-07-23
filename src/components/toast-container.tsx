'use client'

import { useUiStore } from '@/store/ui'

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-in rounded-[11px] bg-text-primary px-5 py-[13px] text-[13.5px] font-semibold text-surface-solid shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
