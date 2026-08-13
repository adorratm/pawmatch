# Environment Variables Setup Guide

Bu dosya, `backend/.env` dosyasında hangi key'lerin bulunması gerektiğini açıklar.

## .env Dosyası Oluşturma

`backend` klasöründe `.env` dosyası oluşturun ve aşağıdaki içeriği ekleyin:

```env
# ============================================
# PAWMATCH MOBILE BACKEND - ENVIRONMENT VARIABLES
# ============================================

# ============================================
# DATABASE CONFIGURATION (ZORUNLU)
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=pawmatch

# ============================================
# REDIS CONFIGURATION (ZORUNLU)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ============================================
# JWT AUTHENTICATION (ZORUNLU)
# ============================================
# Production'da güçlü secret key'ler kullanın!
JWT_SECRET=change_me_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change_me_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# OAUTH - GOOGLE (OPSIYONEL)
# ============================================
# Google Cloud Console: https://console.cloud.google.com/
# 1. Proje oluşturun
# 2. APIs & Services > Credentials
# 3. OAuth 2.0 Client ID oluşturun
# 4. Authorized redirect URIs:
#    - Expo web: http://localhost:8081  (AuthSession — asıl web login)
#    - Nest passport (opsiyonel): http://localhost:3000/api/auth/google/callback
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ============================================
# OAUTH - FACEBOOK (OPSIYONEL)
# ============================================
# Facebook Developers: https://developers.facebook.com/
# 1. App oluşturun
# 2. Settings > Basic'ten App ID ve App Secret alın
# 3. Facebook Login ürününü ekleyin
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# ============================================
# OAUTH - APPLE (OPSIYONEL)
# ============================================
# Apple Developer: https://developer.apple.com/
# 1. Services ID oluşturun
# 2. Key oluşturun ve .p8 dosyasını indirin
# 3. Team ID, Key ID ve Private Key'i buraya ekleyin
APPLE_CLIENT_ID=your_apple_client_id_here
APPLE_TEAM_ID=your_apple_team_id_here
APPLE_KEY_ID=your_apple_key_id_here
APPLE_PRIVATE_KEY=your_apple_private_key_here

# Not: `APPLE_PRIVATE_KEY` multiline bir değerdir.
# - .env içinde en pratik biçim: tırnak içine alıp gerçek satır sonlarıyla yapıştırın
#   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
#   ...
#   -----END PRIVATE KEY-----"
# - Alternatif olarak `\n` kaçışlarıyla da koyabilirsiniz (kod tarafı `\\n` -> gerçek newline'a çevirir):
#   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ============================================
# AWS S3 (File Storage - OPSIYONEL)
# ============================================
# AWS Console: https://console.aws.amazon.com/
# 1. IAM > Users > Create user
# 2. Programmatic access seçin
# 3. S3FullAccess policy ekleyin
# 4. Access Key ID ve Secret Access Key'i kaydedin
# 5. S3 > Create bucket (örn: pawmatch-uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_S3_BUCKET=pawmatch-uploads

# ============================================
# GOOGLE MAPS API (OPSIYONEL)
# ============================================
# Google Cloud Console: https://console.cloud.google.com/
# 1. APIs & Services > Library
# 2. Maps JavaScript API'yi etkinleştirin
# 3. APIs & Services > Credentials > Create Credentials > API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# ============================================
# SERVER CONFIGURATION (ZORUNLU)
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# SOCKET.IO CONFIGURATION (ZORUNLU)
# ============================================
SOCKET_PORT=3000

# ============================================
# CORS CONFIGURATION (ZORUNLU)
# ============================================
# İzin verilen origin'leri virgülle ayırarak ekleyin
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

## Key'lerin Açıklamaları

### Zorunlu Key'ler

- **DB_***: PostgreSQL veritabanı bağlantı bilgileri
- **REDIS_***: Redis cache ve queue bağlantı bilgileri
- **JWT_***: JWT token oluşturma ve doğrulama için secret key'ler
- **PORT**: Backend API'nin çalışacağı port
- **NODE_ENV**: Ortam (development/production)
- **SOCKET_PORT**: Socket.IO için port
- **CORS_ORIGIN**: İzin verilen frontend origin'leri

### Opsiyonel Key'ler

- **GOOGLE_CLIENT_ID/SECRET**: Google OAuth için (kullanmıyorsanız dummy değerler bırakabilirsiniz)
- **FACEBOOK_APP_ID/SECRET**: Facebook OAuth için
- **APPLE_***: Apple OAuth için
- **AWS_***: Dosya yükleme için S3 (development'ta gerekli değil)
- **GOOGLE_MAPS_API_KEY**: Harita özellikleri için

## Hızlı Başlangıç

1. `backend` klasöründe `.env` dosyası oluşturun
2. Yukarıdaki içeriği kopyalayın
3. Zorunlu key'leri doldurun (DB, REDIS, JWT)
4. Opsiyonel key'leri ihtiyacınıza göre doldurun
5. Backend'i başlatın: `yarn start:dev`

## Auth Doğrulama (Seeder sonrası)
1. `backend` klasöründe seeder’ı çalıştırın: `yarn seed`
2. Login:
   - URL: `POST http://localhost:3000/auth/login`
   - Body (JSON):
     ```json
     { "email": "demo@pawmatch.local", "password": "password123" }
     ```
   - Yanıt içinde `accessToken` dönmelidir.
3. Kullanıcıyı doğrulama:
   - URL: `GET http://localhost:3000/users/me`
   - Header: `Authorization: Bearer <accessToken>`
   - 200 ile kullanıcı datası gelmelidir.

## Notlar

- OAuth key'leri yoksa uygulama çalışmaya devam eder (dummy değerler kullanılır)
- Production'da mutlaka güçlü JWT secret key'ler kullanın
- `.env` dosyasını git'e commit etmeyin (zaten .gitignore'da)


