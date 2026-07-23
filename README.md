# Randevu Takip ve Organizasyon Sistemi

Kurumsal Randevu Takip ve Organizasyon Sistemi — Next.js + Supabase ile üretim seviyesinde bir SaaS uygulaması. `design/Randevu Paneli.dc.html` tasarım prototipinin gerçek, veritabanı destekli bir uygulamaya dönüştürülmüş hali.

## Teknolojiler

- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS v4
- Supabase (Auth + Postgres + RLS)
- TanStack Query, React Hook Form + Zod, Zustand
- Vitest + Testing Library (unit), Playwright (E2E)
- GitHub Actions (lint + typecheck + test + build + e2e)

## Kurulum

```bash
npm install
cp .env.local.example .env.local   # değerleri Supabase Dashboard → Settings → API'den al
npm run dev
```

`http://localhost:3000` adresi otomatik olarak `/dashboard` veya `/login`'e yönlendirir.

### Supabase şemasını uygulama

Bkz. [`supabase/README.md`](./supabase/README.md) — migration dosyalarını CLI veya Dashboard SQL Editor ile uygulama adımları.

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

## Faz Durumu

**Faz 1 (bu sürüm):** Auth (email/şifre, remember me, forgot/reset), RLS ile korunan Supabase şeması (profiles/organizations/contacts/appointments/tasks/activities + ilişkili tablolar), Dashboard ve Randevular modülleri gerçek veriyle çalışıyor; dark mode tercihi `profiles.dark_mode`'a kaydediliyor.

**Faz 2+ (planlanan):** Kişiler/Kurumlar/Takvim/Raporlar tam CRUD arayüzleri, Supabase Storage ile dosya yükleme, mail entegrasyonu, Supabase Realtime bildirimleri, Excel/PDF export, 2FA, AI özellikleri.

## Dizin Yapısı

```
src/
  app/            → route'lar ((auth) ve (app) route grupları, proxy.ts session yönetimi)
  components/     → paylaşılan UI bileşenleri
  features/       → modül bazlı client bileşenler + server action'lar
  services/       → Supabase'e giden server-only veri erişim fonksiyonları
  lib/            → supabase client factory'leri, ortak yardımcılar
  store/          → zustand (yalnızca UI-local state)
  types/          → Supabase Database tipi
supabase/
  migrations/     → şema, RLS, trigger'lar
  seed.sql        → geliştirme için örnek veri
```
