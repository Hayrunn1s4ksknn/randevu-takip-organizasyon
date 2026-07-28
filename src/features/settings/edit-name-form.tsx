'use client'

import { useActionState, useEffect } from 'react'
import { updateFullName } from './actions'
import { useUiStore } from '@/store/ui'

export function EditNameForm({ initialFullName }: { initialFullName: string }) {
  const [state, action, pending] = useActionState(updateFullName, undefined)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) showToast('Ad Soyad güncellendi')
  }, [state, showToast])

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        required
        name="full_name"
        defaultValue={initialFullName}
        placeholder="Ad Soyad"
        className="w-full max-w-[240px] rounded-[9px] border border-border bg-bg px-3.5 py-2 text-[15px] font-bold text-text-primary outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-60"
      >
        Kaydet
      </button>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
    </form>
  )
}
