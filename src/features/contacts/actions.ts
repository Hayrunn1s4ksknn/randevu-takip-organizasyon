'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  name: z.string().trim().min(1, { message: 'Ad Soyad zorunlu.' }),
  position: z.string().trim().optional(),
  company_id: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email({ message: 'Geçerli bir e-posta girin.' }).optional().or(z.literal('')),
})

export async function createContact(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    position: formData.get('position'),
    company_id: formData.get('company_id'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, position, company_id, phone, email } = parsed.data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('contacts').insert({
    name,
    position: position || null,
    company_id: company_id ? Number(company_id) : null,
    phone: phone || null,
    email: email || null,
    created_by: user?.id ?? null,
  })
  if (error) return { error: 'Kişi eklenemedi.' }

  revalidatePath('/dashboard')
  revalidatePath('/contacts')
  return { success: true }
}
