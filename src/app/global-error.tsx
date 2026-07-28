'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="tr">
      <body className="h-full bg-bg antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-[440px] rounded-[20px] border border-border bg-surface-solid p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-2xl font-bold text-danger">
              !
            </div>
            <div className="mt-5 text-lg font-bold text-text-primary">Uygulama başlatılamadı</div>
            <p className="mt-2 text-[13.5px] text-text-secondary">
              Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyin.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-[9px] bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
