'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleDarkMode(nextValue: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({ dark_mode: nextValue }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
