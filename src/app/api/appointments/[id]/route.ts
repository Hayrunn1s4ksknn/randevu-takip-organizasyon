import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const appointmentId = Number(id)
  if (!Number.isFinite(appointmentId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()

  const [appointmentRes, participantsRes, notesRes, commentsRes, historyRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, title, date, time, location, status, priority, organizations(name)')
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
  })
}
