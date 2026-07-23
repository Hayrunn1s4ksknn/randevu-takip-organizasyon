'use client'

import { usePathname } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { SearchPalette } from '@/components/search-palette'
import { ToastContainer } from '@/components/toast-container'
import { QuickActionModals } from '@/components/quick-action-modals'
import { AppointmentDrawer } from '@/features/appointments/appointment-drawer'
import { ContactDrawer } from '@/features/contacts/contact-drawer'
import { OrganizationDrawer } from '@/features/organizations/organization-drawer'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/appointments': 'Randevular',
  '/contacts': 'Kişiler',
  '/organizations': 'Kurumlar',
  '/calendar': 'Takvim',
  '/reports': 'Raporlar',
  '/settings': 'Ayarlar',
}

export function AppShellClient({
  children,
  fullName,
  isDark,
  orgOptions,
}: {
  children: React.ReactNode
  fullName: string
  isDark: boolean
  orgOptions: { id: number; name: string }[]
}) {
  const pathname = usePathname()
  const pageTitle = Object.entries(PAGE_TITLES).find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? ''

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Topbar pageTitle={pageTitle} isDark={isDark} fullName={fullName} />
      <div className="relative flex-1 overflow-auto p-7">{children}</div>
      <SearchPalette />
      <ToastContainer />
      <QuickActionModals orgOptions={orgOptions} />
      <AppointmentDrawer />
      <ContactDrawer orgOptions={orgOptions} />
      <OrganizationDrawer />
    </div>
  )
}
