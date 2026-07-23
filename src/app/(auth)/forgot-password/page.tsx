import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-text-primary">Şifremi unuttum</h1>
      <p className="mb-5 text-[12.5px] text-text-secondary">
        E-posta adresine bir sıfırlama bağlantısı gönderelim.
      </p>
      {sent === '1' && (
        <p className="mb-4 rounded-[9px] bg-accent-bg px-3 py-2 text-[12.5px] font-medium text-accent">
          E-posta adresine gönderildiyse, gelen kutunu (ve spam klasörünü) kontrol et.
        </p>
      )}
      <ForgotPasswordForm />
    </div>
  )
}
