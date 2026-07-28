import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

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

  const { to, subject, body } = await request.json()
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Kime, konu ve mesaj zorunlu.' }, { status: 400 })
  }

  const html = String(body).replace(/\n/g, '<br/>')
  try {
    await sendEmail({ to, subject, html })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Mail gönderilemedi.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('appointment_emails').insert({
    appointment_id: appointmentId,
    sent_by: user.id,
    to_email: to,
    subject,
    body,
    kind: 'manual',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
