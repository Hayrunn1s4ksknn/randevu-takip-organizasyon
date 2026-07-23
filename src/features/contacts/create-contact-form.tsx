'use client'

import { useActionState, useEffect } from 'react'
import { createContact } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateContactForm({ orgOptions }: { orgOptions: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(createContact, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Kişi eklendi')
    }
  }, [state, closeModal, showToast])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input required name="name" placeholder="Ad Soyad" className={modalInputClass} />
      <input name="position" placeholder="Pozisyon" className={modalInputClass} />
      <select name="company_id" className={modalInputClass} defaultValue="">
        <option value="">Şirket seçin</option>
        {orgOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <input name="phone" placeholder="Telefon" className={modalInputClass} />
      <input type="email" name="email" placeholder="E-posta" className={modalInputClass} />
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Ekle" pending={pending} />
    </form>
  )
}
