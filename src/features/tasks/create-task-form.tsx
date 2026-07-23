'use client'

import { useActionState, useEffect } from 'react'
import { createTask } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'

export function CreateTaskForm() {
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
      <input type="date" name="deadline" className={modalInputClass} />
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
