'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setTaskStatus, deleteTask } from './actions'
import { Modal } from '@/components/modal'
import { EditTaskForm } from './edit-task-form'
import { useUiStore } from '@/store/ui'
import { PRIORITY_STYLE } from '@/lib/status-styles'
import type { AppointmentPriority, TaskStatus } from '@/types/database'

type Task = {
  id: number
  title: string
  deadline: string | null
  priority: AppointmentPriority
  status: TaskStatus
}

export function TaskItem({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const activeModal = useUiStore((s) => s.activeModal)
  const editTargetId = useUiStore((s) => s.editTargetId)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)

  const prioStyle = PRIORITY_STYLE[task.priority]
  const done = task.status === 'done'

  function toggleStatus() {
    startTransition(async () => {
      await setTaskStatus(task.id, done ? 'todo' : 'done')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`"${task.title}" görevini silmek istediğine emin misin?`)) return
    startTransition(async () => {
      await deleteTask(task.id)
      showToast('Görev silindi')
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-solid p-4">
        <input
          type="checkbox"
          checked={done}
          disabled={pending}
          onChange={toggleStatus}
          className="h-[18px] w-[18px] shrink-0 accent-accent"
        />
        <div className="min-w-0 flex-1">
          <div
            className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold"
            style={done ? { textDecoration: 'line-through', opacity: 0.55 } : undefined}
          >
            {task.title}
          </div>
          <div className="text-[12.5px] text-text-secondary">
            {task.deadline
              ? new Date(`${task.deadline}T00:00:00`).toLocaleDateString('tr-TR')
              : 'Son tarih yok'}
          </div>
        </div>
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold"
          style={{ background: prioStyle.bg, color: prioStyle.color }}
        >
          {task.priority}
        </span>
        <button
          onClick={() => openModal('edit-task', task.id)}
          className="shrink-0 rounded-[9px] border border-border px-3 py-1.5 text-[12px] font-bold"
        >
          Düzenle
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="shrink-0 rounded-[9px] border border-danger px-3 py-1.5 text-[12px] font-bold text-danger disabled:opacity-50"
        >
          Sil
        </button>
      </div>

      <Modal
        open={activeModal === 'edit-task' && editTargetId === task.id}
        onClose={closeModal}
        title="Görevi Düzenle"
      >
        <EditTaskForm task={task} />
      </Modal>
    </>
  )
}
