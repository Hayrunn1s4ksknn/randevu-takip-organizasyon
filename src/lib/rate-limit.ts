import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

type AuthAction = 'login' | 'password_reset'

const LIMITS: Record<AuthAction, { max: number; windowMinutes: number }> = {
  login: { max: 5, windowMinutes: 15 },
  password_reset: { max: 3, windowMinutes: 15 },
}

// Fails open: if the rate-limit check/write itself errors (network blip,
// misconfigured env), we let the auth attempt through rather than locking
// everyone out over a transient bookkeeping failure.
export async function isRateLimited(email: string, action: AuthAction) {
  const { max, windowMinutes } = LIMITS[action]
  try {
    const admin = createAdminClient()
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

    const { count } = await admin
      .from('auth_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('action', action)
      .eq('success', false)
      .gte('attempted_at', windowStart)

    return { limited: (count ?? 0) >= max, windowMinutes }
  } catch {
    return { limited: false, windowMinutes }
  }
}

export async function recordAuthAttempt(email: string, action: AuthAction, success: boolean) {
  try {
    const admin = createAdminClient()
    await admin.from('auth_attempts').insert({ email, action, success })
  } catch {
    // best-effort bookkeeping only
  }
}
