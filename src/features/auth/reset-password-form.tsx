'use client'

import { useActionState } from 'react'
import { resetPassword } from './actions'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <form action={action} className="flex flex-col gap-3">
      <div>
        <label htmlFor="password" className="mb-1 block text-[12.5px] font-medium text-text-secondary">
          Yeni şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-[12.5px] font-medium text-text-secondary">
          Yeni şifre (tekrar)
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Güncelleniyor...' : 'Şifreyi güncelle'}
      </button>
    </form>
  )
}
