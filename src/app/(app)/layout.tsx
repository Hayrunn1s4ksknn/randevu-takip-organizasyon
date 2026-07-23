import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/services/profile'
import { getOrganizationOptions } from '@/services/organizations'
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
  const orgOptions = await getOrganizationOptions()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text-primary">
      <Sidebar fullName={fullName} roleLabel={roleLabel} />
      <AppShellClient fullName={fullName} isDark={profile?.dark_mode ?? false} orgOptions={orgOptions}>
        {children}
      </AppShellClient>
    </div>
  )
}
