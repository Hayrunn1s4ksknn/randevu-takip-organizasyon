import { getTasksList } from '@/services/tasks'
import { getAppointmentOptions } from '@/services/appointments'
import { getStaffOptions } from '@/services/profile'
import { TaskFilterTabs } from '@/features/tasks/task-filter-tabs'
import { TasksList } from '@/features/tasks/tasks-list'
import { NewTaskButton } from '@/features/tasks/new-task-button'
import type { TaskStatus } from '@/types/database'

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const filter = (status as TaskStatus | 'all' | undefined) ?? 'all'
  const [tasks, appointmentOptions, staffOptions] = await Promise.all([
    getTasksList(filter),
    getAppointmentOptions(),
    getStaffOptions(),
  ])

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <TaskFilterTabs />
        <NewTaskButton />
      </div>
      <TasksList tasks={tasks} appointmentOptions={appointmentOptions} staffOptions={staffOptions} />
    </div>
  )
}
