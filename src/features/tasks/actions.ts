'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: boolean } | undefined

const schema = z.object({
  title: z.string().trim().min(1, { message: 'Görev başlığı zorunlu.' }),
  deadline: z.string().trim().optional(),
  priority: z.enum(['Düşük', 'Orta', 'Yüksek']),
})

export async function createTask(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    deadline: formData.get('deadline'),
    priority: formData.get('priority'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, deadline, priority } = parsed.data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('tasks').insert({
    title,
    deadline: deadline || null,
    priority,
    created_by: user?.id ?? null,
  })
  if (error) return { error: 'Görev oluşturulamadı.' }

  revalidatePath('/dashboard')
  return { success: true }
}
