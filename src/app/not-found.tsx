import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[440px] animate-fade-in rounded-[20px] border border-border bg-surface-solid p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-bg text-lg font-bold text-accent">
          404
        </div>
        <div className="mt-5 text-lg font-bold text-text-primary">Sayfa bulunamadı</div>
        <p className="mt-2 text-[13.5px] text-text-secondary">
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-[9px] bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
        >
          Dashboard&apos;a dön
        </Link>
      </div>
    </div>
  )
}
