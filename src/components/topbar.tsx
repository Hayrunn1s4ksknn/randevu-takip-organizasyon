'use client'

import { useTransition } from 'react'
import { useUiStore } from '@/store/ui'
import { toggleDarkMode } from '@/features/settings/actions'

export function Topbar({
  pageTitle,
  isDark,
  fullName,
}: {
  pageTitle: string
  isDark: boolean
  fullName: string
}) {
  const openSearch = useUiStore((s) => s.openSearch)
  const openMobileNav = useUiStore((s) => s.openMobileNav)
  const [pending, startTransition] = useTransition()
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-solid px-4 md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3.5">
        <button
          onClick={openMobileNav}
          aria-label="Menü"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] text-lg md:hidden"
        >
          ☰
        </button>
        <div className="hidden shrink-0 text-base font-bold text-text-primary sm:block">{pageTitle}</div>
        <button
          onClick={openSearch}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[9px] border border-border bg-bg px-3 py-1.5 text-[13px] text-text-secondary hover:border-accent md:w-[260px] md:flex-none"
        >
          <span>Ara...</span>
          <span className="ml-auto hidden rounded-[5px] border border-border bg-surface-solid px-1.5 py-0.5 text-[11px] sm:inline">
            ⌘K
          </span>
        </button>
      </div>
      <div className="ml-2.5 flex shrink-0 items-center gap-2.5 md:gap-3.5">
        <button
          onClick={() => startTransition(() => toggleDarkMode(!isDark))}
          disabled={pending}
          title="Tema değiştir"
          className="flex h-11 w-11 items-center justify-center rounded-[9px] border border-border bg-bg text-[15px] disabled:opacity-60"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">
          {initials || '?'}
        </div>
      </div>
    </div>
  )
}
