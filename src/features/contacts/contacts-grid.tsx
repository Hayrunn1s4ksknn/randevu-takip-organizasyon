'use client'

import { useUiStore } from '@/store/ui'

const COLORS = ['#2563EB', '#8B5CF6', '#22C55E', '#F59E0B', '#0EA5E9', '#EF4444']

type Contact = {
  id: number
  name: string
  position: string | null
  phone: string | null
  email: string | null
  tags: string[]
  last_contact: string | null
  organizations: { name: string } | null
}

export function ContactsGrid({ contacts }: { contacts: Contact[] }) {
  const openContactDrawer = useUiStore((s) => s.openContactDrawer)

  if (contacts.length === 0) {
    return <p className="text-[13px] text-text-secondary">Kayıt bulunamadı.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {contacts.map((c, i) => {
        const initials = c.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        return (
          <div
            key={c.id}
            onClick={() => openContactDrawer(c.id)}
            className="cursor-pointer rounded-2xl border border-border bg-surface-solid p-[18px] hover:border-accent"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                  {c.name}
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-text-secondary">
                  {c.position ?? '-'} {c.organizations?.name ? `· ${c.organizations.name}` : ''}
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex flex-col gap-1 text-[12.5px] text-text-secondary">
              <div>📞 {c.phone ?? '-'}</div>
              <div>✉️ {c.email ?? '-'}</div>
              <div>
                Son görüşme:{' '}
                {c.last_contact ? new Date(`${c.last_contact}T00:00:00`).toLocaleDateString('tr-TR') : '-'}
              </div>
            </div>
            {c.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-accent-bg px-2 py-0.5 text-[10.5px] font-semibold text-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
