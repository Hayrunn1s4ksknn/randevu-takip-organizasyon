import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

export type UserListItem = {
  id: string
  full_name: string | null
  role: UserRole
  email: string
  banned: boolean
  created_at: string
}

export async function getUsersList(): Promise<UserListItem[]> {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: true })

  const admin = createAdminClient()
  const {
    data: { users },
  } = await admin.auth.admin.listUsers({ perPage: 200 })
  const authById = new Map(users.map((u) => [u.id, u]))

  return (profiles ?? []).map((p) => {
    const authUser = authById.get(p.id)
    const bannedUntil = authUser?.banned_until
    return {
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      email: authUser?.email ?? '',
      banned: !!bannedUntil && new Date(bannedUntil) > new Date(),
      created_at: p.created_at,
    }
  })
}
