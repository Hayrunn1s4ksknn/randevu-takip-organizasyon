# Kurumsal randevu takip ve organizasyon sistemi

— Next.js + Supabase ile üretim seviyesinde çalışan bir SaaS uygulaması.

## Canlı Demo

- **URL:** https://randevu-takip-organizasyon.vercel.app

## Teknolojiler

- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS v4
- Supabase (Auth + MFA/TOTP + Postgres + RLS + Storage + Realtime)
- TanStack Query, Zustand, Zod, `useActionState` tabanlı server action formları
- `write-excel-file` (Excel export), `jsPDF` + `jspdf-autotable` (PDF export)
- Resend (transactional e-posta: randevu onayı + günlük hatırlatma cron'u)
- `lucide-react` (ikonlar)
- Vitest + Testing Library (unit), Playwright (E2E/manuel doğrulama)
- Vercel (hosting + cron jobs), GitHub Actions (lint + typecheck + test + build)

## Kurulum

```bash
npm install
cp .env.local.example .env.local   # değerleri Supabase Dashboard → Settings → API'den al
npm run dev
```

`http://localhost:3000` adresi otomatik olarak `/dashboard` veya `/login`'e yönlendirir.

### Supabase şemasını uygulama

Bkz. [`supabase/README.md`](./supabase/README.md) — migration dosyalarını CLI veya Dashboard SQL Editor ile uygulama adımları. Migration'lar `supabase/migrations/0001` → `0018` arası sırayla uygulanmalıdır.

### Test / Staging Ortamı

Testler (özellikle Playwright E2E) production Supabase projesine karşı **çalıştırılmamalı**. Bunun için ayrı, boş bir Supabase projesi ("randevu-takip-staging") var; production ile aynı şemayı taşır (aynı migration'lar uygulanmıştır) ama verisi tamamen ayrıdır.

Yerel olarak test çalıştırmak için proje kökünde bir `.env.test.local` dosyası oluşturun (git'e girmez):

```
NEXT_PUBLIC_SUPABASE_URL=<staging proje URL'i>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon/publishable anahtarı>
SUPABASE_SERVICE_ROLE_KEY=<staging service role/secret anahtarı>
CRON_SECRET=<herhangi bir değer, dışarıdan çağrılmıyor>
```

`npm run test:e2e` bu dosyayı otomatik okuyup test sunucusuna aktarır (`playwright.config.ts`) — dosya yoksa test çalışmaz, böylece yanlışlıkla production'a karşı test çalıştırma riski engellenmiş olur.

E2E testleri ilk çalıştırıldığında (`tests/e2e/global-setup.ts`) staging'de üç kalıcı test kullanıcısı oluşturur (admin/personel/misafir rollerinde — `tests/e2e/fixtures.ts`); bu hesaplar tekrar tekrar kullanılır, her çalıştırmada silinip yeniden oluşturulmaz. Kapsam:

- `appointments.spec.ts` — randevu oluşturma, kuruma bağlama, "Ertele" akışı, silme
- `contacts.spec.ts` / `organizations.spec.ts` — kişi/kurum oluşturma, düzenleme, silme
- `tasks.spec.ts` — görev oluşturma, tamamlama, silme
- `user-management.spec.ts` — admin panelinden kullanıcı oluşturma, rol değiştirme, devre dışı bırakma/etkinleştirme, silme
- `permissions.spec.ts` — admin/personel randevu silebiliyor, misafir silemiyor (rol yetkisi regresyonu)
- `exports.spec.ts` — CSV/Excel/PDF export butonlarının gerçekten dosya indirdiğini doğrular
- `search.spec.ts` — genel arama (⌘K) paletinin sonuç bulup ilgili kaydı açtığını doğrular
- `pages-smoke.spec.ts` — dashboard/takvim/raporlar sayfalarının hatasız (console error'sız) yüklendiğini doğrular
- `mobile-menu.spec.ts` — mobil hamburger menünün gerçekten ekrana kayıp geldiğini doğrular (bir Tailwind v4 güncellemesinin sessizce kırdığı gerçek bir bug'ın regresyon testi)
- `login.spec.ts` — giriş formu doğrulaması

Bu testler yazılırken gerçek bir üretim hatası da bulundu ve düzeltildi: görevler (tasks) sayfasında "Sil" butonu her role gösteriliyordu, ama RLS policy silmeyi yalnızca admin'e izin veriyordu — personel/yönetici hiçbir hata görmeden görevi "siliyor", ama işlem sessizce hiçbir şey yapmıyordu (bkz. `supabase/migrations/0018_tasks_delete_staff.sql`, randevularla aynı yetki setine çekildi: admin/yönetici/personel).

Testler tek worker ile (seri) çalışır — küçük bir suite tek bir yerel `next start` sürecini paylaştığı için paralel çalıştırmak gerçek bir kazanç sağlamadan sunucu gecikmesinden kaynaklı kararsızlık (flaky test) yaratıyor.

Vitest birim testleri (`tests/unit/`) ise `src/lib/tr-time.ts` (Türkiye saat dilimi hesapları) ve `src/lib/phone.ts` (telefon normalizasyonu) gibi, üretimde gerçekten yaşanmış hataların regresyon koruması içindir.

#### CI (GitHub Actions)

`.github/workflows/ci.yml` her `main`'e push/PR'da lint, typecheck, unit test, build ve E2E testlerini otomatik çalıştırır. Bunun için repo'ya (Settings → Secrets and variables → Actions → **Repository secrets**) yukarıdaki `.env.test.local` ile **aynı staging değerlerini** şu isimlerle eklemek gerekir:

| Secret adı                          | Değer                                               |
| ----------------------------------- | --------------------------------------------------- |
| `STAGING_SUPABASE_URL`              | `.env.test.local` → `NEXT_PUBLIC_SUPABASE_URL`      |
| `STAGING_SUPABASE_ANON_KEY`         | `.env.test.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | `.env.test.local` → `SUPABASE_SERVICE_ROLE_KEY`     |
| `STAGING_CRON_SECRET`               | `.env.test.local` → `CRON_SECRET`                   |

Bu secret'lar kesinlikle production değerleri **olmamalı** — GitHub Actions'ın production'a erişebileceği başka bir yol yok, bu yüzden isimlendirme bilinçli olarak "staging" içeriyor.

**Önemli:** Şemada bir değişiklik (yeni migration) yapıldığında, hem production'a hem staging projesine ayrı ayrı uygulanmalıdır — otomatik senkronizasyon yoktur:

```bash
npx supabase db push --linked                                          # production
npx supabase db push --project-ref <staging-ref> --password <db-şifresi>  # staging
```

### Ortam Değişkenleri

| Değişken                        | Açıklama                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase proje URL'i                                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) anahtarı                                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yalnızca server-side kullanılan servis rolü anahtarı (asla client'a sızdırılmaz)         |
| `RESEND_API_KEY`                | Resend API anahtarı (mail gönderimi için)                                                |
| `EMAIL_FROM`                    | Gönderen e-posta adresi (Resend'de doğrulanmış domain gerektirir)                        |
| `CRON_SECRET`                   | `/api/cron/reminders` uç noktasını Vercel Cron dışından çağrılara kapatan paylaşımlı sır |

## Komutlar

| Komut               | Açıklama                   |
| ------------------- | -------------------------- |
| `npm run dev`       | Geliştirme sunucusu        |
| `npm run build`     | Prodüksiyon build          |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript tip kontrolü    |
| `npm test`          | Vitest unit testleri       |
| `npm run test:e2e`  | Playwright E2E testleri    |
| `npm run format`    | Prettier ile biçimlendirme |

## Özellikler / Faz Durumu

**Tamamlanan:**

- Auth: e-posta/şifre girişi, "beni hatırla", şifremi unuttum/sıfırlama, şifre değiştirme, giriş denemelerinde rate limiting
- 2FA (TOTP), middleware seviyesinde AAL kontrolü ile zorunlu kılınabiliyor
- RLS ile korunan Supabase şeması: profiller/roller (admin, yönetici, personel, misafir), kurumlar, kişiler, randevular, görevler, dosyalar, notlar/yorumlar, durum geçmişi, e-posta kayıtları
- Randevular: CRUD, kurum + kişi (katılımcı) + sorumlu kullanıcı ataması, toplantı tipi/süresi, dosya yükleme (Supabase Storage), not/yorum, durum geçmişi (timeline), manuel + otomatik hatırlatma maili (Resend + Vercel Cron)
- Görevler: CRUD, açıklama, randevuya bağlama (opsiyonel), sorumlu kullanıcı ataması, geciken görev vurgusu
- Kişiler / Kurumlar: CRUD, arama, soft delete
- Takvim: aylık görünüm
- Dashboard: özet istatistikler, aylık grafik, durum dağılımı, kurum dağılımı, saatlik yoğunluk, son aktiviteler, **geciken randevu/görev uyarı paneli**
- Randevu filtreleme: durum, kurum, kişi, sorumlu kullanıcı, tarih aralığı; genel arama (⌘K)
- Raporlar: en aktif kurumlar/personel, yıllık performans, toplantı süresi istatistikleri
- CSV / Excel / PDF export
- Supabase Realtime ile canlı bildirimler
- Admin kullanıcı yönetimi: kullanıcı oluşturma, rol değiştirme, hesap devre dışı bırakma
- KVKK aydınlatma metni sayfası (şablon — kurum bilgileriyle güncellenmeli, bkz. aşağıdaki eksikler)
- Erişilebilirlik (klavye navigasyonu), güvenlik başlıkları (CSP/HSTS vb.), mobil responsive tasarım

## Veritabanı Yapısı (özet)

| Tablo                             | Amaç                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| `profiles`                        | Kullanıcı profili + rol (`admin`/`yonetici`/`personel`/`misafir`)       |
| `organizations`                   | Kurumlar (soft delete: `deleted_at`)                                    |
| `contacts`                        | Kişiler, bir kuruma bağlanabilir (`company_id`)                         |
| `appointments`                    | Randevular; `org_id`, `assigned_to`, `meeting_type`, `duration_minutes` |
| `appointment_participants`        | Randevu ↔ kişi çoka-çok ilişkisi (katılımcılar)                         |
| `appointment_notes` / `_comments` | Randevuya bağlı not ve yorumlar                                         |
| `appointment_status_history`      | Durum değişikliği geçmişi (trigger ile otomatik yazılır)                |
| `appointment_files`               | Supabase Storage'a yüklenen dosyaların meta verisi                      |
| `appointment_emails`              | Gönderilen onay/hatırlatma/manuel maillerin kaydı                       |
| `tasks`                           | Görevler; opsiyonel `appointment_id` ve `assigned_to`                   |
| `activities`                      | Dashboard aktivite akışı (sistem tarafından yazılır)                    |
| `auth_attempts`                   | Giriş/şifre sıfırlama rate limiting kayıtları                           |

Tüm tablolarda RLS aktif; okuma genelde tüm kimliği doğrulanmış kullanıcılara açık, yazma `admin`/`yonetici`/`personel` rolleriyle sınırlı, silme yalnızca `admin`.

## Dizin Yapısı

```
src/
  app/            → route'lar ((auth) ve (app) route grupları, proxy.ts session/2FA yönetimi)
  components/     → paylaşılan UI bileşenleri
  features/       → modül bazlı client bileşenler + server action'lar
  services/       → Supabase'e giden server-only veri erişim fonksiyonları
  lib/            → supabase client factory'leri, ortak yardımcılar (pdf, email, rate-limit, a11y)
  store/          → zustand (yalnızca UI-local state)
  types/          → Supabase Database tipi
supabase/
  migrations/     → şema, RLS, trigger'lar (0001 → 0018)
  seed.sql        → geliştirme için örnek veri
docs/
  test-checklist.md        → manuel test kontrol listesi
  security-review.md       → RLS/güvenlik gözden geçirme raporu
  ai-code-review.md         → AI destekli kod inceleme raporu
  final-presentation.md     → final sunum notu
```
