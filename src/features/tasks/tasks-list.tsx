import { TaskItem } from './task-item'
import type { AppointmentPriority, TaskStatus } from '@/types/database'

type Task = {
  id: number
  title: string
  description: string | null
  deadline: string | null
  priority: AppointmentPriority
  status: TaskStatus
  appointment_id: number | null
  assigned_to: string | null
  appointments: { title: string } | null
  assigned_profile: { full_name: string | null } | null
}

export function TasksList({
  tasks,
  appointmentOptions,
  staffOptions,
}: {
  tasks: Task[]
  appointmentOptions: { id: number; title: string }[]
  staffOptions: { id: string; name: string }[]
}) {
  if (tasks.length === 0) {
    return <p className="text-[13px] text-text-secondary">Kayıt bulunamadı.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} appointmentOptions={appointmentOptions} staffOptions={staffOptions} />
      ))}
    </div>
  )
}
