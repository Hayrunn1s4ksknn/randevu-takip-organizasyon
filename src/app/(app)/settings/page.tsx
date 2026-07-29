import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/services/profile'
import { DarkModeToggle } from '@/features/settings/dark-mode-toggle'
import { EditNameForm } from '@/features/settings/edit-name-form'
import { ChangePasswordForm } from '@/features/settings/change-password-form'
import { TwoFactorSection } from '@/features/settings/two-factor-section'

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserAndProfile()
  if (!user) redirect('/login')

  const fullName = profile?.full_name ?? user.email ?? 'Kullanıcı'
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex max-w-[640px] flex-col gap-4 animate-fade-in">
      <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">Profil</div>
        <div className="flex items-center gap-4">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <EditNameForm initialFullName={fullName} />
            <div className="mt-1.5 text-[12.5px] text-text-secondary">{user.email}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">Görünüm</div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[13px]">Karanlık Mod</span>
          <DarkModeToggle initialIsDark={profile?.dark_mode ?? false} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">Şifre Değiştir</div>
        <ChangePasswordForm />
      </section>

      <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-4 text-[14.5px] font-bold">İki Adımlı Doğrulama (2FA)</div>
        <TwoFactorSection />
      </section>

      <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
        <div className="mb-1 text-[14.5px] font-bold">Bildirimler</div>
        <p className="text-[13px] text-text-secondary">
          E-posta/SMS/Push bildirim tercihleri Faz 2&apos;de bu sayfaya eklenecek.
        </p>
      </section>

      {profile?.role === 'admin' && (
        <section className="rounded-2xl border border-border bg-surface-solid p-[22px]">
          <div className="mb-1 text-[14.5px] font-bold">Kullanıcı Yönetimi</div>
          <p className="mb-3 text-[13px] text-text-secondary">
            Yeni kullanıcı ekle, rol değiştir veya bir hesabı devre dışı bırak.
          </p>
          <Link
            href="/settings/users"
            className="inline-flex rounded-[9px] bg-primary px-4 py-2.5 text-[12.5px] font-bold text-white"
          >
            Kullanıcıları Yönet
          </Link>
        </section>
      )}
    </div>
  )
}
