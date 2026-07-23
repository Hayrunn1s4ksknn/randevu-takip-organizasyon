import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orgId = Number(id)
  if (!Number.isFinite(orgId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()

  const [orgRes, recentRes, countRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, sector, logo_letter, contact_person, phone, email, address, total_meetings')
      .eq('id', orgId)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('appointments')
      .select('id, title, date, time, status')
      .eq('org_id', orgId)
      .order('date', { ascending: false })
      .limit(5),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ])

  if (orgRes.error || !orgRes.data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json({
    organization: orgRes.data,
    totalAppointments: countRes.count ?? 0,
    recentAppointments: recentRes.data ?? [],
  })
}
