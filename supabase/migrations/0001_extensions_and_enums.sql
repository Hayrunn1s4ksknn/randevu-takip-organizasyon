-- Extensions
create extension if not exists pgcrypto;

-- Enums
create type user_role as enum ('admin', 'yonetici', 'personel', 'misafir');
create type appointment_status as enum ('Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi');
create type appointment_priority as enum ('Düşük', 'Orta', 'Yüksek');
