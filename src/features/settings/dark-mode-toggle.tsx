'use client'

import { useState, useTransition } from 'react'
import { toggleDarkMode } from './actions'

export function DarkModeToggle({ initialIsDark }: { initialIsDark: boolean }) {
  const [isDark, setIsDark] = useState(initialIsDark)
  const [pending, startTransition] = useTransition()

  return (
    <div
      role="switch"
      aria-checked={isDark}
      onClick={() => {
        const next = !isDark
        setIsDark(next)
        startTransition(() => toggleDarkMode(next))
      }}
      className="relative h-[22px] w-10 cursor-pointer rounded-xl transition-colors"
      style={{
        background: isDark ? 'var(--color-accent)' : 'var(--color-border)',
        opacity: pending ? 0.7 : 1,
      }}
    >
      <div
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all"
        style={{ left: isDark ? '20px' : '2px' }}
      />
    </div>
  )
}
