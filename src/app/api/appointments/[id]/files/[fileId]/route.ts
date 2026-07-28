import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'appointment-files'

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const supabase = await createClient()

  const { data: fileRow, error } = await supabase
    .from('appointment_files')
    .select('storage_path, file_name')
    .eq('id', Number(fileId))
    .single()
  if (error || !fileRow) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(fileRow.storage_path, 60, { download: fileRow.file_name })
  if (signError || !signed) return NextResponse.json({ error: 'Bağlantı oluşturulamadı.' }, { status: 400 })

  return NextResponse.redirect(signed.signedUrl)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const supabase = await createClient()

  const { data: fileRow, error: fetchError } = await supabase
    .from('appointment_files')
    .select('storage_path')
    .eq('id', Number(fileId))
    .single()
  if (fetchError || !fileRow) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { error: deleteError } = await supabase.from('appointment_files').delete().eq('id', Number(fileId))
  if (deleteError) return NextResponse.json({ error: 'Dosya silinemedi.' }, { status: 400 })

  await supabase.storage.from(BUCKET).remove([fileRow.storage_path])

  return NextResponse.json({ success: true })
}
