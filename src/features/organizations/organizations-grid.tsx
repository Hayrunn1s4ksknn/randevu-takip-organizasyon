'use client'

import { useUiStore } from '@/store/ui'

type Organization = {
  id: number
  name: string
  sector: string | null
  logo_letter: string | null
  totalAppointments: number
  lastContact: string
}

export function OrganizationsGrid({ organizations }: { organizations: Organization[] }) {
  const openOrgDrawer = useUiStore((s) => s.openOrgDrawer)

  if (organizations.length === 0) {
    return <p className="text-[13px] text-text-secondary">Kayıt bulunamadı.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {organizations.map((o) => (
        <div
          key={o.id}
          onClick={() => openOrgDrawer(o.id)}
          className="cursor-pointer rounded-2xl border border-border bg-surface-solid p-[18px] hover:border-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
              {o.logo_letter ?? '?'}
            </div>
            <div className="min-w-0">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                {o.name}
              </div>
              <div className="text-xs text-text-secondary">{o.sector ?? '-'}</div>
            </div>
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <div className="rounded-[9px] bg-bg px-2.5 py-2">
              <div className="text-[10.5px] text-text-secondary">Toplam Randevu</div>
              <div className="text-[15px] font-bold">{o.totalAppointments}</div>
            </div>
            <div className="rounded-[9px] bg-bg px-2.5 py-2">
              <div className="text-[10.5px] text-text-secondary">Son Görüşme</div>
              <div className="text-[13px] font-bold">{o.lastContact}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
