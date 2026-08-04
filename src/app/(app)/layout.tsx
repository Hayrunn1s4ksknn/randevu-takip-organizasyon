import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile, getStaffOptions } from '@/services/profile'
import { getOrganizationOptions } from '@/services/organizations'
import { getContactOptions } from '@/services/contacts'
import { getAppointmentOptions } from '@/services/appointments'
import { Sidebar } from '@/components/sidebar'
import { AppShellClient } from './app-shell-client'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici (Admin)',
  yonetici: 'Yönetici',
  personel: 'Personel',
  misafir: 'Misafir',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile()
  if (!user) redirect('/login')

  const fullName = profile?.full_name ?? user.email ?? 'Kullanıcı'
  const roleLabel = ROLE_LABELS[profile?.role ?? 'personel']
  const [orgOptions, contactOptions, staffOptions, appointmentOptions] = await Promise.all([
    getOrganizationOptions(),
    getContactOptions(),
    getStaffOptions(),
    getAppointmentOptions(),
  ])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text-primary">
      <Sidebar fullName={fullName} roleLabel={roleLabel} />
      <AppShellClient
        fullName={fullName}
        email={user.email ?? ''}
        isDark={profile?.dark_mode ?? false}
        orgOptions={orgOptions}
        contactOptions={contactOptions}
        staffOptions={staffOptions}
        appointmentOptions={appointmentOptions}
        userId={user.id}
        isAdmin={profile?.role === 'admin'}
      >
        {children}
      </AppShellClient>
    </div>
  )
}
