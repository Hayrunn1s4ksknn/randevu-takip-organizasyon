import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // Auth provider unreachable — fall through and treat as anonymous so a
    // transient outage degrades to "logged out" instead of a hard failure.
  }

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  // API routes do their own auth (session cookie or a bearer token, e.g. the
  // cron endpoint) and must return JSON/status codes, never an HTML redirect
  // — a fetch() following a 307 to /login would try to JSON.parse the login
  // page's HTML.
  const isApiRoute = pathname.startsWith('/api/')
  const isMfaRoute = pathname.startsWith('/verify-2fa')

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // A signed-in user whose session hasn't cleared the MFA challenge yet
  // (currentLevel behind nextLevel) must be routed to /verify-2fa before
  // reaching any protected page — otherwise a valid aal1 session alone would
  // be enough to bypass the enrolled second factor.
  if (user && !isApiRoute) {
    let needsMfa = false
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      needsMfa = !!aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2'
    } catch {
      // fail open — an MFA-status check failure shouldn't lock everyone out
    }

    if (needsMfa && !isMfaRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/verify-2fa'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    if (!needsMfa && isMfaRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}
