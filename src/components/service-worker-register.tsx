'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Non-critical — the app just falls back to the browser's default
        // offline error instead of the branded page.
      })
    }
  }, [])

  return null
}
