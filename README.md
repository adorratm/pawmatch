# PawMatch

Hayvan sahiplendirme için dating app mantığında çalışan mobil uygulama ekosistemi.

## 📱 Proje Hakkında

PawMatch, hayvan sahiplenmek isteyen ve hayvanını sahiplendirmek isteyen kullanıcıları buluşturan bir platformdur. Tinder/Bumble tarzı swipe mekanizması ile kullanıcılar hayvan profillerini görüntüleyip eşleşme yapabilirler.

## 🏗️ Proje Yapısı

```
pawmatch/
├── mobile/                    # React Expo mobil uygulama
├── backend/            # NestJS API (mobil için)
├── admin/                     # React admin paneli
├── admin-backend/             # NestJS API (admin için)
├── web/                       # Next.js tanıtım sitesi
├── web-backend/               # NestJS API (web için)
└── docs/                      # Proje dökümantasyonu
```

## 🚀 Hızlı Başlangıç

Detaylı kurulum rehberi için [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) dosyasına bakın.

### Gereksinimler

- Node.js (Latest LTS) - Volta.sh ile yönetilir
- Yarn (Latest)
- PostgreSQL 15+
- Redis 7+
- AWS S3 hesabı
- Google Maps API key

### Kurulum

```bash
# Her modül için ayrı ayrı kurulum yapın
cd backend && yarn install
cd admin-backend && yarn install
cd web-backend && yarn install
cd mobile && yarn install
cd admin && yarn install
cd web && yarn install
```

## 📚 Dökümantasyon

- [Proje Genel Bakış](docs/PROJECT_OVERVIEW.md)
- [API Dökümantasyonu](docs/API_DOCUMENTATION.md)
- [Kurulum Rehberi](docs/SETUP_GUIDE.md)

## 🛠️ Teknoloji Stack

### Mobil Uygulama
- React Native (Expo SDK)
- React Navigation
- Zustand (State Management)
- Socket.IO Client

### Backend
- NestJS
- PostgreSQL + TypeORM
- Redis (IoRedis)
- BullMQ
- Socket.IO
- AWS S3

### Admin Panel
- React + Vite
- Material-UI
- Zustand

### Web Site
- Next.js (App Router)
- Tailwind CSS

## 🔐 Güvenlik

- JWT token authentication
- OAuth desteği (Google, Apple, Facebook)
- Rate limiting
- Input validation
- SQL injection koruması
- XSS koruması
- Role-based access control (RBAC)

## 📋 Fazlar

### Faz 1 (Mevcut)
- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Hayvan profili oluşturma
- ✅ Eşleştirme sistemi
- ✅ Sohbet sistemi
- ✅ Bildirimler

### Faz 2 (Gelecek)
- Veteriner kayıt sistemi
- Randevu takvimi yönetimi

### Faz 3 (Gelecek)
- Barınak kayıt sistemi
- Barınak hayvanları yönetimi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 📞 İletişim

Sorularınız için issue açabilirsiniz.






