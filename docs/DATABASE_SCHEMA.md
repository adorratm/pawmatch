# PawMatch Veritabanı Şeması

## Genel Bakış

Tüm backend'ler (backend, admin-backend, web-backend) aynı PostgreSQL veritabanını kullanır.

## Tablolar

### Kullanıcılar

#### users
Kullanıcı temel bilgileri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Kullanıcı ID |
| email | VARCHAR(255) UNIQUE | E-posta adresi |
| password | VARCHAR(255) | Hash'lenmiş şifre |
| phone | VARCHAR(20) | Telefon numarası |
| firstName | VARCHAR(100) | Ad |
| lastName | VARCHAR(100) | Soyad |
| emailVerified | BOOLEAN | E-posta doğrulandı mı |
| phoneVerified | BOOLEAN | Telefon doğrulandı mı |
| isActive | BOOLEAN | Aktif mi |
| role | ENUM | Kullanıcı rolü (user, admin, moderator) |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### user_profiles
Kullanıcı profil detayları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Profil ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| bio | TEXT | Biyografi |
| avatar | VARCHAR(500) | Avatar URL |
| dateOfBirth | DATE | Doğum tarihi |
| gender | ENUM | Cinsiyet |
| preferences | JSONB | Kullanıcı tercihleri |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### user_locations
Kullanıcı konum bilgileri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Konum ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| latitude | DECIMAL(10,8) | Enlem |
| longitude | DECIMAL(11,8) | Boylam |
| city | VARCHAR(100) | Şehir |
| district | VARCHAR(100) | İlçe |
| address | TEXT | Adres |
| isCurrent | BOOLEAN | Mevcut konum mu |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### oauth_accounts
OAuth hesap bilgileri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | OAuth hesap ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| provider | VARCHAR(50) | Provider (google, apple, facebook) |
| providerId | VARCHAR(255) | Provider kullanıcı ID |
| accessToken | TEXT | Access token |
| refreshToken | TEXT | Refresh token |
| expiresAt | TIMESTAMP | Token sona erme tarihi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

### Hayvanlar

#### pets
Hayvan profilleri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Hayvan ID |
| ownerId | UUID (FK -> users.id) | Sahip ID |
| name | VARCHAR(100) | İsim |
| species | ENUM | Tür (dog, cat, other) |
| breed | VARCHAR(100) | Irk |
| age | INTEGER | Yaş |
| gender | ENUM | Cinsiyet (male, female) |
| bio | TEXT | Biyografi |
| isSpayed | BOOLEAN | Kısırlaştırıldı mı |
| isVaccinated | BOOLEAN | Aşılandı mı |
| healthNotes | TEXT | Sağlık notları |
| isActive | BOOLEAN | Aktif mi |
| isAdopted | BOOLEAN | Sahiplendirildi mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### pet_photos
Hayvan fotoğrafları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Fotoğraf ID |
| petId | UUID (FK -> pets.id) | Hayvan ID |
| url | VARCHAR(500) | Fotoğraf URL |
| isMain | BOOLEAN | Ana fotoğraf mı |
| order | INTEGER | Sıralama |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### temperaments
Hayvan mizaçları (lookup table)

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Mizaç ID |
| name | VARCHAR(50) UNIQUE | Mizaç adı (playful, calm, energetic, vb.) |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### pet_temperaments
Hayvan-mizaç ilişkisi (many-to-many)

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| petId | UUID (FK -> pets.id) | Hayvan ID |
| temperamentId | UUID (FK -> temperaments.id) | Mizaç ID |

### Eşleşmeler

#### matches
Eşleşme kayıtları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Eşleşme ID |
| pet1Id | UUID (FK -> pets.id) | İlk hayvan ID |
| pet2Id | UUID (FK -> pets.id) | İkinci hayvan ID |
| matchedAt | TIMESTAMP | Eşleşme tarihi |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### match_likes
Beğeniler

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Beğeni ID |
| likerPetId | UUID (FK -> pets.id) | Beğenen hayvan ID |
| likedPetId | UUID (FK -> pets.id) | Beğenilen hayvan ID |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### match_dislikes
Beğenmeyenler

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Beğenmeme ID |
| dislikerPetId | UUID (FK -> pets.id) | Beğenmeyen hayvan ID |
| dislikedPetId | UUID (FK -> pets.id) | Beğenilmeyen hayvan ID |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

### Sohbet

#### conversations
Sohbet odaları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Sohbet ID |
| matchId | UUID (FK -> matches.id) | Eşleşme ID |
| pet1Id | UUID (FK -> pets.id) | İlk hayvan ID |
| pet2Id | UUID (FK -> pets.id) | İkinci hayvan ID |
| lastMessageAt | TIMESTAMP | Son mesaj tarihi |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### messages
Mesajlar

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Mesaj ID |
| conversationId | UUID (FK -> conversations.id) | Sohbet ID |
| senderId | UUID (FK -> users.id) | Gönderen kullanıcı ID |
| content | TEXT | Mesaj içeriği |
| isRead | BOOLEAN | Okundu mu |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### message_reads
Mesaj okunma durumları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Okunma ID |
| messageId | UUID (FK -> messages.id) | Mesaj ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| readAt | TIMESTAMP | Okunma tarihi |

### Randevular (Faz 2 için hazırlık)

#### veterinarians
Veteriner bilgileri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Veteriner ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| licenseNumber | VARCHAR(100) | Lisans numarası |
| specialization | VARCHAR(200) | Uzmanlık alanı |
| experienceYears | INTEGER | Deneyim yılı |
| bio | TEXT | Biyografi |
| isVerified | BOOLEAN | Doğrulandı mı |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### veterinarian_clinics
Veteriner klinikleri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Klinik ID |
| veterinarianId | UUID (FK -> veterinarians.id) | Veteriner ID |
| name | VARCHAR(200) | Klinik adı |
| address | TEXT | Adres |
| latitude | DECIMAL(10,8) | Enlem |
| longitude | DECIMAL(11,8) | Boylam |
| city | VARCHAR(100) | Şehir |
| district | VARCHAR(100) | İlçe |
| phone | VARCHAR(20) | Telefon |
| email | VARCHAR(255) | E-posta |
| website | VARCHAR(500) | Web sitesi |
| rating | DECIMAL(3,2) | Puan |
| reviewCount | INTEGER | Yorum sayısı |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### veterinarian_services
Veteriner hizmetleri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Hizmet ID |
| clinicId | UUID (FK -> veterinarian_clinics.id) | Klinik ID |
| name | VARCHAR(100) | Hizmet adı |
| description | TEXT | Açıklama |
| price | DECIMAL(10,2) | Fiyat |
| duration | INTEGER | Süre (dakika) |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### appointments
Randevular

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Randevu ID |
| clinicId | UUID (FK -> veterinarian_clinics.id) | Klinik ID |
| petId | UUID (FK -> pets.id) | Hayvan ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| serviceId | UUID (FK -> veterinarian_services.id) | Hizmet ID |
| appointmentDate | TIMESTAMP | Randevu tarihi |
| status | ENUM | Durum (pending, confirmed, cancelled, completed) |
| notes | TEXT | Notlar |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### appointment_slots
Randevu slotları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Slot ID |
| clinicId | UUID (FK -> veterinarian_clinics.id) | Klinik ID |
| date | DATE | Tarih |
| startTime | TIME | Başlangıç saati |
| endTime | TIME | Bitiş saati |
| isAvailable | BOOLEAN | Müsait mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

### Barınaklar (Faz 3 için hazırlık)

#### shelters
Barınak bilgileri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Barınak ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| name | VARCHAR(200) | Barınak adı |
| address | TEXT | Adres |
| latitude | DECIMAL(10,8) | Enlem |
| longitude | DECIMAL(11,8) | Boylam |
| city | VARCHAR(100) | Şehir |
| district | VARCHAR(100) | İlçe |
| phone | VARCHAR(20) | Telefon |
| email | VARCHAR(255) | E-posta |
| website | VARCHAR(500) | Web sitesi |
| isVerified | BOOLEAN | Doğrulandı mı |
| isActive | BOOLEAN | Aktif mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

#### shelter_pets
Barınak hayvanları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Barınak hayvan ID |
| shelterId | UUID (FK -> shelters.id) | Barınak ID |
| petId | UUID (FK -> pets.id) | Hayvan ID |
| intakeDate | DATE | Barınağa geliş tarihi |
| isAvailable | BOOLEAN | Sahiplendirilebilir mi |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

### Diğer

#### notifications
Bildirimler

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Bildirim ID |
| userId | UUID (FK -> users.id) | Kullanıcı ID |
| type | VARCHAR(50) | Bildirim tipi |
| title | VARCHAR(200) | Başlık |
| body | TEXT | İçerik |
| data | JSONB | Ek veri |
| isRead | BOOLEAN | Okundu mu |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

#### ratings
Değerlendirmeler

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID (PK) | Değerlendirme ID |
| raterId | UUID (FK -> users.id) | Değerlendiren ID |
| rateeId | UUID (FK -> users.id) | Değerlendirilen ID |
| rating | INTEGER | Puan (1-5) |
| comment | TEXT | Yorum |
| createdAt | TIMESTAMP | Oluşturulma tarihi |

## İlişkiler

### Users
- `users` -> `user_profiles` (1:1)
- `users` -> `user_locations` (1:N)
- `users` -> `oauth_accounts` (1:N)
- `users` -> `pets` (1:N)
- `users` -> `messages` (1:N)
- `users` -> `notifications` (1:N)

### Pets
- `pets` -> `pet_photos` (1:N)
- `pets` -> `pet_temperaments` (N:M via pet_temperaments)
- `pets` -> `matches` (N:M via matches)
- `pets` -> `match_likes` (1:N as liker/liked)
- `pets` -> `match_dislikes` (1:N as disliker/disliked)

### Matches
- `matches` -> `conversations` (1:1)
- `matches` -> `pets` (N:2 via pet1Id, pet2Id)

### Conversations
- `conversations` -> `messages` (1:N)
- `conversations` -> `matches` (1:1)

## Indexler

- `users.email` (UNIQUE)
- `users.phone` (UNIQUE)
- `user_locations.userId` (INDEX)
- `user_locations.latitude, longitude` (SPATIAL INDEX)
- `pets.ownerId` (INDEX)
- `pets.species` (INDEX)
- `match_likes.likerPetId, likedPetId` (INDEX)
- `messages.conversationId` (INDEX)
- `messages.createdAt` (INDEX)
- `conversations.matchId` (UNIQUE)

## Migration Stratejisi

TypeORM migration'ları kullanılacak. Migration dosyaları `backend/src/migrations/` klasöründe tutulacak.






