'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useUiStore } from '@/store/ui'
import { useSwipeToClose } from '@/hooks/use-swipe-to-close'
import { Modal } from '@/components/modal'
import { EditContactForm } from './edit-contact-form'
import { softDeleteContact } from './actions'
import { STATUS_STYLE } from '@/lib/status-styles'
import type { AppointmentStatus } from '@/types/database'

type ContactDetail = {
  contact: {
    id: number
    name: string
    position: string | null
    company_id: number | null
    phone: string | null
    email: string | null
    notes: string | null
    tags: string[]
    last_contact: string | null
    organizations: { name: string } | null
  }
  appointments: { id: number; title: string; date: string; status: AppointmentStatus }[]
}

export function ContactDrawer({ orgOptions }: { orgOptions: { id: number; name: string }[] }) {
  const contactDrawerId = useUiStore((s) => s.contactDrawerId)
  const closeContactDrawer = useUiStore((s) => s.closeContactDrawer)
  const activeModal = useUiStore((s) => s.activeModal)
  const editTargetId = useUiStore((s) => s.editTargetId)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const swipeHandlers = useSwipeToClose(closeContactDrawer)

  const { data } = useQuery<ContactDetail>({
    queryKey: ['contact-detail', contactDrawerId],
    queryFn: async () => {
      const res = await fetch(`/api/contacts/${contactDrawerId}`)
      return res.json()
    },
    enabled: contactDrawerId !== null,
  })

  if (contactDrawerId === null) return null

  const c = data?.contact

  function handleDelete() {
    if (!c) return
    if (!confirm(`"${c.name}" kişisini silmek istediğine emin misin?`)) return
    startTransition(async () => {
      await softDeleteContact(c.id)
      closeContactDrawer()
      showToast('Kişi silindi')
      router.refresh()
    })
  }

  const initials = c?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <div onClick={closeContactDrawer} className="fixed inset-0 z-40 bg-black/35" />
      <div
        {...swipeHandlers}
        className="animate-slide-in fixed right-0 top-0 z-[41] flex h-full w-[400px] max-w-[92vw] flex-col overflow-auto bg-surface-solid p-6 shadow-2xl"
      >
        <div className="text-right text-xl leading-none text-text-secondary">
          <button onClick={closeContactDrawer} className="flex h-11 w-11 items-center justify-center">
            ×
          </button>
        </div>
        {!c && <p className="mt-4 text-[13px] text-text-secondary">Yükleniyor...</p>}
        {c && (
          <>
            <div className="mt-2 flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {initials}
              </div>
              <div>
                <div className="text-base font-bold">{c.name}</div>
                <div className="text-[12.5px] text-text-secondary">
                  {c.position ?? '-'} {c.organizations?.name ? `· ${c.organizations.name}` : ''}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 text-[13px]">
              <div>📞 {c.phone ?? '-'}</div>
              <div>✉️ {c.email ?? '-'}</div>
              <div>
                Son görüşme:{' '}
                {c.last_contact ? new Date(`${c.last_contact}T00:00:00`).toLocaleDateString('tr-TR') : '-'}
              </div>
            </div>
            {c.notes && <div className="mt-4 text-[13px] leading-relaxed text-text-secondary">{c.notes}</div>}

            {data && data.appointments.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[12.5px] font-bold text-text-secondary">Randevuları</div>
                <div className="flex flex-col gap-2">
                  {data.appointments.map((a) => {
                    const style = STATUS_STYLE[a.status]
                    return (
                      <div key={a.id} className="flex items-center justify-between text-[13px]">
                        <span>{a.title}</span>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => openModal('edit-contact', c.id)}
                className="flex-1 rounded-[9px] border border-border px-4 py-2.5 text-[12.5px] font-bold"
              >
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="rounded-[9px] border border-danger px-4 py-2.5 text-[12.5px] font-bold text-danger disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </>
        )}
      </div>

      {c && (
        <Modal
          open={activeModal === 'edit-contact' && editTargetId === c.id}
          onClose={closeModal}
          title="Kişiyi Düzenle"
        >
          <EditContactForm contact={c} orgOptions={orgOptions} />
        </Modal>
      )}
    </>
  )
}
