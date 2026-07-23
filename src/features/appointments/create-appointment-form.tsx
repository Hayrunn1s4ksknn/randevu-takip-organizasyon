'use client'

import { useActionState, useEffect } from 'react'
import { createAppointment } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateAppointmentForm({ orgOptions }: { orgOptions: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(createAppointment, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Randevu oluşturuldu')
    }
  }, [state, closeModal, showToast])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input required name="title" placeholder="Başlık" className={modalInputClass} />
      <select name="org_id" className={modalInputClass} defaultValue="">
        <option value="">Kurum seçin</option>
        {orgOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2.5">
        <input required type="date" name="date" className={`${modalInputClass} flex-1`} />
        <input type="time" name="time" className={`${modalInputClass} flex-1`} />
      </div>
      <input name="location" placeholder="Konum" className={modalInputClass} />
      <select name="priority" defaultValue="Orta" className={modalInputClass}>
        <option value="Düşük">Düşük Öncelik</option>
        <option value="Orta">Orta Öncelik</option>
        <option value="Yüksek">Yüksek Öncelik</option>
      </select>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Oluştur" pending={pending} />
    </form>
  )
}
