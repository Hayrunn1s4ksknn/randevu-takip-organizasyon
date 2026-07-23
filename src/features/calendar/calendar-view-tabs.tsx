import Link from 'next/link'

const VIEWS = ['Gün', 'Hafta', 'Ay', 'Ajanda'] as const

export function CalendarViewTabs({
  view,
  monthOffset,
  day,
}: {
  view: string
  monthOffset: number
  day: string
}) {
  return (
    <div className="flex gap-1.5 rounded-[10px] border border-border bg-surface-solid p-1">
      {VIEWS.map((v) => (
        <Link
          key={v}
          href={`/calendar?view=${v}&month=${monthOffset}&day=${day}`}
          className="rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold"
          style={{
            background: view === v ? 'var(--color-primary)' : 'transparent',
            color: view === v ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          {v}
        </Link>
      ))}
    </div>
  )
}
