'use client'

import { useActionState, useEffect } from 'react'
import { updateTask } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'
import type { AppointmentPriority } from '@/types/database'

type TaskDefaults = {
  id: number
  title: string
  deadline: string | null
  priority: AppointmentPriority
}

export function EditTaskForm({ task }: { task: TaskDefaults }) {
  const boundAction = updateTask.bind(null, task.id)
  const [state, action, pending] = useActionState(boundAction, undefined)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  useEffect(() => {
    if (state?.success) {
      closeModal()
      showToast('Görev güncellendi')
    }
  }, [state, closeModal, showToast])

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        required
        name="title"
        placeholder="Görev başlığı"
        defaultValue={task.title}
        className={modalInputClass}
      />
      <input type="date" name="deadline" defaultValue={task.deadline ?? ''} className={modalInputClass} />
      <select name="priority" defaultValue={task.priority} className={modalInputClass}>
        <option value="Düşük">Düşük Öncelik</option>
        <option value="Orta">Orta Öncelik</option>
        <option value="Yüksek">Yüksek Öncelik</option>
      </select>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Kaydet" pending={pending} />
    </form>
  )
}
