export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[400px] animate-fade-in rounded-[20px] border border-border bg-surface-solid p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-white">
            RP
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[1.2px] text-text-secondary">
              MERSİN TEKNOPARK
            </div>
            <div className="text-sm font-bold text-text-primary">RANDEVU PANELİ</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
