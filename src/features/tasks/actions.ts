'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/types/database'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  title: z.string().trim().min(1, { message: 'Görev başlığı zorunlu.' }),
  description: z.string().trim().optional(),
  deadline: z.string().trim().optional(),
  priority: z.enum(['Düşük', 'Orta', 'Yüksek']),
  appointment_id: z.string().trim().optional(),
  assigned_to: z.string().trim().optional(),
})

export async function createTask(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    deadline: formData.get('deadline'),
    priority: formData.get('priority'),
    appointment_id: formData.get('appointment_id'),
    assigned_to: formData.get('assigned_to'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, deadline, priority, appointment_id, assigned_to } = parsed.data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('tasks').insert({
    title,
    description: description || null,
    deadline: deadline || null,
    priority,
    appointment_id: appointment_id ? Number(appointment_id) : null,
    assigned_to: assigned_to || null,
    created_by: user?.id ?? null,
  })
  if (error) return { error: 'Görev oluşturulamadı.' }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTask(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    deadline: formData.get('deadline'),
    priority: formData.get('priority'),
    appointment_id: formData.get('appointment_id'),
    assigned_to: formData.get('assigned_to'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, deadline, priority, appointment_id, assigned_to } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description: description || null,
      deadline: deadline || null,
      priority,
      appointment_id: appointment_id ? Number(appointment_id) : null,
      assigned_to: assigned_to || null,
    })
    .eq('id', id)
  if (error) return { error: 'Görev güncellenemedi.' }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return { success: true }
}

export async function setTaskStatus(id: number, status: TaskStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw new Error('Görev durumu güncellenemedi.')

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
}

export async function deleteTask(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error('Görev silinemedi.')

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
}
