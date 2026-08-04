'use client'

import { usePathname } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { SearchPalette } from '@/components/search-palette'
import { ToastContainer } from '@/components/toast-container'
import { RealtimeNotifier } from '@/components/realtime-notifier'
import { QuickActionModals } from '@/components/quick-action-modals'
import { AppointmentDrawer } from '@/features/appointments/appointment-drawer'
import { ContactDrawer } from '@/features/contacts/contact-drawer'
import { OrganizationDrawer } from '@/features/organizations/organization-drawer'
import { BottomNav } from '@/components/bottom-nav'
import { Fab } from '@/components/fab'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Anasayfa',
  '/appointments': 'Randevular',
  '/tasks': 'Görevler',
  '/contacts': 'Kişiler',
  '/organizations': 'Kurumlar',
  '/calendar': 'Takvim',
  '/reports': 'Raporlar',
  '/settings/users': 'Kullanıcılar',
  '/settings': 'Ayarlar',
}

export function AppShellClient({
  children,
  fullName,
  email,
  isDark,
  orgOptions,
  contactOptions,
  staffOptions,
  appointmentOptions,
  userId,
  isAdmin,
}: {
  children: React.ReactNode
  fullName: string
  email: string
  isDark: boolean
  orgOptions: { id: number; name: string }[]
  contactOptions: { id: number; name: string }[]
  staffOptions: { id: string; name: string }[]
  appointmentOptions: { id: number; title: string }[]
  userId: string
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const pageTitle = Object.entries(PAGE_TITLES).find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? ''

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Topbar pageTitle={pageTitle} isDark={isDark} fullName={fullName} email={email} />
      <div className="relative flex-1 overflow-auto p-4 pb-20 md:p-7">{children}</div>
      <SearchPalette />
      <ToastContainer />
      <RealtimeNotifier userId={userId} />
      <QuickActionModals
        orgOptions={orgOptions}
        contactOptions={contactOptions}
        staffOptions={staffOptions}
        appointmentOptions={appointmentOptions}
      />
      <AppointmentDrawer contactOptions={contactOptions} staffOptions={staffOptions} isAdmin={isAdmin} />
      <ContactDrawer orgOptions={orgOptions} />
      <OrganizationDrawer />
      <BottomNav />
      <Fab />
    </div>
  )
}
