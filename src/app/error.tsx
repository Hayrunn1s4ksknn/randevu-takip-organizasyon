'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[440px] animate-fade-in rounded-[20px] border border-border bg-surface-solid p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-2xl font-bold text-danger">
          !
        </div>
        <div className="mt-5 text-lg font-bold text-text-primary">Bir şeyler ters gitti</div>
        <p className="mt-2 text-[13.5px] text-text-secondary">
          Beklenmedik bir hata oluştu. Tekrar deneyebilir veya dashboard&apos;a dönebilirsiniz.
        </p>
        <div className="mt-6 flex justify-center gap-2.5">
          <button
            onClick={reset}
            className="rounded-[9px] bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Tekrar dene
          </button>
          <a
            href="/dashboard"
            className="rounded-[9px] border border-border px-5 py-2.5 text-[13px] font-bold text-text-primary"
          >
            Dashboard&apos;a dön
          </a>
        </div>
      </div>
    </div>
  )
}
