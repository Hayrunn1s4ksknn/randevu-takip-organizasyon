import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/services/profile'
import { getUsersList } from '@/services/users'
import { UsersPageClient } from '@/features/settings/users-page-client'

export default async function UsersPage() {
  const { user, profile } = await getCurrentUserAndProfile()
  if (!user) redirect('/login')
  if (profile?.role !== 'admin') redirect('/settings')

  const users = await getUsersList()

  return (
    <div className="animate-fade-in">
      <UsersPageClient users={users} currentUserId={user.id} />
    </div>
  )
}
