'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  title: z.string().trim().min(1, { message: 'Başlık zorunlu.' }),
  org_id: z.string().trim().optional(),
  date: z.string().trim().min(1, { message: 'Tarih zorunlu.' }),
  time: z.string().trim().optional(),
  location: z.string().trim().optional(),
  priority: z.enum(['Düşük', 'Orta', 'Yüksek']),
})

export async function createAppointment(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    org_id: formData.get('org_id'),
    date: formData.get('date'),
    time: formData.get('time'),
    location: formData.get('location'),
    priority: formData.get('priority'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, org_id, date, time, location, priority } = parsed.data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('appointments').insert({
    title,
    org_id: org_id ? Number(org_id) : null,
    date,
    time: time || null,
    location: location || null,
    priority,
    created_by: user?.id ?? null,
  })
  if (error) return { error: 'Randevu oluşturulamadı.' }

  revalidatePath('/dashboard')
  revalidatePath('/appointments')
  return { success: true }
}

export async function bulkUpdateAppointmentStatus(ids: number[], status: AppointmentStatus) {
  if (ids.length === 0) return
  const supabase = await createClient()
  await supabase.from('appointments').update({ status }).in('id', ids)
  revalidatePath('/dashboard')
  revalidatePath('/appointments')
}
