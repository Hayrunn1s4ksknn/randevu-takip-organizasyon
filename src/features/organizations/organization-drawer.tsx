'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useUiStore } from '@/store/ui'
import { useSwipeToClose } from '@/hooks/use-swipe-to-close'
import { Modal } from '@/components/modal'
import { EditOrganizationForm } from './edit-organization-form'
import { softDeleteOrganization } from './actions'
import { STATUS_STYLE } from '@/lib/status-styles'
import type { AppointmentStatus } from '@/types/database'

type OrgDetail = {
  organization: {
    id: number
    name: string
    sector: string | null
    logo_letter: string | null
    contact_person: string | null
    phone: string | null
    email: string | null
    address: string | null
  }
  totalAppointments: number
  recentAppointments: { id: number; title: string; date: string; status: AppointmentStatus }[]
}

export function OrganizationDrawer() {
  const orgDrawerId = useUiStore((s) => s.orgDrawerId)
  const closeOrgDrawer = useUiStore((s) => s.closeOrgDrawer)
  const activeModal = useUiStore((s) => s.activeModal)
  const editTargetId = useUiStore((s) => s.editTargetId)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const showToast = useUiStore((s) => s.showToast)
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const swipeHandlers = useSwipeToClose(closeOrgDrawer)

  const { data } = useQuery<OrgDetail>({
    queryKey: ['organization-detail', orgDrawerId],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgDrawerId}`)
      return res.json()
    },
    enabled: orgDrawerId !== null,
  })

  if (orgDrawerId === null) return null

  const o = data?.organization

  function handleDelete() {
    if (!o) return
    if (!confirm(`"${o.name}" kurumunu silmek istediğine emin misin?`)) return
    startTransition(async () => {
      await softDeleteOrganization(o.id)
      closeOrgDrawer()
      showToast('Kurum silindi')
      router.refresh()
    })
  }

  return (
    <>
      <div onClick={closeOrgDrawer} className="fixed inset-0 z-40 bg-black/35" />
      <div
        {...swipeHandlers}
        className="animate-slide-in fixed right-0 top-0 z-[41] flex h-full w-[420px] max-w-[92vw] flex-col overflow-auto bg-surface-solid p-6 shadow-2xl"
      >
        <div className="text-right text-xl leading-none text-text-secondary">
          <button onClick={closeOrgDrawer} className="flex h-11 w-11 items-center justify-center">
            ×
          </button>
        </div>
        {!o && <p className="mt-4 text-[13px] text-text-secondary">Yükleniyor...</p>}
        {o && (
          <>
            <div className="mt-2 flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-white">
                {o.logo_letter ?? '?'}
              </div>
              <div>
                <div className="text-base font-bold">{o.name}</div>
                <div className="text-[12.5px] text-text-secondary">{o.sector ?? '-'}</div>
              </div>
            </div>

            <div className="mt-4 flex h-[110px] items-center justify-center rounded-[10px] bg-bg font-mono text-[11px] text-text-secondary">
              harita önizlemesi
            </div>

            <div className="mt-4 flex flex-col gap-2 text-[13px]">
              <div>👤 {o.contact_person ?? '-'}</div>
              <div>📞 {o.phone ?? '-'}</div>
              <div>✉️ {o.email ?? '-'}</div>
              <div>📍 {o.address ?? '-'}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-[9px] bg-bg p-2.5">
                <div className="text-[10.5px] text-text-secondary">Toplam Randevu</div>
                <div className="text-base font-bold">{data.totalAppointments}</div>
              </div>
              <div className="rounded-[9px] bg-bg p-2.5">
                <div className="text-[10.5px] text-text-secondary">Son Randevular</div>
                <div className="text-base font-bold">{data.recentAppointments.length}</div>
              </div>
            </div>

            {data.recentAppointments.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[12.5px] font-bold text-text-secondary">Son Randevular</div>
                <div className="flex flex-col gap-2">
                  {data.recentAppointments.map((a) => {
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
                onClick={() => openModal('edit-organization', o.id)}
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

      {o && (
        <Modal
          open={activeModal === 'edit-organization' && editTargetId === o.id}
          onClose={closeModal}
          title="Kurumu Düzenle"
        >
          <EditOrganizationForm organization={o} />
        </Modal>
      )}
    </>
  )
}
