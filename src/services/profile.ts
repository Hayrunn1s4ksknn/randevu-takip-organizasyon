import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getStaffOptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'yonetici', 'personel'])
    .order('full_name')
  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name ?? 'İsimsiz kullanıcı' }))
}

export async function getCurrentUserAndProfile() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { user: null, profile: null }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return { user, profile: profile as Profile | null }
  } catch {
    // Auth provider unreachable (network blip, misconfigured env) — degrade to
    // anonymous rather than crashing every page's layout.
    return { user: null, profile: null }
  }
}
