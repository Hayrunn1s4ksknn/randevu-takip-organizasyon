'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from './actions'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="email" className="mb-1 block text-[12.5px] font-medium text-text-secondary">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-[12.5px] font-medium text-text-secondary">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
        />
      </div>
      <label className="flex items-center gap-2 text-[12.5px] text-text-secondary">
        <input type="checkbox" name="remember" defaultChecked className="h-3.5 w-3.5" />
        Beni hatırla
      </label>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Giriş yapılıyor...' : 'Giriş yap'}
      </button>
      <Link
        href="/forgot-password"
        className="mt-1 text-center text-[12.5px] font-semibold text-accent hover:underline"
      >
        Şifremi unuttum
      </Link>
    </form>
  )
}
