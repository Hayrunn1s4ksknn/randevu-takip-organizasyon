import { getTopOrganizations, getTopStaff, getYearlyPerformance } from '@/services/reports'

export default async function ReportsPage() {
  const [topOrgs, topStaff, yearly] = await Promise.all([
    getTopOrganizations(),
    getTopStaff(),
    getYearlyPerformance(),
  ])

  return (
    <div className="grid animate-fade-in grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">En Aktif Kurumlar</div>
        {topOrgs.length === 0 ? (
          <p className="text-[13px] text-text-secondary">Henüz veri yok.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topOrgs.map((o) => (
              <div key={o.name}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span>{o.name}</span>
                  <span className="font-bold">{o.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-[5px] bg-bg">
                  <div className="h-full rounded-[5px] bg-accent" style={{ width: o.pct }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">En Aktif Personel</div>
        {topStaff.length === 0 ? (
          <p className="text-[13px] text-text-secondary">Henüz veri yok.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topStaff.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span>{s.name}</span>
                  <span className="font-bold">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-[5px] bg-bg">
                  <div className="h-full rounded-[5px] bg-primary" style={{ width: s.pct }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">Yıllık Performans</div>
        {yearly.length === 0 ? (
          <p className="text-[13px] text-text-secondary">Henüz veri yok.</p>
        ) : (
          <div className="flex h-[140px] items-end gap-2">
            {yearly.map((y) => (
              <div key={y.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className="w-full rounded-t-[5px] bg-success"
                  style={{ height: y.heightPct }}
                  title={String(y.count)}
                />
                <div className="text-[10px] text-text-secondary">{y.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-1 text-[14.5px] font-bold">Toplantı Süreleri</div>
        <p className="text-[13px] text-text-secondary">
          Randevu tipi (online/fiziksel/telefon) ve süre alanları henüz şemada yok — bu rapor Faz 3&apos;te,
          ilgili alanlar eklendiğinde gerçek veriyle gelecek.
        </p>
      </div>
    </div>
  )
}
