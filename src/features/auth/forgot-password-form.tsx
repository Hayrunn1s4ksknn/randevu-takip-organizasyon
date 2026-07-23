'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from './actions'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <form action={action} className="flex flex-col gap-3">
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
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Gönderiliyor...' : 'Sıfırlama bağlantısı gönder'}
      </button>
      <Link
        href="/login"
        className="mt-1 text-center text-[12.5px] font-semibold text-accent hover:underline"
      >
        Girişe dön
      </Link>
    </form>
  )
}
