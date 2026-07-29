import Link from 'next/link'
import { LoginForm } from '@/features/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>
}) {
  const { redirectTo, reset } = await searchParams

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-text-primary">Giriş yap</h1>
      <p className="mb-5 text-[12.5px] text-text-secondary">Technoscope Randevu hesabınla devam et.</p>
      {reset === '1' && (
        <p className="mb-4 rounded-[9px] bg-success-bg px-3 py-2 text-[12.5px] font-medium text-success">
          Şifren güncellendi, yeni şifrenle giriş yapabilirsin.
        </p>
      )}
      <LoginForm redirectTo={redirectTo ?? '/dashboard'} />
      <Link
        href="/privacy"
        className="mt-5 block text-center text-[11.5px] text-text-secondary hover:underline"
      >
        Gizlilik Politikası
      </Link>
    </div>
  )
}
