import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/sms'

const ALERT_KEY = 'sms-reminders'
const THROTTLE_MS = 2 * 60 * 60 * 1000 // 2 hours

// Called by the GitHub Actions workflow's `if: failure()` step when the
// main SMS reminder run fails — pages the site owner via SMS instead of
// relying solely on them noticing GitHub's own failure-notification email.
// Uses the same CRON_SECRET as the main endpoint (no extra GitHub secret
// needed), but note: if CRON_SECRET itself is missing/wrong in GitHub, this
// call will also 401 and no alert goes out — GitHub's built-in workflow
// failure email is the fallback for that specific case.
//
// Throttled to at most one alert per THROTTLE_MS: the workflow retries
// every 15 minutes, so a prolonged outage would otherwise page the owner's
// phone dozens of times instead of once.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const alertPhone = process.env.ALERT_PHONE
  if (!alertPhone) return NextResponse.json({ error: 'ALERT_PHONE tanımlı değil' }, { status: 500 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('cron_alerts')
    .select('last_sent_at')
    .eq('key', ALERT_KEY)
    .single()

  if (existing && Date.now() - new Date(existing.last_sent_at).getTime() < THROTTLE_MS) {
    return NextResponse.json({ alerted: false, throttled: true })
  }

  await sendSms({
    to: alertPhone,
    message: 'Uyarı: SMS randevu hatırlatma cron işi başarısız oldu. GitHub Actions loglarını kontrol edin.',
  })
  await admin.from('cron_alerts').upsert({ key: ALERT_KEY, last_sent_at: new Date().toISOString() })

  return NextResponse.json({ alerted: true })
}
