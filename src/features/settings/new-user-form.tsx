'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createUser } from './user-management-actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function NewUserForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createUser, undefined)
  const showToast = useUiStore((s) => s.showToast)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      showToast('Kullanıcı oluşturuldu')
      onDone()
    }
  }, [state, showToast, onDone])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input required name="full_name" placeholder="Ad Soyad" className={modalInputClass} />
      <input required type="email" name="email" placeholder="E-posta" className={modalInputClass} />
      <input
        required
        type="password"
        name="password"
        placeholder="Geçici şifre (en az 6 karakter)"
        className={modalInputClass}
      />
      <select name="role" defaultValue="personel" className={modalInputClass}>
        <option value="personel">Personel</option>
        <option value="yonetici">Yönetici</option>
        <option value="admin">Admin</option>
        <option value="misafir">Misafir</option>
      </select>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={onDone} submitLabel="Oluştur" pending={pending} />
    </form>
  )
}
