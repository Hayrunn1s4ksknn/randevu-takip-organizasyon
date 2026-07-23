'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function OrganizationSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <input
      defaultValue={searchParams.get('q') ?? ''}
      onChange={(e) => {
        const params = new URLSearchParams()
        if (e.target.value) params.set('q', e.target.value)
        router.push(`/organizations?${params.toString()}`)
      }}
      placeholder="Kurum ara..."
      className="max-w-[320px] flex-1 rounded-[10px] border border-border bg-surface-solid px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
    />
  )
}
