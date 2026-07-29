'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Menu, House, Settings, Sun, Moon } from 'lucide-react'
import { useUiStore } from '@/store/ui'
import { toggleDarkMode } from '@/features/settings/actions'
import { UserMenu } from '@/components/user-menu'

export function Topbar({
  pageTitle,
  isDark,
  fullName,
  email,
}: {
  pageTitle: string
  isDark: boolean
  fullName: string
  email: string
}) {
  const openSearch = useUiStore((s) => s.openSearch)
  const openMobileNav = useUiStore((s) => s.openMobileNav)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-solid px-4 md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3.5">
        <button
          onClick={openMobileNav}
          aria-label="Menü"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] md:hidden"
        >
          <Menu size={22} />
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
      <div className="ml-2.5 flex shrink-0 items-center gap-2 md:gap-2.5">
        <Link
          href="/dashboard"
          title="Ana Sayfa"
          className="hidden h-11 w-11 items-center justify-center rounded-[9px] border border-border bg-bg text-text-secondary hover:border-accent hover:text-accent sm:flex"
        >
          <House size={19} />
        </Link>
        <Link
          href="/settings"
          title="Ayarlar"
          className="hidden h-11 w-11 items-center justify-center rounded-[9px] border border-border bg-bg text-text-secondary hover:border-accent hover:text-accent sm:flex"
        >
          <Settings size={19} />
        </Link>
        <button
          onClick={() => startTransition(() => toggleDarkMode(!isDark))}
          disabled={pending}
          title="Tema değiştir"
          className="flex h-11 w-11 items-center justify-center rounded-[9px] border border-border bg-bg text-text-secondary disabled:opacity-60"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <UserMenu fullName={fullName} email={email} />
      </div>
    </div>
  )
}
