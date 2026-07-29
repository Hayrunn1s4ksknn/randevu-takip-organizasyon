import 'server-only'
import { createClient } from '@/lib/supabase/server'

const SELECT = 'id, name, position, company_id, phone, email, tags, last_contact, organizations(name)'

export async function getContactsList(search?: string) {
  const supabase = await createClient()
  let query = supabase.from('contacts').select(SELECT)
  if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`)

  const { data } = await query.order('name', { ascending: true })
  return data ?? []
}

export async function getContactOptions() {
  const supabase = await createClient()
  const { data } = await supabase.from('contacts').select('id, name').order('name')
  return data ?? []
}
