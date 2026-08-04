'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import type { AppointmentStatus } from '@/types/database'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  title: z.string().trim().min(1, { message: 'Başlık zorunlu.' }),
  org_id: z.string().trim().optional(),
  date: z.string().trim().min(1, { message: 'Tarih zorunlu.' }),
  time: z.string().trim().optional(),
  location: z.string().trim().optional(),
  priority: z.enum(['Düşük', 'Orta', 'Yüksek']),
  meeting_type: z.enum(['Online', 'Fiziksel', 'Telefon']).optional(),
  duration_minutes: z.string().trim().optional(),
  assigned_to: z.string().trim().optional(),
})

export async function createAppointment(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    org_id: formData.get('org_id'),
    date: formData.get('date'),
    time: formData.get('time'),
    location: formData.get('location'),
    priority: formData.get('priority'),
    meeting_type: formData.get('meeting_type') || undefined,
    duration_minutes: formData.get('duration_minutes'),
    assigned_to: formData.get('assigned_to'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, org_id, date, time, location, priority, meeting_type, duration_minutes, assigned_to } =
    parsed.data
  const contactIds = formData.getAll('contact_ids').map(Number).filter(Number.isFinite)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: created, error } = await supabase
    .from('appointments')
    .insert({
      title,
      org_id: org_id ? Number(org_id) : null,
      date,
      time: time || null,
      location: location || null,
      priority,
      meeting_type: meeting_type || null,
      duration_minutes: duration_minutes ? Number(duration_minutes) : null,
      assigned_to: assigned_to || null,
      created_by: user?.id ?? null,
    })
    .select('id, org_id')
    .single()
  if (error || !created) return { error: 'Randevu oluşturulamadı.' }

  if (contactIds.length > 0) {
    await supabase
      .from('appointment_participants')
      .insert(contactIds.map((contact_id) => ({ appointment_id: created.id, contact_id })))
  }

  revalidatePath('/dashboard')
  revalidatePath('/appointments')

  if (created.org_id) {
    // Awaited (not fire-and-forget): serverless functions can be frozen right
    // after the response is sent, which would silently drop an unawaited send.
    // Failure here must not fail appointment creation, hence the try/catch.
    try {
      await sendAppointmentConfirmation(created.id, created.org_id, title, date, time)
    } catch {
      // best-effort
    }
  }

  return { success: true }
}

async function sendAppointmentConfirmation(
  appointmentId: number,
  orgId: number,
  title: string,
  date: string,
  time: string | undefined
) {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('name, email').eq('id', orgId).single()
  if (!org?.email) return

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('tr-TR')
  const subject = `Randevu Onayı: ${title}`
  const body = `<p>Merhaba,</p><p><strong>${title}</strong> randevunuz <strong>${formattedDate}${time ? ` ${time.slice(0, 5)}` : ''}</strong> için oluşturuldu.</p>`

  await sendEmail({ to: org.email, subject, html: body })
  await supabase.from('appointment_emails').insert({
    appointment_id: appointmentId,
    to_email: org.email,
    subject,
    body,
    kind: 'confirmation',
  })
}

export async function bulkUpdateAppointmentStatus(ids: number[], status: AppointmentStatus) {
  if (ids.length === 0) return
  const supabase = await createClient()
  await supabase.from('appointments').update({ status }).in('id', ids)
  revalidatePath('/dashboard')
  revalidatePath('/appointments')
}

export async function bulkPostponeAppointments(ids: number[], newDate: string | null) {
  if (ids.length === 0) return
  const supabase = await createClient()
  const todayISO = new Date().toISOString().slice(0, 10)

  // A future date keeps it as "Ertelendi" until that day actually arrives —
  // the daily reminder cron flips it to "Planlandı" automatically then. If
  // the picked date is today (the earliest the date input allows), it's
  // already "arrived" so there's no reason to wait for tomorrow's cron run.
  let update: { date?: string; status: AppointmentStatus }
  if (!newDate) {
    update = { status: 'Ertelendi' }
  } else if (newDate <= todayISO) {
    update = { date: newDate, status: 'Planlandı' }
  } else {
    update = { date: newDate, status: 'Ertelendi' }
  }
  await supabase.from('appointments').update(update).in('id', ids)
  revalidatePath('/dashboard')
  revalidatePath('/appointments')
  revalidatePath('/calendar')
}

export async function deleteAppointment(id: number) {
  const supabase = await createClient()

  // Related rows (notes/comments/participants/status history/emails) cascade
  // via FK, but the actual Storage objects behind appointment_files don't —
  // those have to be removed explicitly or they'd leak in the bucket forever.
  const { data: files } = await supabase
    .from('appointment_files')
    .select('storage_path')
    .eq('appointment_id', id)
  if (files && files.length > 0) {
    await supabase.storage.from('appointment-files').remove(files.map((f) => f.storage_path))
  }

  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw new Error('Randevu silinemedi.')

  revalidatePath('/dashboard')
  revalidatePath('/appointments')
  revalidatePath('/calendar')
}
