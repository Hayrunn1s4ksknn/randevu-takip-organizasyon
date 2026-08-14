import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { ADMIN_USER, PERSONEL_USER, MISAFIR_USER } from './fixtures'

// Runs once before the whole E2E suite. Provisions three permanent staging
// fixture accounts (admin / personel / misafir) so individual specs don't
// need to juggle Supabase's "first user becomes admin, everyone else
// becomes personel" trigger themselves. Idempotent — safe to run every time.
function loadTestEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '..', '.env.test.local')
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      })
  )
}

export default async function globalSetup() {
  const env = loadTestEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await admin.auth.admin.listUsers()
  const byEmail = (email: string) => existing.users.find((u) => u.email === email)

  async function ensureUser(email: string, password: string) {
    const found = byEmail(email)
    if (found) return found.id
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: email },
    })
    if (error || !data.user)
      throw new Error(`E2E fixture kullanıcı oluşturulamadı (${email}): ${error?.message}`)
    return data.user.id
  }

  // Order matters: the very first user ever created in a fresh project
  // becomes admin automatically (handle_new_user trigger); everyone after
  // defaults to personel.
  await ensureUser(ADMIN_USER.email, ADMIN_USER.password)
  await ensureUser(PERSONEL_USER.email, PERSONEL_USER.password)
  const misafirId = await ensureUser(MISAFIR_USER.email, MISAFIR_USER.password)

  // misafir isn't a default role, so it must be set explicitly. The
  // role-escalation trigger only allows this when the acting session
  // resolves to an authenticated admin (auth.uid() -> profiles.role =
  // 'admin'), so sign in as the real admin fixture rather than using the
  // service-role key directly.
  const { data: profile } = await admin.from('profiles').select('role').eq('id', misafirId).single()
  if (profile?.role !== 'misafir') {
    const asAdmin = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error: signInError } = await asAdmin.auth.signInWithPassword(ADMIN_USER)
    if (signInError) throw new Error(`E2E admin fixture ile giriş yapılamadı: ${signInError.message}`)
    const { error: roleError } = await asAdmin
      .from('profiles')
      .update({ role: 'misafir' })
      .eq('id', misafirId)
    if (roleError) throw new Error(`E2E misafir fixture rolü ayarlanamadı: ${roleError.message}`)
  }
}
