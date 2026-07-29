'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePassword } from './actions'
import { useUiStore } from '@/store/ui'

const inputClass =
  'w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent'

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)
  const showToast = useUiStore((s) => s.showToast)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      showToast('Şifre güncellendi')
    }
  }, [state, showToast])

  return (
    <form ref={formRef} action={action} className="flex max-w-[360px] flex-col gap-3">
      <input
        required
        type="password"
        name="current_password"
        placeholder="Mevcut şifre"
        autoComplete="current-password"
        className={inputClass}
      />
      <input
        required
        type="password"
        name="new_password"
        placeholder="Yeni şifre (en az 6 karakter)"
        autoComplete="new-password"
        className={inputClass}
      />
      <input
        required
        type="password"
        name="confirm_password"
        placeholder="Yeni şifre (tekrar)"
        autoComplete="new-password"
        className={inputClass}
      />
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[9px] bg-primary px-4 py-2.5 text-[12.5px] font-bold text-white disabled:opacity-60"
      >
        Şifreyi Güncelle
      </button>
    </form>
  )
}
