'use client'

import { useActionState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateOrganization } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

type OrgDefaults = {
  id: number
  name: string
  sector: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export function EditOrganizationForm({ organization }: { organization: OrgDefaults }) {
  const boundAction = updateOrganization.bind(null, organization.id)
  const [state, action, pending] = useActionState(boundAction, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Kurum güncellendi')
      queryClient.invalidateQueries({ queryKey: ['organization-detail', organization.id] })
    }
  }, [state, closeModal, showToast, queryClient, organization.id])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        required
        name="name"
        placeholder="Kurum Adı"
        defaultValue={organization.name}
        className={modalInputClass}
      />
      <input
        name="sector"
        placeholder="Sektör"
        defaultValue={organization.sector ?? ''}
        className={modalInputClass}
      />
      <input
        name="contact_person"
        placeholder="Yetkili Kişi"
        defaultValue={organization.contact_person ?? ''}
        className={modalInputClass}
      />
      <input
        name="phone"
        placeholder="Telefon"
        defaultValue={organization.phone ?? ''}
        className={modalInputClass}
      />
      <input
        type="email"
        name="email"
        placeholder="E-posta"
        defaultValue={organization.email ?? ''}
        className={modalInputClass}
      />
      <input
        name="address"
        placeholder="Adres"
        defaultValue={organization.address ?? ''}
        className={modalInputClass}
      />
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Kaydet" pending={pending} />
    </form>
  )
}
