'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TABS = [
  { value: 'all', label: 'Tümü' },
  { value: 'todo', label: 'Açık' },
  { value: 'done', label: 'Tamamlanan' },
] as const

export function TaskFilterTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('status') ?? 'all'

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => router.push(tab.value === 'all' ? '/tasks' : `/tasks?status=${tab.value}`)}
          className="rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold"
          style={{
            borderColor: active === tab.value ? 'var(--color-accent)' : 'var(--color-border)',
            background: active === tab.value ? 'var(--color-accent-bg)' : 'transparent',
            color: active === tab.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
