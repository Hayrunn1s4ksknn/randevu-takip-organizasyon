'use client'

import { useActionState, useEffect } from 'react'
import { createOrganization } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateOrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Kurum eklendi')
    }
  }, [state, closeModal, showToast])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input required name="name" placeholder="Kurum Adı" className={modalInputClass} />
      <input name="sector" placeholder="Sektör" className={modalInputClass} />
      <input name="contact_person" placeholder="Yetkili Kişi" className={modalInputClass} />
      <input name="phone" placeholder="Telefon" className={modalInputClass} />
      <input type="email" name="email" placeholder="E-posta" className={modalInputClass} />
      <input name="address" placeholder="Adres" className={modalInputClass} />
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Ekle" pending={pending} />
    </form>
  )
}
