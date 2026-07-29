import { VerifyTwoFactorForm } from '@/features/auth/verify-2fa-form'

export default async function VerifyTwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-text-primary">İki adımlı doğrulama</h1>
      <p className="mb-5 text-[12.5px] text-text-secondary">Authenticator uygulamandaki 6 haneli kodu gir.</p>
      <VerifyTwoFactorForm redirectTo={redirectTo ?? '/dashboard'} />
    </div>
  )
}
