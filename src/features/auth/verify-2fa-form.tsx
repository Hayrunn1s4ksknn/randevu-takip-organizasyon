'use client'

import { useActionState } from 'react'
import { verifyTwoFactorCode, signOut } from './actions'

export function VerifyTwoFactorForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(verifyTwoFactorCode, undefined)

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="code" className="mb-1 block text-[12.5px] font-medium text-text-secondary">
          Authenticator kodu
        </label>
        <input
          id="code"
          name="code"
          required
          autoFocus
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-center text-[16px] tracking-[0.3em] text-text-primary outline-none focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Doğrulanıyor...' : 'Doğrula'}
      </button>
      <button
        type="button"
        onClick={() => signOut()}
        className="mt-1 text-center text-[12.5px] font-semibold text-text-secondary hover:underline"
      >
        Farklı bir hesapla giriş yap
      </button>
    </form>
  )
}
