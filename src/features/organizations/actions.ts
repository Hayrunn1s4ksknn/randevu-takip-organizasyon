'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  name: z.string().trim().min(1, { message: 'Kurum adı zorunlu.' }),
  sector: z.string().trim().optional(),
  contact_person: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email({ message: 'Geçerli bir e-posta girin.' }).optional().or(z.literal('')),
  address: z.string().trim().optional(),
})

export async function createOrganization(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    sector: formData.get('sector'),
    contact_person: formData.get('contact_person'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, sector, contact_person, phone, email, address } = parsed.data
  const logoLetter = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('organizations').insert({
    name,
    sector: sector || null,
    logo_letter: logoLetter,
    contact_person: contact_person || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    created_by: user?.id ?? null,
  })
  if (error) return { error: 'Kurum eklenemedi.' }

  revalidatePath('/dashboard')
  revalidatePath('/organizations')
  return { success: true }
}

export async function updateOrganization(
  id: number,
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    sector: formData.get('sector'),
    contact_person: formData.get('contact_person'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, sector, contact_person, phone, email, address } = parsed.data
  const logoLetter = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const supabase = await createClient()
  const { error } = await supabase
    .from('organizations')
    .update({
      name,
      sector: sector || null,
      logo_letter: logoLetter,
      contact_person: contact_person || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    })
    .eq('id', id)
  if (error) return { error: 'Kurum güncellenemedi.' }

  revalidatePath('/dashboard')
  revalidatePath('/organizations')
  return { success: true }
}

export async function softDeleteOrganization(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error('Kurum silinemedi.')

  revalidatePath('/dashboard')
  revalidatePath('/organizations')
}
