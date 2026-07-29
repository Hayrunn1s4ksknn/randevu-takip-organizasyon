'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUiStore } from '@/store/ui'

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard' },
  { key: 'appointments', href: '/appointments', label: 'Randevular' },
  { key: 'tasks', href: '/tasks', label: 'Görevler' },
  { key: 'contacts', href: '/contacts', label: 'Kişiler' },
  { key: 'orgs', href: '/organizations', label: 'Kurumlar' },
  { key: 'calendar', href: '/calendar', label: 'Takvim' },
  { key: 'reports', href: '/reports', label: 'Raporlar' },
  { key: 'settings', href: '/settings', label: 'Ayarlar' },
] as const

export function Sidebar({ fullName, roleLabel }: { fullName: string; roleLabel: string }) {
  const pathname = usePathname()
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const closeMobileNav = useUiStore((s) => s.closeMobileNav)
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {mobileNavOpen && <div onClick={closeMobileNav} className="fixed inset-0 z-40 bg-black/40 md:hidden" />}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-[248px] shrink-0 flex-col bg-sidebar-bg p-3.5 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2.5 px-2.5 pb-[22px] pt-2">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-[15px] font-bold text-white">
            RP
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[1.2px] text-white/50">MERSİN TEKNOPARK</div>
            <div className="text-sm font-bold tracking-[0.3px] text-white">TECHNOSCOPE RANDEVU</div>
          </div>
        </div>
        <nav className="mt-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobileNav}
                className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors hover:bg-white/[0.08]"
                style={{ background: active ? 'rgba(255,255,255,0.14)' : 'transparent' }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? '#fff' : 'rgba(255,255,255,0.35)' }}
                />
                <span
                  className="font-medium"
                  style={{
                    fontWeight: active ? 700 : 500,
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-white/[0.06] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {initials || '?'}
          </div>
          <div className="min-w-0">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-white">
              {fullName}
            </div>
            <div className="text-[11px] text-white/50">{roleLabel}</div>
          </div>
        </div>
      </div>
    </>
  )
}
