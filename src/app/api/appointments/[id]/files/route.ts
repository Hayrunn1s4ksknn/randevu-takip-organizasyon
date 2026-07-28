import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'appointment-files'
const MAX_SIZE_BYTES = 20 * 1024 * 1024

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const appointmentId = Number(id)
  if (!Number.isFinite(appointmentId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Dosya çok büyük (maks. 20MB).' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${appointmentId}/${crypto.randomUUID()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type || 'application/octet-stream' })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { error: insertError } = await supabase.from('appointment_files').insert({
    appointment_id: appointmentId,
    uploaded_by: user.id,
    file_name: file.name,
    storage_path: storagePath,
    size_bytes: file.size,
    mime_type: file.type || null,
  })
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: 'Dosya kaydedilemedi.' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
