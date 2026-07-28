import { TaskItem } from './task-item'
import type { AppointmentPriority, TaskStatus } from '@/types/database'

type Task = {
  id: number
  title: string
  deadline: string | null
  priority: AppointmentPriority
  status: TaskStatus
}

export function TasksList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="text-[13px] text-text-secondary">Kayıt bulunamadı.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
    </div>
  )
}
