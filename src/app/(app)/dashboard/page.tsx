import { getDashboardData } from '@/services/dashboard'
import { getCurrentUserAndProfile } from '@/services/profile'
import { QuickActions } from '@/features/dashboard/quick-actions'

export default async function DashboardPage() {
  const [data, { profile, user }] = await Promise.all([getDashboardData(), getCurrentUserAndProfile()])
  const firstName = (profile?.full_name ?? user?.email ?? 'Kullanıcı').split(' ')[0]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div
        className="mb-[22px] flex flex-wrap items-center justify-between gap-6 rounded-[20px] p-7 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
      >
        <div>
          <div className="text-[12.5px] font-semibold tracking-[0.4px] opacity-75">{data.todayLabel}</div>
          <div className="mt-1.5 text-2xl font-extrabold">Hoş geldin, {firstName} 👋</div>
          <div className="mt-1.5 max-w-[460px] text-[13.5px] opacity-85">
            Bugün {data.stats.today} randevun var. Tamamlanma oranın %{data.stats.completionRate}.
          </div>
          <QuickActions />
        </div>
        <div className="flex shrink-0 items-center justify-center">
          <div
            className="flex h-[132px] w-[132px] items-center justify-center rounded-full p-2.5"
            style={{
              background: `conic-gradient(#fff ${data.stats.completionRate}%, rgba(255,255,255,0.25) 0)`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-primary">
              <div className="text-[26px] font-extrabold">%{data.stats.completionRate}</div>
              <div className="text-[10.5px] opacity-80">Performans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.heroStats.map((hs) => (
          <div key={hs.label} className="rounded-2xl border border-border bg-surface-solid p-[18px] px-5">
            <div className="text-[12.5px] font-semibold text-text-secondary">{hs.label}</div>
            <div className="mt-2 text-[28px] font-extrabold">{hs.value}</div>
            <div className="mt-1.5 text-xs font-semibold" style={{ color: hs.trendColor }}>
              {hs.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Widgets */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.widgets.map((w) => (
          <div
            key={w.label}
            className="rounded-[14px] border border-border bg-surface-solid p-[15px] px-[17px]"
          >
            <div className="text-[11.5px] font-semibold text-text-secondary">{w.label}</div>
            <div className="mt-1.5 text-xl font-extrabold">{w.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart + status donut */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
          <div className="mb-4 text-[14.5px] font-bold">Aylık Randevu Grafiği</div>
          <div className="flex h-[150px] items-end gap-2">
            {data.monthlyData.map((m) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  title={String(m.count)}
                  className="w-full rounded-t-[5px] bg-accent"
                  style={{ height: m.heightPct }}
                />
                <div className="text-[10px] text-text-secondary">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
          <div className="mb-4 text-[14.5px] font-bold">Durum Dağılımı</div>
          <div className="flex items-center gap-5">
            <div
              className="h-[110px] w-[110px] shrink-0 rounded-full"
              style={{ background: data.statusDonutGradient }}
            />
            <div className="flex min-w-0 flex-col gap-2.5">
              {data.statusDist.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[12.5px]">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                  <span className="text-text-secondary">{s.label}</span>
                  <span className="ml-auto font-bold">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Org distribution + heatmap */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
          <div className="mb-4 text-[14.5px] font-bold">Kurumlara Göre Dağılım</div>
          <div className="flex flex-col gap-3">
            {data.orgDistribution.length === 0 && (
              <p className="text-[13px] text-text-secondary">Henüz randevu kaydı yok.</p>
            )}
            {data.orgDistribution.map((od) => (
              <div key={od.name}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span>{od.name}</span>
                  <span className="font-bold text-text-secondary">{od.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-[5px] bg-bg">
                  <div className="h-full rounded-[5px] bg-primary" style={{ width: od.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
          <div className="mb-4 text-[14.5px] font-bold">Saatlere Göre Yoğunluk</div>
          <div className="grid grid-cols-12 gap-1">
            {data.heatmap.map((h, i) => (
              <div
                key={i}
                title={h.label}
                className="aspect-square rounded"
                style={{ background: h.color }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] text-text-secondary">
            <span>09:00</span>
            <span>20:00</span>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">Son Aktiviteler</div>
        <div className="flex flex-col gap-4">
          {data.activityFeed.length === 0 && (
            <p className="text-[13px] text-text-secondary">Henüz aktivite yok.</p>
          )}
          {data.activityFeed.map((act, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {act.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px]">
                  <strong>{act.who}</strong> {act.action}
                </div>
                <div className="mt-0.5 text-[11.5px] text-text-secondary">{act.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
