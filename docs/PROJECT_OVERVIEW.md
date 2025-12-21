# PawMatch Proje Genel Bakış

## Proje Hakkında

PawMatch, hayvan sahiplendirme için dating app mantığında çalışan bir mobil uygulama ekosistemidir. Hayvan sahiplenmek isteyen ve hayvanını sahiplendirmek isteyen kullanıcıları buluşturmayı amaçlar.

## Proje Modülleri

### 1. Mobile (Mobil Uygulama)
- **Teknoloji**: React Native (Expo SDK)
- **Açıklama**: Kullanıcıların hayvan profillerini görüntüleyip eşleşme yapabileceği mobil uygulama

### 2. Mobile Backend
- **Teknoloji**: NestJS
- **Açıklama**: Mobil uygulama için REST API ve Socket.IO servisleri

### 3. Admin Panel
- **Teknoloji**: React + Vite
- **Açıklama**: Uygulama içeriğini yönetmek için admin paneli

### 4. Admin Backend
- **Teknoloji**: NestJS
- **Açıklama**: Admin paneli için API servisleri

### 5. Web Site
- **Teknoloji**: Next.js
- **Açıklama**: Uygulamanın tanıtım web sitesi

### 6. Web Backend
- **Teknoloji**: NestJS
- **Açıklama**: Web sitesi için API servisleri

## Fazlar

### Faz 1 (Mevcut)
- Tüm tasarım ekranlarının çalışır hale getirilmesi
- Kullanıcı kayıt/giriş sistemi
- Hayvan profili oluşturma ve görüntüleme
- Eşleştirme sistemi (swipe)
- Sohbet sistemi
- Bildirimler

### Faz 2 (Gelecek)
- Veteriner kayıt sistemi
- Randevu takvimi yönetimi
- Randevu rezervasyonu

### Faz 3 (Gelecek)
- Barınak kayıt sistemi
- Barınak hayvanları yönetimi
- Veteriner bilgisi entegrasyonu

## Teknik Detaylar

- **Veritabanı**: PostgreSQL (tüm backend'ler aynı DB'yi kullanır)
- **Cache**: Redis (IoRedis)
- **Queue**: BullMQ
- **Dosya Depolama**: AWS S3
- **Harita Servisi**: Google Maps
- **Paket Yöneticisi**: Yarn (Volta.sh ile yönetilir)
- **Node.js Versiyonu**: Latest LTS (Volta.sh ile sabitlenir)

## Güvenlik

- JWT token authentication
- OAuth desteği (Google, Apple, Facebook)
- Rate limiting
- CORS konfigürasyonu
- Input validation
- SQL injection koruması
- XSS koruması
- Role-based access control (RBAC)


