-- Development seed data, mirrors the design prototype's mock content.
-- created_by/author_id are left null here since seed runs before any real
-- user signs up; ownership of pre-existing rows is not meaningful in dev.

insert into public.organizations (name, sector, logo_letter, contact_person, phone, email, address, total_meetings)
values
  ('Mersin Teknopark', 'Teknoloji Geliştirme', 'MT', 'Kaan Yıldırım', '0324 361 00 10', 'info@mersinteknopark.com.tr', 'Çiftlikköy Kampüsü, Mersin', 34),
  ('Akbank Genel Müdürlük', 'Bankacılık', 'AK', 'Elif Arslan', '0212 385 55 55', 'kurumsal@akbank.com', 'Levent, İstanbul', 21),
  ('Turkcell Global Bilgi', 'Telekomünikasyon', 'TC', 'Mert Şahin', '0212 313 10 00', 'kurumsal@turkcell.com.tr', 'Maslak, İstanbul', 16),
  ('Boğaziçi Üniversitesi TTO', 'Ar-Ge / Üniversite', 'BÜ', 'Burak Çelik', '0212 359 70 00', 'tto@boun.edu.tr', 'Bebek, İstanbul', 12),
  ('Vestel Elektronik', 'Üretim', 'VE', 'Aylin Demir', '0236 233 33 33', 'kurumsal@vestel.com.tr', 'Manisa', 9),
  ('Coca-Cola İçecek', 'Üretim / Gıda', 'CC', 'Nisa Yıldız', '0216 528 40 00', 'kurumsal@cci.com.tr', 'Ataşehir, İstanbul', 7);

insert into public.contacts (name, "position", company_id, phone, email, notes, tags, last_contact)
select
  v.name, v.position,
  (select id from public.organizations where name = v.company),
  v.phone, v.email, v.notes, v.tags, v.last_contact
from (
  values
    ('Nisa Yıldız', 'Genel Müdür', 'Coca-Cola İçecek', '0532 111 22 33', 'nisa.yildiz@cci.com.tr', 'Yatırım görüşmesi için önceliklendirilmeli.', array['VIP','Karar Verici'], date '2026-07-13'),
    ('Emre Kaya', 'Proje Koordinatörü', 'Mersin Teknopark', '0533 222 33 44', 'emre.kaya@mersinteknopark.com.tr', 'Haftalık durum toplantılarını takip ediyor.', array['Operasyon'], date '2026-07-21'),
    ('Aylin Demir', 'Satın Alma Müdürü', 'Vestel Elektronik', '0534 333 44 55', 'aylin.demir@vestel.com.tr', 'Sözleşme yenileme sürecinde.', array['Tedarikçi'], date '2026-07-05'),
    ('Mert Şahin', 'Kurumsal İlişkiler', 'Turkcell Global Bilgi', '0535 444 55 66', 'mert.sahin@turkcell.com.tr', 'Yeni entegrasyon teklifini bekliyor.', array['Ortaklık'], date '2026-07-16'),
    ('Elif Arslan', 'Bölge Müdürü', 'Akbank Genel Müdürlük', '0536 555 66 77', 'elif.arslan@akbank.com', 'Bütçe onayı için görüşme planlandı.', array['VIP','Finans'], date '2026-07-18'),
    ('Burak Çelik', 'Ar-Ge Direktörü', 'Boğaziçi Üniversitesi TTO', '0537 666 77 88', 'burak.celik@boun.edu.tr', 'Ortak proje başvurusu hazırlanıyor.', array['Ar-Ge'], date '2026-07-10')
) as v(name, position, company, phone, email, notes, tags, last_contact);

insert into public.appointments (title, org_id, date, "time", location, status, priority)
select
  v.title, (select id from public.organizations where name = v.company),
  v.date, v.time, v.location, v.status::appointment_status, v.priority::appointment_priority
from (
  values
    ('Nisa ile Toplantı', 'Mersin Teknopark', date '2026-07-13', time '18:50', 'Mersin Teknopark', 'Tamamlandı', 'Orta'),
    ('Önemli Toplantı', 'Mersin Teknopark', date '2026-07-16', time '18:50', 'Mersin Teknopark', 'İptal Edildi', 'Yüksek'),
    ('Yönetim Kurulu Bütçe Toplantısı', 'Akbank Genel Müdürlük', date '2026-07-18', time '08:00', 'Genel Merkez', 'Tamamlandı', 'Yüksek'),
    ('Danışmanlık Görüşmesi', 'Boğaziçi Üniversitesi TTO', date '2026-07-20', time '11:00', 'Online', 'İptal Edildi', 'Düşük'),
    ('Acil YK Toplantısı', 'Mersin Teknopark', date '2026-07-21', time '10:30', 'Mersin Teknopark', 'Devam Ediyor', 'Yüksek'),
    ('Proje Toplantısı', 'Vestel Elektronik', date '2026-07-22', time '14:30', 'Ofis - Toplantı Odası', 'Planlandı', 'Orta'),
    ('Yeni Peyzaj için Toplantı', 'Mersin Teknopark', date '2026-07-25', time '10:30', 'Mersin Teknopark', 'Planlandı', 'Düşük'),
    ('Ortaklık Görüşmesi', 'Turkcell Global Bilgi', date '2026-07-24', time '15:00', 'Maslak Ofis', 'Planlandı', 'Yüksek'),
    ('Tedarik Sözleşmesi Görüşmesi', 'Vestel Elektronik', date '2026-07-28', time '13:00', 'Manisa', 'Planlandı', 'Orta'),
    ('Yatırımcı Sunumu', 'Coca-Cola İçecek', date '2026-07-30', time '09:30', 'Ataşehir', 'Planlandı', 'Yüksek'),
    ('Ar-Ge Proje Değerlendirme', 'Boğaziçi Üniversitesi TTO', date '2026-08-03', time '11:30', 'Bebek', 'Planlandı', 'Orta'),
    ('New Appointment Final Day', 'Mersin Teknopark', date '2026-08-31', time '17:00', 'Mersin Teknopark', 'İptal Edildi', 'Düşük')
) as v(title, company, date, time, location, status, priority);

insert into public.appointment_participants (appointment_id, contact_id)
select a.id, c.id from public.appointments a, public.contacts c
where (a.title, c.name) in (
  ('Nisa ile Toplantı', 'Nisa Yıldız'), ('Nisa ile Toplantı', 'Emre Kaya'),
  ('Önemli Toplantı', 'Mert Şahin'),
  ('Yönetim Kurulu Bütçe Toplantısı', 'Elif Arslan'),
  ('Danışmanlık Görüşmesi', 'Burak Çelik'),
  ('Acil YK Toplantısı', 'Emre Kaya'),
  ('Proje Toplantısı', 'Aylin Demir'),
  ('Ortaklık Görüşmesi', 'Mert Şahin'),
  ('Tedarik Sözleşmesi Görüşmesi', 'Aylin Demir'),
  ('Yatırımcı Sunumu', 'Nisa Yıldız'),
  ('Ar-Ge Proje Değerlendirme', 'Burak Çelik'),
  ('New Appointment Final Day', 'Nisa Yıldız')
);

insert into public.appointment_notes (appointment_id, body)
select id, 'Toplantı öncesi sunum materyalleri hazırlanacak. Katılımcılardan bütçe onayı bekleniyor. Görüşme sonrası aksiyon maddeleri paylaşılacak.'
from public.appointments where title = 'Acil YK Toplantısı';

insert into public.appointment_comments (appointment_id, body)
select id, 'Salon rezervasyonu onaylandı.'
from public.appointments where title = 'Acil YK Toplantısı';
