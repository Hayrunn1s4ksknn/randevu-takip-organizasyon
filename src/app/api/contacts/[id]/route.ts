import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contactId = Number(id)
  if (!Number.isFinite(contactId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()

  const [contactRes, participationsRes] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, position, company_id, phone, email, notes, tags, last_contact, organizations(name)')
      .eq('id', contactId)
      .single(),
    supabase
      .from('appointment_participants')
      .select('appointments(id, title, date, time, status)')
      .eq('contact_id', contactId),
  ])

  if (contactRes.error || !contactRes.data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const appointments = (participationsRes.data ?? [])
    .map((p) => p.appointments)
    .filter(Boolean)
    .sort((a, b) => (b?.date ?? '').localeCompare(a?.date ?? ''))
    .slice(0, 5)

  return NextResponse.json({ contact: contactRes.data, appointments })
}
