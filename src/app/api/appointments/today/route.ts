import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Feeds the client-side desktop reminder notifier — only appointments that
// are still open and have a specific time can meaningfully get a "starts
// soon" notification.
export async function GET() {
  const supabase = await createClient()
  const todayISO = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('appointments')
    .select('id, title, time')
    .eq('date', todayISO)
    .not('time', 'is', null)
    .in('status', ['Planlandı', 'Devam Ediyor'])

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ appointments: data ?? [] })
}
