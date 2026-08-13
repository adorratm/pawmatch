# PawMatch Kurulum Rehberi

## Gereksinimler

- Node.js + Yarn — Volta pin: **Node 26.7.0**, **Yarn 4.18.0**
- PostgreSQL 15+
- (Opsiyonel) Redis 7+, Elasticsearch 8, AWS S3, Google Maps, RevenueCat

Docker ile Redis + Elasticsearch:

```bash
docker compose up -d
```

`ELASTICSEARCH_NODE=http://localhost:9200` ve `REDIS_HOST=localhost` backend `.env` içinde.

## Volta

### macOS/Linux
```bash
curl https://get.volta.sh | bash
```

### Windows
```powershell
iwr https://get.volta.sh | iex
```

Repo köküne girince Volta otomatik pin’leri kullanır.

## Monorepo kurulumu

```bash
cd pawmatch
yarn install
```

Tek `yarn.lock` kökte; workspaces: `backend`, `mobile`, `admin`, `web`.

### PostgreSQL

```bash
createdb pawmatch
```

### Environment

#### `backend/.env`
`backend/.env.example` dosyasını kopyalayın. En azından:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=pawmatch
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
NODE_ENV=development
DB_SYNCHRONIZE=true
REDIS_HOST=localhost
REDIS_PORT=6379
ELASTICSEARCH_NODE=http://localhost:9200
```

#### `admin/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### `mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Çalıştırma (kökten)

```bash
yarn start:api      # http://localhost:3000/api
yarn start:mobile
yarn start:admin   # http://localhost:3001
yarn start:web     # http://localhost:3002
```

## Seed

```bash
yarn seed
```

Demo kullanıcı: `demo@pawmatch.local` / `password123`  
Admin panel: `admin@pawmatch.local` / `admin123`

Seed ayrıca TR i18n anahtarlarını (mobil `tr.json`), free/gold paketleri ve örnek reklam creative’ini yükler.

## Mimari not

- **Tek API:** Admin route’ları `/api/admin/*` altında; RBAC (`admin` / `moderator`).
- Ayrı `admin-backend` / `web-backend` **yok**.
- Public CMS: `/api/i18n/:locale`, `/api/ads/active`, `/api/plans`.

## Troubleshooting

### PostgreSQL
- Servisin çalıştığını ve `pawmatch` DB’nin varlığını kontrol edin.

### Port kullanımda
- API `3000`, admin `3001`, web `3002`.

### Volta
```bash
volta --version
node --version   # 26.7.0
yarn --version   # 4.18.0
```
