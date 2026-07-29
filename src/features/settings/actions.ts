'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, recordAuthAttempt } from '@/lib/rate-limit'

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

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { message: 'Mevcut şifre zorunlu.' }),
    new_password: z.string().min(6, { message: 'Yeni şifre en az 6 karakter olmalı.' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Yeni şifreler eşleşmiyor.',
    path: ['confirm_password'],
  })

export async function changePassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = changePasswordSchema.safeParse({
    current_password: formData.get('current_password'),
    new_password: formData.get('new_password'),
    confirm_password: formData.get('confirm_password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Oturum bulunamadı.' }

  const { limited, windowMinutes } = await isRateLimited(user.email, 'login')
  if (limited) {
    return { error: `Çok fazla başarısız deneme. Lütfen ${windowMinutes} dakika sonra tekrar dene.` }
  }

  // Re-verify identity with the current password before allowing a change —
  // an already-authenticated session alone shouldn't be enough to silently
  // lock the real owner out by swapping the password.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  })
  await recordAuthAttempt(user.email, 'login', !verifyError)
  if (verifyError) return { error: 'Mevcut şifre yanlış.' }

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.new_password })
  if (updateError) return { error: 'Şifre güncellenemedi.' }

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
