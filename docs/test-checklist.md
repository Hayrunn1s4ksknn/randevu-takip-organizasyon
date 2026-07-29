# Manuel Test Kontrol Listesi

Bu proje boyunca her özellik, geliştirme sonrası gerçek tarayıcıda (Playwright ile sürülen, tek seferlik betikler üzerinden) test edilmiş; test verisi (kullanıcı, randevu, kurum, kişi, görev) her seferinde temizlenmiştir. Aşağıdaki liste, bu doğrulamaların tekrarlanabilir bir kontrol listesi hâline getirilmiş özetidir.

Kullanım: Yeni bir özellik eklerken veya bir regresyon şüphesinde bu listeyi baştan sona (veya ilgili bölümü) elle çalıştırın.

## Auth

- [ ] Doğru e-posta/şifre ile giriş yapılabiliyor
- [ ] Yanlış şifre ile giriş reddediliyor, üst üste denemeler rate limit'e takılıyor
- [ ] "Şifremi unuttum" akışı mail gönderiyor, link ile yeni şifre belirlenebiliyor
- [ ] Ayarlar → Şifre Değiştir mevcut şifre + yeni şifre ile çalışıyor, yanlış mevcut şifrede hata veriyor
- [ ] 2FA kurulumu (QR/secret) yapılabiliyor, doğru kod ile giriş tamamlanıyor, yanlış kod reddediliyor
- [ ] 2FA açıkken çıkış yapıp tekrar giriş yapıldığında `/verify-2fa`'ya yönlendiriliyor
- [ ] Oturumsuz kullanıcı `/dashboard` vb. korumalı sayfalara girmeye çalışınca `/login`'e yönlendiriliyor
- [ ] `/api/*` uçlarına oturumsuz istek HTML yönlendirmesi değil JSON 401 dönüyor

## Randevular

- [ ] Yeni randevu formu: başlık, kurum, tarih/saat, konum, öncelik, toplantı tipi/süresi, sorumlu kullanıcı, katılımcı (kişi) çoklu seçim ile oluşturulabiliyor
- [ ] Randevu listesinde arama, durum/kurum/kişi/sorumlu filtreleri ve tarih aralığı doğru sonuç döndürüyor
- [ ] Sayfalama (5'li) doğru çalışıyor, filtre ile birlikte sayfa linkleri korunuyor
- [ ] Randevu satırına tıklayınca detay çekmecesi (drawer) açılıyor: Notlar, Dosyalar, Yorumlar, Katılımcılar, Timeline, Hatırlatıcılar, Mail, Durum Geçmişi sekmeleri çalışıyor
- [ ] Çekmeceden toplantı tipi/süresi ve sorumlu kullanıcı güncellenebiliyor
- [ ] Katılımcılar sekmesinden kişi eklenip çıkarılabiliyor
- [ ] Dosya yükleme/indirme/silme çalışıyor
- [ ] Not/yorum eklenebiliyor
- [ ] Durum toplu güncelleme (seç → Tamamlandı/İptal) çalışıyor ve durum geçmişine yazıyor
- [ ] Randevu oluşturulunca kurum e-postasına onay maili gidiyor (Resend sandbox dışı adreslerde gönderim başarısız olabilir — beklenen davranış)
- [ ] Tarihi geçmiş, tamamlanmamış randevular listede "Gecikti" rozeti ve kırmızı vurgu ile görünüyor
- [ ] CSV/Excel export, ekrandaki filtreye uyan veriyi indiriyor

## Görevler

- [ ] Yeni görev: başlık, açıklama, son tarih, öncelik, sorumlu kullanıcı, randevuya bağlama (opsiyonel) ile oluşturulabiliyor
- [ ] Görev düzenleme aynı alanları güncelleyebiliyor
- [ ] Görev tamamlandı işaretlenip geri alınabiliyor
- [ ] Görev silinebiliyor
- [ ] Son tarihi geçmiş, tamamlanmamış görevler "Gecikti" rozeti ile vurgulanıyor
- [ ] Durum filtre sekmeleri (tümü/açık/tamamlanan) doğru filtreliyor

## Kişiler / Kurumlar

- [ ] Kurum/kişi oluşturma, düzenleme, arama çalışıyor
- [ ] Soft delete sonrası kayıt aktif listelerde görünmüyor
- [ ] Kurum silindiğinde bağlı randevu/kişi kayıtları bozulmuyor (referans korunuyor)

## Takvim / Dashboard / Raporlar

- [ ] Takvim aylık görünümde randevuları doğru günde gösteriyor
- [ ] Dashboard istatistikleri (bugün/hafta/ay, tamamlanma oranı) gerçek veriyle tutarlı
- [ ] "Gecikmiş Kayıtlar" paneli yalnızca gecikmiş randevu/görev varken görünüyor ve doğru kayıtları listeliyor
- [ ] Raporlar sayfası (en aktif kurum/personel, yıllık performans, toplantı süresi) veriyle güncelleniyor

## Admin / Kullanıcı Yönetimi

- [ ] Yalnızca `admin` rolü "Kullanıcıları Yönet" sayfasını görebiliyor
- [ ] Yeni kullanıcı oluşturma, rol değiştirme, hesap devre dışı bırakma çalışıyor
- [ ] `misafir`/`personel` rolündeki kullanıcı admin uçlarına erişemiyor (403/redirect)

## Realtime / Bildirimler

- [ ] Bir tarayıcıda randevu/görev değişikliği yapıldığında diğer açık oturumda anlık bildirim/toast görünüyor

## Mobil / Erişilebilirlik

- [ ] 375px genişlikte hamburger menü açılıp kapanıyor, tüm sayfalar yatay taşma yapmadan kullanılabiliyor
- [ ] Klavye ile (Tab/Enter/Space) randevu satırları ve tıklanabilir kartlar aktive edilebiliyor
- [ ] Karanlık mod açma/kapama tüm sayfalarda tutarlı

## Genel

- [ ] `npm run typecheck`, `npm run lint`, `npm run build` hatasız geçiyor
- [ ] Production deploy sonrası (`vercel.app` linki) yukarıdaki akışlardan kritik olanlar tekrar gözden geçiriliyor
