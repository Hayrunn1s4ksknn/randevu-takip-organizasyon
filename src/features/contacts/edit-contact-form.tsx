'use client'

import { useActionState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateContact } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

type ContactDefaults = {
  id: number
  name: string
  position: string | null
  company_id: number | null
  phone: string | null
  email: string | null
}

export function EditContactForm({
  contact,
  orgOptions,
}: {
  contact: ContactDefaults
  orgOptions: { id: number; name: string }[]
}) {
  const boundAction = updateContact.bind(null, contact.id)
  const [state, action, pending] = useActionState(boundAction, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Kişi güncellendi')
      queryClient.invalidateQueries({ queryKey: ['contact-detail', contact.id] })
    }
  }, [state, closeModal, showToast, queryClient, contact.id])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        required
        name="name"
        placeholder="Ad Soyad"
        defaultValue={contact.name}
        className={modalInputClass}
      />
      <input
        name="position"
        placeholder="Pozisyon"
        defaultValue={contact.position ?? ''}
        className={modalInputClass}
      />
      <select name="company_id" className={modalInputClass} defaultValue={contact.company_id ?? ''}>
        <option value="">Şirket seçin</option>
        {orgOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <input
        name="phone"
        placeholder="Telefon"
        defaultValue={contact.phone ?? ''}
        className={modalInputClass}
      />
      <input
        type="email"
        name="email"
        placeholder="E-posta"
        defaultValue={contact.email ?? ''}
        className={modalInputClass}
      />
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Kaydet" pending={pending} />
    </form>
  )
}
