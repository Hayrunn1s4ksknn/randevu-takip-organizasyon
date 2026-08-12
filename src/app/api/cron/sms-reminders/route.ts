import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/sms'

// Triggered every ~15 minutes by an external scheduler (GitHub Actions —
// Vercel's free plan only allows a once-daily cron, which isn't enough for
// "1 hour before" precision). Any appointment starting within the next 60
// minutes that hasn't had a reminder sent yet gets one now, so the actual
// send lands roughly 45-60 minutes before the appointment depending on
// where in the 15-minute polling cycle it was picked up.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // All reminders go to one internal number (the person tracking
  // appointments), not to each organization's own phone — this is an
  // internal "your meeting is starting soon" nudge, not a message to the
  // client.
  const reminderPhone = process.env.REMINDER_PHONE
  if (!reminderPhone) return NextResponse.json({ error: 'REMINDER_PHONE tanımlı değil' }, { status: 500 })

  const admin = createAdminClient()

  // appointments.time is entered (and stored, with no timezone) as Turkey
  // local time — but Vercel's serverless functions run in UTC. Comparing a
  // UTC-based `now` against those naive local times would silently miss
  // every appointment by ~3 hours. Turkey has used a fixed UTC+3 offset
  // with no DST since 2016, so a flat offset is safe here.
  const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const todayISO = nowTR.toISOString().slice(0, 10)
  const nowHHMMSS = nowTR.toISOString().slice(11, 19)
  const windowEndTR = new Date(nowTR.getTime() + 60 * 60 * 1000)
  const windowEndHHMMSS = windowEndTR.toISOString().slice(11, 19)

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, title, time, organizations(name)')
    .eq('date', todayISO)
    .is('sms_reminder_sent_at', null)
    .in('status', ['Planlandı', 'Devam Ediyor'])
    .not('time', 'is', null)
    .gte('time', nowHHMMSS)
    .lte('time', windowEndHHMMSS)

  let sent = 0
  for (const appt of appointments ?? []) {
    const org = appt.organizations as unknown as { name: string | null } | null
    const orgLabel = org?.name ? ` (${org.name})` : ''
    const message = `Hatırlatma: "${appt.title}"${orgLabel} randevusu saat ${appt.time?.slice(0, 5)} başlıyor. - Technoscope Randevu`

    try {
      await sendSms({ to: reminderPhone, message })
      await admin.from('appointment_sms').insert({
        appointment_id: appt.id,
        to_phone: reminderPhone,
        message,
        kind: 'reminder',
      })
      await admin
        .from('appointments')
        .update({ sms_reminder_sent_at: new Date().toISOString() })
        .eq('id', appt.id)
      sent++
    } catch {
      // best-effort — continue with the remaining appointments
    }
  }

  return NextResponse.json({ sent })
}
