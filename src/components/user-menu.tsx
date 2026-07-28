'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions'

export function UserMenu({ fullName, email }: { fullName: string; email: string }) {
  const [open, setOpen] = useState(false)
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Kullanıcı menüsü"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white"
      >
        {initials || '?'}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 top-[52px] z-50 w-56 rounded-[12px] border border-border bg-surface-solid p-2 shadow-2xl">
            <div className="border-b border-border px-3 py-2.5">
              <div className="truncate text-[13px] font-bold">{fullName}</div>
              <div className="truncate text-[11.5px] text-text-secondary">{email}</div>
            </div>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-[9px] px-3 py-2.5 text-[13px] hover:bg-bg"
            >
              Profil / Ayarlar
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full rounded-[9px] px-3 py-2.5 text-left text-[13px] text-danger hover:bg-danger-bg"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
