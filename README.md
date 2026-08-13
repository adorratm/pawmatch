# PawMatch

Hayvan sahiplendirme için dating app mantığında çalışan mobil uygulama ekosistemi.

## Proje hakkında

PawMatch, hayvan sahiplenmek isteyen ve hayvanını sahiplendirmek isteyen kullanıcıları buluşturan bir platformdur. Tinder/Bumble tarzı swipe mekanizması ile kullanıcılar hayvan profillerini görüntüleyip eşleşme yapabilirler.

## Proje yapısı

```
pawmatch/
├── backend/     # NestJS API (mobil + admin + public CMS)
├── mobile/      # Expo React Native
├── admin/       # Next.js yönetim paneli
├── web/         # Next.js tanıtım sitesi
└── docs/        # Dokümantasyon
```

Ayrı `admin-backend` / `web-backend` yok; tüm API tek NestJS `backend` üzerinde.

## Hızlı başlangıç

Detaylı kurulum: [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

### Gereksinimler

- Node.js + Yarn — Volta pin: Node `26.7.0`, Yarn `4.18.0`
- PostgreSQL 15+
- (Opsiyonel) Redis, AWS S3, Google Maps, RevenueCat

### Kurulum

```bash
# Kökten tüm workspaces
yarn install

# Backend .env (backend/.env.example'dan kopyala)
# Admin: admin/.env.local (NEXT_PUBLIC_API_URL)
```

### Çalıştırma (kökten)

```bash
yarn start:api      # NestJS → http://localhost:3000/api
yarn start:mobile  # Expo
yarn start:admin   # Next.js admin → http://localhost:3001
yarn start:web     # Tanıtım sitesi → http://localhost:3002
```

### Admin girişi (seed sonrası)

- E-posta: `admin@pawmatch.local`
- Şifre: `admin123`

```bash
yarn seed
```

## Teknoloji

| Alan | Stack |
|------|--------|
| Mobil | Expo, Zustand, i18next, Socket.IO, RevenueCat |
| API | NestJS, PostgreSQL, TypeORM, JWT + RBAC |
| Admin | Next.js 16, Tailwind |
| Web | Next.js 16, Tailwind |

## Yönetim paneli kapsamı

Kullanıcılar, petler, eşleşmeler, destek, i18n CMS, reklamlar, abonelik paketleri, ayarlar, veterinerler, barınaklar, temperamentler, bildirim yayını.

Public endpoint’ler (mobil): `GET /api/i18n/:locale`, `GET /api/ads/active`, `GET /api/plans`.

## Dokümantasyon

- [Proje Genel Bakış](docs/PROJECT_OVERVIEW.md)
- [API Dökümantasyonu](docs/API_DOCUMENTATION.md)
- [Kurulum Rehberi](docs/SETUP_GUIDE.md)

## Lisans

Bu proje özel bir projedir.
