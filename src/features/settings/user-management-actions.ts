'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ActionState = { error?: string; success?: boolean } | undefined

const ROLES = ['admin', 'yonetici', 'personel', 'misafir'] as const

// All the privileged work below runs through the service-role client, which
// bypasses RLS entirely — so every action must independently verify the
// caller is an admin before touching auth.users or profiles.role.
async function requireAdminSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null

  return supabase
}

const createUserSchema = z.object({
  email: z.string().trim().email({ message: 'Geçerli bir e-posta girin.' }),
  full_name: z.string().trim().min(1, { message: 'Ad Soyad zorunlu.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' }),
  role: z.enum(ROLES),
})

export async function createUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  const adminSession = await requireAdminSession()
  if (!adminSession) return { error: 'Bu işlem için yetkiniz yok.' }

  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    password: formData.get('password'),
    role: formData.get('role'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, full_name, password, role } = parsed.data
  const admin = createAdminClient()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (createError || !created.user) {
    return {
      error: createError?.message.includes('already been registered')
        ? 'Bu e-posta ile zaten bir kullanıcı var.'
        : 'Kullanıcı oluşturulamadı.',
    }
  }

  // handle_new_user() defaults new profiles to 'personel'; only touch the
  // row if the admin picked a different role, so the own-admin RLS check
  // and role-escalation trigger have nothing to evaluate on the common path.
  if (role !== 'personel') {
    const { error: roleError } = await adminSession
      .from('profiles')
      .update({ role })
      .eq('id', created.user.id)
    if (roleError) return { error: 'Kullanıcı oluşturuldu ama rol atanamadı.' }
  }

  revalidatePath('/settings/users')
  return { success: true }
}

const roleSchema = z.object({ role: z.enum(ROLES) })

export async function updateUserRole(
  userId: string,
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminSession = await requireAdminSession()
  if (!adminSession) return { error: 'Bu işlem için yetkiniz yok.' }

  const parsed = roleSchema.safeParse({ role: formData.get('role') })
  if (!parsed.success) return { error: 'Geçersiz rol.' }

  const { error } = await adminSession.from('profiles').update({ role: parsed.data.role }).eq('id', userId)
  if (error) return { error: 'Rol güncellenemedi.' }

  revalidatePath('/settings/users')
  return { success: true }
}

export async function setUserBanned(userId: string, banned: boolean) {
  const adminSession = await requireAdminSession()
  if (!adminSession) throw new Error('Bu işlem için yetkiniz yok.')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? '876000h' : 'none',
  })
  if (error) throw new Error(banned ? 'Kullanıcı devre dışı bırakılamadı.' : 'Kullanıcı etkinleştirilemedi.')

  revalidatePath('/settings/users')
}
