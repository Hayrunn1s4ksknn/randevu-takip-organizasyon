import { AnimatedBackground } from '@/components/animated-background'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #0b1220, #1e3a8a)' }}
    >
      <AnimatedBackground />
      <div className="auth-card relative z-10 w-full max-w-[400px] animate-fade-in rounded-[20px] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-white">
            TR
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[1.2px] text-text-secondary">
              MERSİN TEKNOPARK
            </div>
            <div className="text-sm font-bold text-text-primary">TECHNOSCOPE RANDEVU</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
