'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// The widget window stays open all day, so it needs to pull fresh data on
// its own — there's no user interaction to trigger a normal Next.js refetch.
export function WidgetAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 60 * 1000)
    return () => clearInterval(interval)
  }, [router])

  return null
}
