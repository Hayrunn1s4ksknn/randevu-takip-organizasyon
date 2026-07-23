'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUiStore } from '@/store/ui'

const ITEMS = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/appointments', label: 'Randevular', icon: '📅' },
  { href: '/calendar', label: 'Takvim', icon: '🗓️' },
  { href: '/contacts', label: 'Kişiler', icon: '👥' },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const openMobileNav = useUiStore((s) => s.openMobileNav)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface-solid md:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium"
            style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
      <button
        onClick={openMobileNav}
        className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium text-text-secondary"
      >
        <span className="text-base leading-none">⋯</span>
        Daha Fazla
      </button>
    </nav>
  )
}
