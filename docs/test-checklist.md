# Manuel Test Kontrol Listesi

Bu proje boyunca her özellik, geliştirme sonrası gerçek tarayıcıda test edilmiştir. Süreç ilk aşamada tek seferlik Playwright betikleriyle yürütüldü; daha sonra bunların büyük kısmı `tests/e2e/` altında **kalıcı, tekrar tekrar çalışan** Playwright spec'lerine dönüştürüldü ve `tests/unit/` altına saat dilimi/telefon normalizasyonu gibi kritik mantık için Vitest birim testleri eklendi. Bu otomatik paket, izole bir staging Supabase projesine karşı hem yerelde (`npm test`, `npm run test:e2e`) hem her push/PR'da GitHub Actions CI'da otomatik çalışır (bkz. ana `README.md` → "Test / Staging Ortamı").

Aşağıdaki liste hâlâ geçerli — ama artık bir kısmı **otomatik** (✅ işaretli, karşılık gelen spec dosyasıyla), bir kısmı hâlâ **yalnızca manuel** (2FA kurulumu, şifre sıfırlama e-postası, realtime çoklu-oturum senaryosu gibi — e-posta kutusu erişimi veya iki eşzamanlı tarayıcı gerektirdiği için otomatikleştirilmedi).

Kullanım: Yeni bir özellik eklerken veya bir regresyon şüphesinde, otomatik olmayan maddeleri bu listeden elle çalıştırın; otomatik olanlar zaten her CI çalıştırmasında doğrulanıyor.

## Auth

- [x] Doğru e-posta/şifre ile giriş yapılabiliyor — ✅ otomatik (her spec'in `login()` yardımcı fonksiyonu, `tests/e2e/helpers.ts`)
- [x] Yanlış şifre ile giriş reddediliyor — ✅ otomatik (`login.spec.ts`) — üst üste denemelerin rate limit'e takılması manuel kalıyor
- [ ] "Şifremi unuttum" akışı mail gönderiyor, link ile yeni şifre belirlenebiliyor — manuel (gerçek e-posta kutusu gerektirir)
- [ ] Ayarlar → Şifre Değiştir mevcut şifre + yeni şifre ile çalışıyor, yanlış mevcut şifrede hata veriyor — manuel
- [ ] 2FA kurulumu (QR/secret) yapılabiliyor, doğru kod ile giriş tamamlanıyor, yanlış kod reddediliyor — manuel
- [ ] 2FA açıkken çıkış yapıp tekrar giriş yapıldığında `/verify-2fa`'ya yönlendiriliyor — manuel
- [x] Oturumsuz kullanıcı `/dashboard` vb. korumalı sayfalara girmeye çalışınca `/login`'e yönlendiriliyor — ✅ otomatik (`login.spec.ts`)
- [ ] `/api/*` uçlarına oturumsuz istek HTML yönlendirmesi değil JSON 401 dönüyor — manuel

## Randevular

- [x] Yeni randevu formu: başlık, kurum, tarih/saat, konum, öncelik, toplantı tipi/süresi, sorumlu kullanıcı, katılımcı (kişi) çoklu seçim ile oluşturulabiliyor — ✅ otomatik (`appointments.spec.ts`)
- [x] Randevu listesinde arama, durum/kurum/kişi/sorumlu filtreleri ve tarih aralığı doğru sonuç döndürüyor — ✅ otomatik, kısmen (`appointment-filters.spec.ts`: arama/durum/kurum; kişi/sorumlu/tarih aralığı manuel)
- [ ] Sayfalama (5'li) doğru çalışıyor, filtre ile birlikte sayfa linkleri korunuyor — manuel
- [x] Randevu satırına tıklayınca detay çekmecesi (drawer) açılıyor: Notlar, Dosyalar, Yorumlar, Katılımcılar sekmeleri — ✅ otomatik (`appointment-drawer.spec.ts`); Timeline, Hatırlatıcılar, Mail, Durum Geçmişi sekmeleri manuel
- [x] Çekmeceden toplantı tipi/süresi ve sorumlu kullanıcı güncellenebiliyor (drawer kapat-aç sonrası kalıcılık dahil) — ✅ otomatik (`appointment-drawer.spec.ts`)
- [x] Katılımcılar sekmesinden kişi eklenip çıkarılabiliyor — ✅ otomatik (`appointment-drawer.spec.ts`)
- [x] Dosya yükleme/silme çalışıyor — ✅ otomatik (`appointment-drawer.spec.ts`); indirme linkinin gerçekten dosyayı indirdiği manuel
- [x] Not/yorum eklenebiliyor — ✅ otomatik (`appointment-drawer.spec.ts`)
- [x] Durum toplu güncelleme (seç → Tamamlandı/Ertele/İptal) çalışıyor — ✅ otomatik (`appointments.spec.ts`, `appointment-filters.spec.ts`) — durum geçmişine doğru yazıldığının UI'dan doğrulanması manuel
- [ ] Randevu oluşturulunca kurum e-postasına onay maili gidiyor — manuel (gerçek Resend gönderimi; staging'de `RESEND_API_KEY` tanımlı değil, bilinçli olarak)
- [ ] Tarihi geçmiş, tamamlanmamış randevular listede "Gecikti" rozeti ve kırmızı vurgu ile görünüyor — manuel
- [x] CSV/Excel/PDF export, gerçekten bir dosya indiriyor — ✅ otomatik (`exports.spec.ts`) — indirilen dosyanın içeriğinin filtreyle birebir uyuştuğu manuel

## Görevler

- [x] Yeni görev: başlık, tarih, öncelik ile oluşturulabiliyor — ✅ otomatik (`tasks.spec.ts`)
- [ ] Görev düzenleme (açıklama, sorumlu, randevuya bağlama) aynı alanları güncelleyebiliyor — manuel
- [x] Görev tamamlandı işaretlenebiliyor — ✅ otomatik (`tasks.spec.ts`) — geri alma (tekrar açma) manuel
- [x] Görev silinebiliyor (admin/yönetici/personel) — ✅ otomatik (`tasks.spec.ts`) — bkz. aşağıdaki not
- [ ] Son tarihi geçmiş, tamamlanmamış görevler "Gecikti" rozeti ile vurgulanıyor — manuel
- [ ] Durum filtre sekmeleri (tümü/açık/tamamlanan) doğru filtreliyor — manuel

> **Not (2026-08-17):** Otomatik testler yazılırken gerçek bir yetki hatası bulundu — "Sil" butonu her role gösteriliyordu ama RLS policy silmeyi yalnızca `admin`'e izin veriyordu; personel/yönetici hiçbir hata görmeden görevi "siliyor" ama işlem sessizce hiçbir şey yapmıyordu. `supabase/migrations/0018_tasks_delete_staff.sql` ile randevularla aynı yetki setine (`admin`/`yönetici`/`personel`) çekildi; hem staging hem production'a uygulandı.

## Kişiler / Kurumlar

- [x] Kurum/kişi oluşturma, düzenleme çalışıyor — ✅ otomatik (`contacts.spec.ts`, `organizations.spec.ts`) — arama kutusu manuel
- [x] Soft delete sonrası kayıt aktif listelerde görünmüyor — ✅ otomatik (yukarıdaki iki spec, silme akışının parçası olarak)
- [ ] Kurum silindiğinde bağlı randevu/kişi kayıtları bozulmuyor (referans korunuyor) — manuel

## Takvim / Dashboard / Raporlar

- [x] Takvim/Dashboard/Raporlar sayfaları hatasız (console error'sız) yükleniyor — ✅ otomatik (`pages-smoke.spec.ts`)
- [ ] Takvim'de gün/hafta/ay/ajanda görünümleri arası geçiş ve randevuların doğru günde gösterilmesi — manuel
- [ ] Dashboard istatistikleri (bugün/hafta/ay, tamamlanma oranı) gerçek veriyle tutarlı — manuel
- [ ] "Gecikmiş Kayıtlar" paneli yalnızca gecikmiş randevu/görev varken görünüyor ve doğru kayıtları listeliyor — manuel
- [x] Raporlar sayfasından PDF export gerçekten indiriyor — ✅ otomatik (`exports.spec.ts`) — sayfadaki verinin doğruluğu manuel

## Admin / Kullanıcı Yönetimi

- [ ] Yalnızca `admin` rolü "Kullanıcıları Yönet" sayfasını görebiliyor (`misafir`/`personel` erişemiyor) — manuel
- [x] Yeni kullanıcı oluşturma, rol değiştirme, hesap devre dışı bırakma/etkinleştirme, silme — ✅ otomatik (`user-management.spec.ts`)
- [x] Randevu silme butonu yalnızca admin/yönetici/personel'e görünüyor, misafir'e görünmüyor — ✅ otomatik (`permissions.spec.ts`)

## Realtime / Bildirimler

- [ ] Bir tarayıcıda randevu/görev değişikliği yapıldığında diğer açık oturumda anlık bildirim/toast görünüyor — manuel (iki eşzamanlı oturum gerektirir, E2E'de kırılgan olacağı için bilinçli olarak otomatikleştirilmedi)

## Mobil / Erişilebilirlik

- [x] 375px genişlikte hamburger menü açılıp gerçekten ekrana kayıp geliyor (Tailwind v4 regresyon testi) — ✅ otomatik (`mobile-menu.spec.ts`)
- [ ] Klavye ile (Tab/Enter/Space) randevu satırları ve tıklanabilir kartlar aktive edilebiliyor — manuel
- [ ] Karanlık mod açma/kapama tüm sayfalarda tutarlı — manuel

## Genel

- [x] `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e` hatasız geçiyor — ✅ her push/PR'da GitHub Actions CI'da otomatik (`.github/workflows/ci.yml`); `main` branch protection ile PR'larda zorunlu kılınıyor
- [ ] Production deploy sonrası (`vercel.app` linki) yukarıdaki manuel akışlardan kritik olanlar tekrar gözden geçiriliyor
