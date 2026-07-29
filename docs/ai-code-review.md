# AI Destekli Kod İnceleme Raporu

Bu rapor, projenin genel mimarisi ve kod kalitesi üzerine yapılan bir gözden geçirmenin özetidir. Puanlama yerine somut gözlemler ve gerekçeli öneriler tercih edilmiştir.

## Genel Mimari

- **Next.js App Router + Server Actions:** Formların çoğu `useActionState` + server action deseniyle yazılmış (`src/features/*/actions.ts`). Bu, client'a gereksiz JS göndermeden form işleme sağlıyor ve tutarlı bir hata/pending state deseni oluşturuyor.
- **Servis katmanı ayrımı:** `src/services/*` yalnızca veri okuma (`'server-only'` işaretli), `src/features/*/actions.ts` yazma işlemlerini yapıyor. Bu ayrım okunabilirliği artırıyor; bir tabloya nasıl erişildiğini bulmak için tek bir yere bakmak yetiyor.
- **İstemci state'i minimal:** Zustand yalnızca UI-local state (drawer/modal açık mı, hangi sekme) için kullanılıyor; sunucu verisi için TanStack Query (drawer içi detaylar) veya doğrudan Server Component fetch tercih edilmiş. Bu, "her şeyi global store'a koyma" hatasından kaçınıyor.

## Güçlü Yönler

1. **RLS'in her tabloda tutarlı uygulanması** — `current_role()` SECURITY DEFINER fonksiyonu ile recursive policy sorunu baştan engellenmiş.
2. **Migration disiplini** — şema değişiklikleri numaralı, tekil sorumluluklu dosyalarda (`0001`...`0012`), geri dönüp eskiyi değiştirmek yerine yeni migration eklenmiş.
3. **Gerçek üretim hatalarının kök nedene inilerek çözülmesi** — örneğin Realtime'ın yalnızca prod'da bozulması (anon key'de görünmez boşluk) veya mobil hamburger menüsünün açılmaması (Tailwind v4'te `transform` yerine `translate` property'si) gibi sorunlar, geçici çözüm yerine kök nedene inilerek düzeltilmiş.
4. **Güvenlik varsayılanları** — CSP/HSTS/X-Frame-Options gibi header'lar, rate limiting ve 2FA gibi orta-üstü seviye önlemler bir "okul projesi"nde beklenenin ötesinde.

## İyileştirme Alanları

1. **RLS row-ownership eksik** (bkz. `docs/security-review.md` madde 2) — şu an herhangi bir `personel` rolündeki kullanıcı tüm randevu/görev kayıtlarını görebiliyor. Çok kullanıcılı/çok kurumlu bir büyümede bu bir öncelik olmalı.
2. **`src/types/database.ts` elle yazılmış** — Supabase CLI ile (`supabase gen types typescript --linked`) otomatik üretime geçilirse, şema ile tip tanımlarının senkron kalması garanti altına alınır; şu an bir migration eklenip tip dosyası güncellenmeyi unutulursa derleme zamanında hata vermez (yalnızca çalışma zamanında fark edilir).
3. **Otomatik test kapsamı ince** — Vitest/Playwright altyapısı kurulu ama bu proje boyunca çoğu doğrulama tek seferlik, elden yazılan Playwright script'leriyle yapılıp silindi. Bunların bir kısmının `tests/` altına kalıcı E2E testi olarak taşınması, regresyonları otomatik yakalar.
4. **`appointments-table.tsx` ve `dashboard.ts` büyümeye devam ediyor** — özellikle dashboard servis fonksiyonu tek bir `getDashboardData()` içinde çok fazla hesaplama yapıyor. Şu an okunabilir, ama yeni bir widget eklendikçe bunu daha küçük, test edilebilir fonksiyonlara (ör. `computeOverdueItems`, `computeHeatmap`) ayırmak faydalı olur.
5. **Hata izleme yok** — Sentry (veya benzeri) entegre değil; prod'da sessiz bir hata olduğunda fark etmenin tek yolu kullanıcı şikayeti veya Vercel loglarını manuel taramak.
6. **Resend sandbox kısıtı** — mail özelliği kodda tam çalışır durumda ama domain doğrulanmadığı için gerçek müşteri adreslerine gönderim üretimde başarısız olacak; bu bir kod sorunu değil, bir devreye alma (deployment) eksiği.

## Sonuç

Kod tabanı, bir "staj projesi" beklentisinin belirgin biçimde üzerinde: RLS derinliği, 2FA, Realtime, rate limiting, mail entegrasyonu, Excel/PDF export ve admin paneli gibi özellikler orijinal plana dahil değildi ve sağlam bir şekilde uygulanmış. Öncelikli teknik borç, row-ownership seviyesinde yetkilendirme ve otomatik test kapsamının artırılmasıdır.
