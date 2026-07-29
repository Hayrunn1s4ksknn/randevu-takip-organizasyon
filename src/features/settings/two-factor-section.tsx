'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUiStore } from '@/store/ui'

type Factor = {
  id: string
  factor_type: string
  status: 'verified' | 'unverified'
  friendly_name?: string
}

export function TwoFactorSection() {
  const supabase = createClient()
  const showToast = useUiStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [factor, setFactor] = useState<Factor | null>(null)
  const [enrolling, setEnrolling] = useState<{ factorId: string; qrCode: string; secret: string } | null>(
    null
  )
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refreshFactors() {
    const { data } = await supabase.auth.mfa.listFactors()
    const verified = data?.totp.find((f) => f.status === 'verified') ?? null
    setFactor(verified)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    refreshFactors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStartEnroll() {
    setError(null)
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (enrollError || !data) {
      setError('Kurulum başlatılamadı.')
      return
    }
    setEnrolling({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
  }

  async function handleCancelEnroll() {
    if (enrolling) await supabase.auth.mfa.unenroll({ factorId: enrolling.factorId })
    setEnrolling(null)
    setCode('')
    setError(null)
  }

  async function handleVerify() {
    if (!enrolling) return
    setPending(true)
    setError(null)
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrolling.factorId,
      code: code.trim(),
    })
    setPending(false)
    if (verifyError) {
      setError('Kod hatalı ya da süresi dolmuş.')
      return
    }
    setEnrolling(null)
    setCode('')
    showToast('İki adımlı doğrulama etkinleştirildi')
    refreshFactors()
  }

  async function handleDisable() {
    if (!factor) return
    if (!confirm('İki adımlı doğrulamayı devre dışı bırakmak istediğine emin misin?')) return
    setPending(true)
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    setPending(false)
    if (unenrollError) {
      setError('Devre dışı bırakılamadı.')
      return
    }
    showToast('İki adımlı doğrulama devre dışı bırakıldı')
    refreshFactors()
  }

  if (loading) return <p className="text-[13px] text-text-secondary">Yükleniyor...</p>

  if (factor) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <span className="text-[13px] font-medium">İki adımlı doğrulama etkin</span>
        </div>
        <button
          onClick={handleDisable}
          disabled={pending}
          className="rounded-[9px] border border-danger px-3.5 py-2 text-[12.5px] font-bold text-danger disabled:opacity-50"
        >
          Devre Dışı Bırak
        </button>
      </div>
    )
  }

  if (enrolling) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-text-secondary">
          Authenticator uygulamanla (Google Authenticator, Authy vb.) QR kodu tara, ya da kodu elle gir.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={enrolling.qrCode} alt="2FA QR kodu" className="h-[160px] w-[160px] self-center" />
        <div className="self-center rounded-[9px] bg-bg px-3 py-2 font-mono text-[12px] tracking-wide">
          {enrolling.secret}
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6 haneli kod"
          inputMode="numeric"
          maxLength={6}
          className="w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-center text-[15px] tracking-[0.3em] text-text-primary outline-none focus:border-accent"
        />
        {error && <p className="text-[12.5px] font-medium text-danger">{error}</p>}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancelEnroll}
            className="rounded-[9px] border border-border px-4 py-2.5 text-[13px] font-semibold"
          >
            Vazgeç
          </button>
          <button
            onClick={handleVerify}
            disabled={pending || code.trim().length !== 6}
            className="rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
          >
            Doğrula
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[13px] text-text-secondary">Hesabına ekstra bir güvenlik katmanı ekle.</p>
      {error && <p className="text-[12.5px] font-medium text-danger">{error}</p>}
      <button
        onClick={handleStartEnroll}
        className="shrink-0 rounded-[9px] bg-primary px-4 py-2.5 text-[12.5px] font-bold text-white"
      >
        2FA&apos;yı Etkinleştir
      </button>
    </div>
  )
}
