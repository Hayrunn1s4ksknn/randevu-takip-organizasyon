'use client'

import { useActionState, useEffect } from 'react'
import { createTask } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateTaskForm({
  appointmentOptions,
  staffOptions,
}: {
  appointmentOptions: { id: number; title: string }[]
  staffOptions: { id: string; name: string }[]
}) {
  const [state, action, pending] = useActionState(createTask, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Görev oluşturuldu')
    }
  }, [state, closeModal, showToast])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input required name="title" placeholder="Görev başlığı" className={modalInputClass} />
      <textarea name="description" placeholder="Açıklama (opsiyonel)" rows={2} className={modalInputClass} />
      <input type="date" name="deadline" className={modalInputClass} />
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
      <select name="appointment_id" defaultValue="" className={modalInputClass}>
        <option value="">Randevuya bağla (opsiyonel)</option>
        {appointmentOptions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title}
          </option>
        ))}
      </select>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Oluştur" pending={pending} />
    </form>
  )
}
