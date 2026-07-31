'use client'

import { useActionState, useEffect } from 'react'
import { createAppointment } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateAppointmentForm({
  orgOptions,
  contactOptions,
  staffOptions,
}: {
  orgOptions: { id: number; name: string }[]
  contactOptions: { id: number; name: string }[]
  staffOptions: { id: string; name: string }[]
}) {
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
      <select name="assigned_to" defaultValue="" className={modalInputClass}>
        <option value="">Sorumlu seçin (opsiyonel)</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <div>
        <label className="mb-1 block text-[12px] font-semibold text-text-secondary">
          Katılımcılar (opsiyonel)
        </label>
        <div className="flex max-h-[140px] flex-col gap-1.5 overflow-y-auto rounded-[9px] border border-border bg-bg px-3.5 py-2.5">
          {contactOptions.length === 0 && (
            <p className="text-[12.5px] text-text-secondary">Henüz kayıtlı kişi yok.</p>
          )}
          {contactOptions.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-[13px] text-text-primary">
              <input type="checkbox" name="contact_ids" value={c.id} className="h-4 w-4 accent-accent" />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5">
        <select name="meeting_type" defaultValue="" className={`${modalInputClass} flex-1`}>
          <option value="">Toplantı tipi</option>
          <option value="Online">Online</option>
          <option value="Fiziksel">Fiziksel</option>
          <option value="Telefon">Telefon</option>
        </select>
        <input
          type="number"
          name="duration_minutes"
          placeholder="Süre (dk)"
          min={1}
          className={`${modalInputClass} flex-1`}
        />
      </div>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Oluştur" pending={pending} />
    </form>
  )
}
