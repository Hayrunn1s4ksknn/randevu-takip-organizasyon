import Link from 'next/link'

export function MonthNav({
  label,
  monthOffset,
  view,
  day,
}: {
  label: string
  monthOffset: number
  view: string
  day: string
}) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/calendar?view=${view}&month=${monthOffset - 1}&day=${day}`}
        className="rounded-[9px] border border-border bg-surface-solid px-3.5 py-2"
      >
        ‹
      </Link>
      <div className="rounded-[9px] border border-border bg-surface-solid px-4 py-2 text-[13.5px] font-bold">
        {label}
      </div>
      <Link
        href={`/calendar?view=${view}&month=${monthOffset + 1}&day=${day}`}
        className="rounded-[9px] border border-border bg-surface-solid px-3.5 py-2"
      >
        ›
      </Link>
    </div>
  )
}
