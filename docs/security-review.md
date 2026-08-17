# RLS / Güvenlik Gözden Geçirme Raporu

Bu doküman, veritabanı erişim kontrolü ve uygulama seviyesi güvenlik önlemlerinin bir özetidir. Amaç, "her şey açık/herkes her şeyi yapabiliyor" gibi sessiz bir varsayılanın olmadığını göstermek ve bilinen sınırları açıkça yazmaktır.

## 1. Kimlik Doğrulama

- Supabase Auth (e-posta + şifre), `@supabase/ssr` ile server/browser client ayrımı yapılarak kullanılıyor.
- Giriş ve şifre sıfırlama denemeleri `auth_attempts` tablosuna yazılıyor; belirli bir eşiğin üzerindeki başarısız denemeler `isRateLimited()` (`src/lib/rate-limit.ts`) ile reddediliyor.
- 2FA (TOTP), Supabase Auth MFA API'si üzerinden uygulanıyor. Kullanıcı bir faktör kaydettiğinde, middleware (`src/lib/supabase/proxy.ts`) oturumun AAL (Authenticator Assurance Level) seviyesini kontrol ediyor; AAL2 gerekip de sağlanmamışsa `/verify-2fa`'ya yönlendiriyor. Bu, "2FA'yı kurdum ama istemsem de bypass edebilirim" durumunu engelliyor.
- Middleware, `/api/*` yollarını HTML yönlendirmesinden istisna tutuyor (yalnızca 401/JSON döner) — aksi hâlde `fetch()` çağrıları sessizce HTML alıp JSON.parse ile patlardı.

## 2. Yetkilendirme (RLS)

Tüm tablolarda Row Level Security aktif (`supabase/migrations/0004_rls_policies.sql`, `0005_tasks.sql`). Genel desen:

| İşlem         | Kural                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------- |
| SELECT        | Kimliği doğrulanmış (authenticated) her kullanıcıya açık                                     |
| INSERT/UPDATE | `current_role() in ('admin','yonetici','personel')` — `misafir` rolü yazamaz                 |
| DELETE        | Randevular/görevler: `admin`/`yönetici`/`personel`. Kullanıcı hesabı silme: yalnızca `admin` |

`current_role()` SECURITY DEFINER bir Postgres fonksiyonu; `auth.uid()` üzerinden `profiles.role` değerini okuyor, böylece RLS politikaları her sorguda recursive bir `profiles` join'ine girmiyor.

`profiles` tablosunda ayrıca `prevent_role_escalation` trigger'ı var: bir kullanıcı kendi rolünü admin olmayan bir hesaptan yükseltemiyor; rol değişikliği yalnızca admin tarafından (Kullanıcı Yönetimi ekranı → Supabase Admin API) yapılabiliyor.

**Bilinen kapsam sınırı:** RLS şu an rol bazlı (role-based), kayıt bazlı (row-ownership) değil. Yani `personel` rolündeki bir kullanıcı, SELECT için _kendi oluşturduğu/sorumlu olduğu_ değil, **tüm** randevu/görev/kişi/kurum kayıtlarını görebiliyor. `assigned_to`/`created_by` alanları filtreleme ve raporlama için kullanılıyor ama RLS seviyesinde "yalnızca bana atananları gör" kısıtı **uygulanmadı** — bu bilinçli bir tasarım tercihi (küçük/orta ölçekli tek kurum içi kullanım senaryosunda personelin birbirinin randevularını görebilmesi işbirliği için gerekli görüldü), ancak çok kiracılı (multi-tenant) veya sıkı gizlilik gerektiren bir kullanım için yetersizdir ve eklenmesi gerekir.

## 3. Transport / Tarayıcı Güvenliği

`next.config.ts` içinde tüm route'lara uygulanan header'lar:

- `Content-Security-Policy` — script/style/img/connect kaynaklarını Supabase domain'i ve kendi origin'iyle sınırlıyor
- `X-Frame-Options: DENY` — clickjacking'e karşı
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — HTTPS zorunluluğu

## 4. Sırlar / Anahtar Yönetimi

- `SUPABASE_SERVICE_ROLE_KEY` yalnızca server-only dosyalarda (`'server-only'` import'u ile işaretli) kullanılıyor; client bundle'a hiçbir şekilde sızmıyor.
- `.env.local` git'e commit edilmiyor (`.gitignore`); Vercel'de Production/Preview ortamları için ayrı ayrı tanımlı.
- Geçmişte gerçek bir olay: `NEXT_PUBLIC_SUPABASE_ANON_KEY` değişkeninin başında görünmez bir boşluk vardı — HTTP header'larda trim edildiği için REST/Auth etkilenmedi, ama Realtime WebSocket URL'sinin query string'inde trim edilmediği için Realtime prod'da sessizce bozuktu. `vercel env rm` + `printf '%s'` ile (trailing newline olmadan) yeniden eklenerek düzeltildi. Ders: ortam değişkenlerini CLI/panelden girerken görünmez karakterlere karşı dikkatli olmak gerekiyor.

## 5. Dosya Yükleme

- Randevu dosyaları Supabase Storage'a yükleniyor, meta veri `appointment_files` tablosunda tutuluyor.
- İndirme/silme uçları oturum kontrolü yapıyor; dosya erişimi doğrudan public bucket URL'i değil, API route üzerinden yönlendirilerek yapılıyor.

## 6. Bilinen Eksikler (özet)

- Row-ownership seviyesinde RLS yok (bkz. madde 2).
- Dosya yükleme için MIME/boyut whitelisting sınırlı düzeyde; kötü niyetli dosya türü taraması yok.
- Dedike bir "RLS'yi ihlal etmeye çalışan" saldırı test seti yok, ama `tests/e2e/permissions.spec.ts` en azından rol bazlı yetki farklarını (misafir vs. personel/admin silme yetkisi) her CI çalıştırmasında otomatik doğruluyor. Bu test paketi kurulurken zaten gerçek bir yetki hatası yakaladı: görevler tablosunda "Sil" butonu her role gösteriliyordu ama RLS policy'si yalnızca `admin`'e izin veriyordu (personel/yönetici tıklayınca hata almadan sessizce hiçbir şey silinmiyordu) — `supabase/migrations/0018_tasks_delete_staff.sql` ile düzeltildi. Yine de daha geniş, RLS'yi kasıtlı ihlal etmeye çalışan bir test seti (ör. `misafir` rolüyle doğrudan API'ye admin-only bir yazma isteği atıp 403/RLS reddini doğrulamak) yok.
- Hata izleme/alerting (Sentry vb.) olmadığı için bir güvenlik olayının fark edilmesi loglara manuel bakmayı gerektiriyor.
