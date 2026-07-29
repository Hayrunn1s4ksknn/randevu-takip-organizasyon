import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const appointmentId = Number(id)
  if (!Number.isFinite(appointmentId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()

  const [appointmentRes, participantsRes, notesRes, commentsRes, historyRes, filesRes, emailsRes] =
    await Promise.all([
      supabase
        .from('appointments')
        .select(
          'id, title, date, time, location, status, priority, meeting_type, duration_minutes, organizations(name, email)'
        )
        .eq('id', appointmentId)
        .single(),
      supabase
        .from('appointment_participants')
        .select('contacts(id, name)')
        .eq('appointment_id', appointmentId),
      supabase
        .from('appointment_notes')
        .select('id, body, created_at, profiles(full_name)')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('appointment_comments')
        .select('id, body, created_at, profiles(full_name)')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('appointment_status_history')
        .select('id, from_status, to_status, changed_at, profiles(full_name)')
        .eq('appointment_id', appointmentId)
        .order('changed_at', { ascending: false }),
      supabase
        .from('appointment_files')
        .select('id, file_name, size_bytes, mime_type, created_at, profiles(full_name)')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('appointment_emails')
        .select('id, to_email, subject, body, kind, sent_at, profiles(full_name)')
        .eq('appointment_id', appointmentId)
        .order('sent_at', { ascending: false }),
    ])

  if (appointmentRes.error || !appointmentRes.data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json({
    appointment: appointmentRes.data,
    participants: (participantsRes.data ?? []).map((p) => p.contacts).filter(Boolean),
    notes: notesRes.data ?? [],
    comments: commentsRes.data ?? [],
    statusHistory: historyRes.data ?? [],
    files: filesRes.data ?? [],
    emails: emailsRes.data ?? [],
  })
}

const MEETING_TYPES = ['Online', 'Fiziksel', 'Telefon']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { meeting_type, duration_minutes } = await request.json()
  if (meeting_type !== null && !MEETING_TYPES.includes(meeting_type)) {
    return NextResponse.json({ error: 'invalid meeting_type' }, { status: 400 })
  }
  if (duration_minutes !== null && (!Number.isFinite(duration_minutes) || duration_minutes <= 0)) {
    return NextResponse.json({ error: 'invalid duration_minutes' }, { status: 400 })
  }

  const { error } = await supabase
    .from('appointments')
    .update({ meeting_type, duration_minutes })
    .eq('id', appointmentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
