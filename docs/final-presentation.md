# Final Sunum Notu

## Proje

**Technoscope Randevu** — Mersin Teknopark / Technoscope için kurumsal randevu takip ve organizasyon sistemi.
Canlı: https://randevu-takip-organizasyon.vercel.app

## Problem

Kurumlarla yapılan toplantı/randevu takibi, katılımcı bilgisi, notlar ve sonraki adımlar dağınık (e-posta, kağıt, hafıza) yürütülüyor; kimin hangi randevudan/görevden sorumlu olduğu ve hangi kayıtların gecikmiş olduğu tek bir yerden görülemiyor.

## Çözüm — Kapsam

- Randevu, kişi, kurum, görev kayıtlarının tek bir panelden yönetilmesi
- Rol bazlı erişim (admin/yönetici/personel/misafir) ve iki adımlı doğrulama
- Randevulara sorumlu kullanıcı ve katılımcı (kişi) ataması
- Görevlerin isteğe bağlı olarak randevulara bağlanabilmesi
- Geciken randevu/görevlerin dashboard'da ve listelerde görsel olarak vurgulanması
- Filtreleme (durum, kurum, kişi, sorumlu, tarih aralığı) ve genel arama
- Raporlama (en aktif kurum/personel, yıllık performans, toplantı süresi) ve CSV/Excel/PDF export
- Otomatik hatırlatma e-postaları ve randevu onay maili
- Canlı (Realtime) bildirimler

## Mimari Özet

- **Next.js 16 (App Router) + TypeScript** — server component'ler ile veri çekimi, server action'lar ile yazma
- **Supabase** — Postgres + RLS (rol bazlı yetkilendirme), Auth + MFA, Storage (dosya ekleri), Realtime (canlı bildirim)
- **Vercel** — hosting + cron job (günlük hatırlatma maili)
- **Resend** — transactional e-posta

## Demo Akışı (önerilen sunum sırası)

1. Giriş yap (`demo@technoscope-randevu.app`) → Dashboard'da özet istatistikler ve (varsa) "Gecikmiş Kayıtlar" panelini göster
2. Randevular → Yeni Randevu: kurum, sorumlu kullanıcı ve katılımcı (kişi) seçerek bir randevu oluştur
3. Oluşan randevuyu aç → Katılımcılar/Notlar/Dosyalar/Mail sekmelerini gez, sorumluyu değiştir
4. Filtreleri kullan: tarih aralığı + sorumlu kullanıcı ile daralt
5. Görevler → bir randevuya bağlı, sorumlusu atanmış bir görev oluştur; geçmiş bir tarih verip "Gecikti" rozetini göster
6. Raporlar → en aktif kurum/personel grafiklerini göster
7. (Varsa ikinci bir tarayıcı sekmesi) bir değişiklik yap, diğer sekmede Realtime bildirimin anlık düştüğünü göster
8. Ayarlar → 2FA kurulumu ve şifre değiştirme akışını kısaca göster

## Öne Çıkan Kararlar ve Gerekçeleri

- **Randevu ↔ Kişi ilişkisi çoka-çok** (`appointment_participants` tablosu) tekil bir `contact_id` yerine tercih edildi — bir toplantıya birden fazla katılımcı eklenebilmesi gerçek kullanım senaryosuna daha uygun.
- **RLS rol bazlı, kayıt bazlı değil** — personelin birbirinin randevularını görebilmesi bilinçli tercih (iş birliği), ama bu çok kiracılı bir kullanım için yeterli değil (bkz. `docs/security-review.md`).
- **Realtime prod'da bozulmuştu** (anon key'de görünmez boşluk) — bu, ortam değişkenlerinin CLI/panelden girilirken görünmez karakterlere karşı ne kadar kırılgan olabileceğinin somut bir örneği oldu.

## Bilinen Sınırlar

Bkz. `README.md` → "Bilinen Eksikler / Sonraki Adımlar" ve `docs/security-review.md` / `docs/ai-code-review.md`. Özetle: Resend domain doğrulaması, KVKK metninin gerçek kurum bilgileriyle güncellenmesi, row-ownership RLS, otomatik test kapsamının artırılması, hata izleme entegrasyonu.

## Öğrenilenler

- Küçük görünen bir ortam değişkeni hatası (bir boşluk karakteri) yalnızca belirli bir alt sistemi (Realtime/WebSocket) bozabiliyor; REST/Auth çalışıyor diye "her şey yolunda" sonucuna varmak yanıltıcı olabiliyor — her alt sistemi ayrı ayrı doğrulamak gerekiyor.
- CSS framework majör sürüm geçişlerinde (Tailwind v3 → v4) daha önce güvenli varsayılan olan bir kalıp (inline `transform` stiliyle class tabanlı `-translate-x-full`'u override etmek) sessizce bozulabiliyor; hatanın kaynağı UI'da değil, framework'ün property modelindeki değişiklikte olabiliyor.
