import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

// Runs daily (see vercel.json) and reminds about appointments happening
// tomorrow. Because the match window is "date = tomorrow" only, a failed
// send for a given appointment is not retried — accepted as a best-effort
// tradeoff to keep the reminder logic simple.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().slice(0, 10)

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, title, date, time, organizations(email)')
    .eq('date', tomorrowISO)
    .is('reminder_sent_at', null)
    .neq('status', 'İptal Edildi')

  let sent = 0
  for (const appt of appointments ?? []) {
    const org = appt.organizations as unknown as { email: string | null } | null
    if (!org?.email) continue

    const subject = `Hatırlatma: ${appt.title}`
    const html = `<p>Merhaba,</p><p><strong>${appt.title}</strong> randevunuz yarın${appt.time ? ` saat ${appt.time.slice(0, 5)}` : ''} gerçekleşecek.</p>`

    try {
      await sendEmail({ to: org.email, subject, html })
      await admin.from('appointment_emails').insert({
        appointment_id: appt.id,
        to_email: org.email,
        subject,
        body: html,
        kind: 'reminder',
      })
      await admin
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', appt.id)
      sent++
    } catch {
      // best-effort — continue with the remaining appointments
    }
  }

  return NextResponse.json({ sent })
}
