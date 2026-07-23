import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  let exchangeError: string | null = null
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) exchangeError = error.message
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-text-primary">Şifre sıfırla</h1>
      <p className="mb-5 text-[12.5px] text-text-secondary">Yeni şifreni belirle.</p>
      {exchangeError || !code ? (
        <p className="text-[12.5px] font-medium text-danger">
          Bu bağlantının süresi dolmuş veya geçersiz. Şifremi unuttum sayfasından tekrar dene.
        </p>
      ) : (
        <ResetPasswordForm />
      )}
    </div>
  )
}
