import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getOrganizationOptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organizations')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')
  return data ?? []
}
