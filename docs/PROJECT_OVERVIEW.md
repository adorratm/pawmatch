# PawMatch Proje Genel Bakış

## Proje Hakkında

PawMatch, hayvan sahiplendirme için dating app mantığında çalışan bir mobil uygulama ekosistemidir. Hayvan sahiplenmek isteyen ve hayvanını sahiplendirmek isteyen kullanıcıları buluşturmayı amaçlar.

## Proje Modülleri

### 1. Mobile
- **Teknoloji**: React Native (Expo SDK)
- **Açıklama**: Keşfet, eşleşme, sohbet, IAP

### 2. Backend (tek API)
- **Teknoloji**: NestJS + TypeORM + PostgreSQL
- **Açıklama**: Mobil REST/Socket API + `/api/admin/*` RBAC + public i18n/ads/plans

### 3. Admin Panel
- **Teknoloji**: Next.js 16 + Tailwind
- **Açıklama**: Kullanıcı, pet, i18n, reklam, paket ve diğer CMS yönetimi

### 4. Web Site
- **Teknoloji**: Next.js 16 + Tailwind
- **Açıklama**: Tanıtım / landing

## Monorepo komutları

```bash
yarn install
yarn start:api
yarn start:mobile
yarn start:admin
yarn start:web
```

## Fazlar

### Faz 1 (Mevcut)
- Kullanıcı kayıt/giriş
- Hayvan profili, eşleşme, sohbet
- Bildirimler, abonelik (Pati Gold)
- Admin paneli + tanıtım sitesi

### Faz 2
- Veteriner / randevu derinleştirme

### Faz 3
- Barınak yönetimi derinleştirme
