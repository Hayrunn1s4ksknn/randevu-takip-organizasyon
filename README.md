# Kurumsal randevu takip ve organizasyon sistemi 

— Next.js + Supabase ile üretim seviyesinde çalışan bir SaaS uygulaması. `design/Randevu Paneli.dc.html` tasarım prototipinin gerçek, veritabanı destekli ve canlıya alınmış hâli.

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

Bkz. [`supabase/README.md`](./supabase/README.md) — migration dosyalarını CLI veya Dashboard SQL Editor ile uygulama adımları. Migration'lar `supabase/migrations/0001` → `0012` arası sırayla uygulanmalıdır.

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
  migrations/     → şema, RLS, trigger'lar (0001 → 0012)
  seed.sql        → geliştirme için örnek veri
docs/
  test-checklist.md        → manuel test kontrol listesi
  security-review.md       → RLS/güvenlik gözden geçirme raporu
  ai-code-review.md         → AI destekli kod inceleme raporu
  final-presentation.md     → final sunum notu
```
