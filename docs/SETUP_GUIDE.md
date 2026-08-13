# PawMatch Kurulum Rehberi

## Gereksinimler

- Node.js (Latest LTS) - Volta.sh ile yönetilecek
- Yarn (Latest)
- PostgreSQL 15+
- Redis 7+
- AWS S3 hesabı (dosya yükleme için)
- Google Maps API key

## Volta.sh Kurulumu

Volta.sh, Node.js ve Yarn versiyonlarını otomatik olarak yönetir.

### macOS/Linux Kurulumu
```bash
curl https://get.volta.sh | bash
```

### Windows Kurulumu
```powershell
iwr https://get.volta.sh | iex
```

## Proje Kurulumu

### 1. Repository'yi Klonlayın
```bash
cd /Users/adorratm/Desktop/pawmatch
```

### 2. PostgreSQL Veritabanı Kurulumu

```bash
# PostgreSQL'i başlatın
brew services start postgresql@15

# Veritabanı oluşturun
createdb pawmatch

# Veya psql ile:
psql postgres
CREATE DATABASE pawmatch;
```

### 3. Redis Kurulumu

```bash
# Redis'i başlatın
brew services start redis

# Redis'i test edin
redis-cli ping
# PONG dönmeli
```

### 4. Environment Variables

Her backend projesi için `.env` dosyası oluşturulmalıdır:

#### backend/.env
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=pawmatch

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=30d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=pawmatch-uploads

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server
PORT=3000
NODE_ENV=development
```

#### admin-backend/.env
```env
# Database (aynı DB)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=pawmatch

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Server
PORT=3001
NODE_ENV=development
```

#### web-backend/.env
```env
# Database (aynı DB)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=pawmatch

# Server
PORT=3002
NODE_ENV=development
```

### 5. Mobile Backend Kurulumu

```bash
cd backend
yarn install
yarn run migration:run
yarn start:dev
```

### 6. Admin Backend Kurulumu

```bash
cd admin-backend
yarn install
yarn start:dev
```

### 7. Web Backend Kurulumu

```bash
cd web-backend
yarn install
yarn start:dev
```

### 8. Mobile App Kurulumu

```bash
cd mobile
yarn install
yarn start
```

### 9. Admin Panel Kurulumu

```bash
cd admin
yarn install
yarn dev
```

### 10. Web Site Kurulumu

```bash
cd web
yarn install
yarn dev
```

## Veritabanı Migration'ları

### Migration Oluşturma
```bash
cd backend
yarn run migration:create --name=CreateUsersTable
```

### Migration Çalıştırma
```bash
yarn run migration:run
```

### Migration Geri Alma
```bash
yarn run migration:revert
```

## Development Workflow

### Backend Geliştirme
1. Backend'i başlatın: `yarn start:dev`
2. Hot reload aktif olacak
3. Değişiklikler otomatik yenilenecek

### Frontend Geliştirme
1. Frontend'i başlatın: `yarn dev`
2. Hot reload aktif olacak
3. Tarayıcı otomatik yenilenecek

### Mobil Geliştirme
1. Expo'yu başlatın: `yarn start`
2. QR kodu Expo Go uygulaması ile tarayın
3. Hot reload aktif olacak

## Test Çalıştırma

### Backend Tests
```bash
cd backend
yarn test
yarn test:e2e
```

### Frontend Tests
```bash
cd admin
yarn test
```

### Mobile Tests
```bash
cd mobile
yarn test
```

## Troubleshooting

### PostgreSQL Bağlantı Hatası
- PostgreSQL servisinin çalıştığından emin olun: `brew services list`
- Veritabanının var olduğunu kontrol edin: `psql -l`

### Redis Bağlantı Hatası
- Redis servisinin çalıştığından emin olun: `redis-cli ping`
- Port'un kullanımda olmadığını kontrol edin: `lsof -i :6379`

### Port Zaten Kullanımda
- Port'u kullanan process'i bulun: `lsof -i :3000`
- Process'i sonlandırın: `kill -9 <PID>`

### Volta.sh Versiyon Hatası
- Volta'nın kurulu olduğunu kontrol edin: `volta --version`
- Node versiyonunu kontrol edin: `node --version`
- Yarn versiyonunu kontrol edin: `yarn --version`






