'use client'

import { useActionState, useEffect } from 'react'
import { updateTask } from './actions'
import { modalInputClass, ModalActions } from '@/components/modal'
import { useUiStore } from '@/store/ui'
import type { AppointmentPriority } from '@/types/database'

type TaskDefaults = {
  id: number
  title: string
  description: string | null
  deadline: string | null
  priority: AppointmentPriority
  appointment_id: number | null
  assigned_to: string | null
}

export function EditTaskForm({
  task,
  appointmentOptions,
  staffOptions,
}: {
  task: TaskDefaults
  appointmentOptions: { id: number; title: string }[]
  staffOptions: { id: string; name: string }[]
}) {
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
      <textarea
        name="description"
        placeholder="Açıklama (opsiyonel)"
        rows={2}
        defaultValue={task.description ?? ''}
        className={modalInputClass}
      />
      <input type="date" name="deadline" defaultValue={task.deadline ?? ''} className={modalInputClass} />
      <select name="priority" defaultValue={task.priority} className={modalInputClass}>
        <option value="Düşük">Düşük Öncelik</option>
        <option value="Orta">Orta Öncelik</option>
        <option value="Yüksek">Yüksek Öncelik</option>
      </select>
      <select name="assigned_to" defaultValue={task.assigned_to ?? ''} className={modalInputClass}>
        <option value="">Sorumlu seçin (opsiyonel)</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <select
        name="appointment_id"
        defaultValue={task.appointment_id?.toString() ?? ''}
        className={modalInputClass}
      >
        <option value="">Randevuya bağla (opsiyonel)</option>
        {appointmentOptions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title}
          </option>
        ))}
      </select>
      {state?.error && <p className="text-[12.5px] font-medium text-danger">{state.error}</p>}
      <ModalActions onCancel={closeModal} submitLabel="Kaydet" pending={pending} />
    </form>
  )
}
