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

  const admin = createAdminClient()
  const now = new Date()
  const todayISO = now.toISOString().slice(0, 10)
  const nowHHMMSS = now.toTimeString().slice(0, 8)
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000)
  const windowEndHHMMSS = windowEnd.toTimeString().slice(0, 8)

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, title, time, organizations(phone)')
    .eq('date', todayISO)
    .is('sms_reminder_sent_at', null)
    .in('status', ['Planlandı', 'Devam Ediyor'])
    .not('time', 'is', null)
    .gte('time', nowHHMMSS)
    .lte('time', windowEndHHMMSS)

  let sent = 0
  for (const appt of appointments ?? []) {
    const org = appt.organizations as unknown as { phone: string | null } | null
    if (!org?.phone) continue

    const message = `Hatırlatma: "${appt.title}" randevunuz saat ${appt.time?.slice(0, 5)} başlıyor. - Technoscope Randevu`

    try {
      await sendSms({ to: org.phone, message })
      await admin.from('appointment_sms').insert({
        appointment_id: appt.id,
        to_phone: org.phone,
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
