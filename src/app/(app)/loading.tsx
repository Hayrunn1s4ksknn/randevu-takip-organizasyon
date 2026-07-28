export default function Loading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="h-9 w-64 max-w-full animate-pulse rounded-[10px] bg-border" />
        <div className="h-9 w-28 animate-pulse rounded-[9px] bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface-solid" />
        ))}
      </div>
    </div>
  )
}
