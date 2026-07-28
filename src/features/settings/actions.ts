'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: boolean } | undefined

const nameSchema = z.object({
  full_name: z.string().trim().min(1, { message: 'Ad Soyad zorunlu.' }).max(120),
})

export async function updateFullName(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = nameSchema.safeParse({ full_name: formData.get('full_name') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum bulunamadı.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id)
  if (error) return { error: 'Ad Soyad güncellenemedi.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleDarkMode(nextValue: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({ dark_mode: nextValue }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
