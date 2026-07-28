'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient, THIRTY_DAYS } from '@/lib/supabase/server'
import { isRateLimited, recordAuthAttempt } from '@/lib/rate-limit'

export type ActionState = { error?: string } | undefined

const CONNECTION_ERROR = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar dene.'

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Geçerli bir e-posta girin.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' }),
})

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data
  const { limited, windowMinutes } = await isRateLimited(email, 'login')
  if (limited) {
    return { error: `Çok fazla başarısız deneme. Lütfen ${windowMinutes} dakika sonra tekrar dene.` }
  }

  const remember = formData.get('remember') === 'on'
  let redirectTarget: string | null = null
  try {
    const supabase = await createClient(remember ? { rememberMaxAgeSeconds: THIRTY_DAYS } : undefined)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    await recordAuthAttempt(email, 'login', !error)
    if (error) return { error: 'E-posta veya şifre hatalı.' }

    const redirectTo = formData.get('redirectTo')
    redirectTarget = typeof redirectTo === 'string' && redirectTo ? redirectTo : '/dashboard'
  } catch {
    return { error: CONNECTION_ERROR }
  }
  redirect(redirectTarget)
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Geçerli bir e-posta girin.' }),
})

export async function requestPasswordReset(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data
  const { limited, windowMinutes } = await isRateLimited(email, 'password_reset')
  if (limited) {
    return { error: `Çok fazla istek. Lütfen ${windowMinutes} dakika sonra tekrar dene.` }
  }

  try {
    const supabase = await createClient()
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })
    await recordAuthAttempt(email, 'password_reset', !error)
    if (error) return { error: 'Sıfırlama e-postası gönderilemedi.' }
  } catch {
    return { error: CONNECTION_ERROR }
  }

  redirect('/forgot-password?sent=1')
}

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirm'],
  })

export async function resetPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
    if (error) return { error: 'Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.' }
  } catch {
    return { error: CONNECTION_ERROR }
  }

  redirect('/login?reset=1')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
