import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const THIRTY_DAYS = 60 * 60 * 24 * 30

/**
 * `rememberMaxAgeSeconds` overrides the auth cookies' lifetime for the
 * "remember me" login checkbox — omit it and Supabase's default (session
 * cookie, cleared when the browser closes) applies.
 */
export async function createClient(options?: { rememberMaxAgeSeconds?: number }) {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
              cookieStore.set(name, value, {
                ...cookieOptions,
                ...(options?.rememberMaxAgeSeconds ? { maxAge: options.rememberMaxAgeSeconds } : {}),
              })
            )
          } catch {
            // setAll called from a Server Component — session refresh is
            // handled in proxy.ts, so this can be safely ignored here.
          }
        },
      },
    }
  )
}

export { THIRTY_DAYS }
