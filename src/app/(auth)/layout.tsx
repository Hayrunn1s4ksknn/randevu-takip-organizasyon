import { AnimatedBackground } from '@/components/animated-background'

const FEATURES = [
  'Randevu ve toplantı takibi',
  'Görev ve hatırlatma yönetimi',
  'Kurum ve kişi kayıtları',
  'Anlık raporlama ve dışa aktarma',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div
        className="relative flex min-h-[260px] shrink-0 items-center justify-center overflow-hidden px-6 py-10 md:min-h-screen md:w-1/2 md:px-16 md:py-12"
        style={{ background: 'linear-gradient(135deg, #0b1220, #1e3a8a)' }}
      >
        <AnimatedBackground />
        <div className="relative z-10 max-w-[460px] text-center md:text-left">
          <div className="mb-6 hidden items-center gap-3 md:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/15 text-base font-bold text-white">
              TR
            </div>
            <div className="text-[11px] font-semibold tracking-[1.4px] text-white/60">MERSİN TEKNOPARK</div>
          </div>
          <h1 className="text-[30px] font-extrabold leading-[1.15] text-white md:text-[44px]">
            Mersin Technoscope Randevu
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/70 md:text-[15px]">
            Kurumsal randevu, görev ve organizasyon süreçlerinizi tek panelden yönetin.
          </p>
          <ul className="mt-8 hidden flex-col gap-3 md:flex">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-white/80">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-bg px-4 py-10">
        <div className="auth-card w-full max-w-[400px] animate-fade-in rounded-[20px] border border-border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
