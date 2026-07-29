'use client'

import { useUiStore } from '@/store/ui'
import { Modal } from '@/components/modal'
import { CreateAppointmentForm } from '@/features/appointments/create-appointment-form'
import { CreateContactForm } from '@/features/contacts/create-contact-form'
import { CreateOrganizationForm } from '@/features/organizations/create-organization-form'
import { CreateTaskForm } from '@/features/tasks/create-task-form'

export function QuickActionModals({
  orgOptions,
  contactOptions,
  staffOptions,
  appointmentOptions,
}: {
  orgOptions: { id: number; name: string }[]
  contactOptions: { id: number; name: string }[]
  staffOptions: { id: string; name: string }[]
  appointmentOptions: { id: number; title: string }[]
}) {
  const activeModal = useUiStore((s) => s.activeModal)
  const closeModal = useUiStore((s) => s.closeModal)

  return (
    <>
      <Modal open={activeModal === 'appointment'} onClose={closeModal} title="Yeni Randevu">
        <CreateAppointmentForm
          orgOptions={orgOptions}
          contactOptions={contactOptions}
          staffOptions={staffOptions}
        />
      </Modal>
      <Modal open={activeModal === 'contact'} onClose={closeModal} title="Yeni Kişi">
        <CreateContactForm orgOptions={orgOptions} />
      </Modal>
      <Modal open={activeModal === 'organization'} onClose={closeModal} title="Yeni Kurum">
        <CreateOrganizationForm />
      </Modal>
      <Modal open={activeModal === 'task'} onClose={closeModal} title="Yeni Görev">
        <CreateTaskForm appointmentOptions={appointmentOptions} staffOptions={staffOptions} />
      </Modal>
    </>
  )
}
