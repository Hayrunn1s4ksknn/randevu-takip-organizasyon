import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const like = `%${q}%`

  const [contacts, organizations, appointments] = await Promise.all([
    supabase.from('contacts').select('id, name').ilike('name', like).limit(4),
    supabase.from('organizations').select('id, name').ilike('name', like).limit(4),
    supabase.from('appointments').select('id, title').ilike('title', like).limit(4),
  ])

  const results = [
    ...(contacts.data ?? []).map((c) => ({ id: c.id, label: c.name, type: 'Kişi' })),
    ...(organizations.data ?? []).map((o) => ({ id: o.id, label: o.name, type: 'Kurum' })),
    ...(appointments.data ?? []).map((a) => ({ id: a.id, label: a.title, type: 'Randevu' })),
  ].slice(0, 8)

  return NextResponse.json({ results })
}
