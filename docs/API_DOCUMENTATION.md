# PawMatch API Dökümantasyonu

## Base URL

- Mobile Backend: `http://localhost:3000/api`
- Admin Backend: `http://localhost:3001/api`
- Web Backend: `http://localhost:3002/api`

## Authentication

Tüm protected endpoint'ler için `Authorization` header'ında JWT token gönderilmelidir:

```
Authorization: Bearer <token>
```

## Mobile Backend API Endpoints

### Auth

#### POST /auth/register
Kullanıcı kaydı

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "phone": "+905551234567"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  }
}
```

#### POST /auth/login
Kullanıcı girişi

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** (register ile aynı)

#### POST /auth/oauth/google
Google OAuth ile giriş

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

#### POST /auth/oauth/apple
Apple OAuth ile giriş

**Request Body:**
```json
{
  "idToken": "apple_id_token",
  "authorizationCode": "authorization_code"
}
```

#### POST /auth/oauth/facebook
Facebook OAuth ile giriş

**Request Body:**
```json
{
  "accessToken": "facebook_access_token"
}
```

#### POST /auth/refresh
Token yenileme

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Çıkış yapma

### Users

#### GET /users/me
Kullanıcı bilgilerini getir

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "phone": "+905551234567",
  "profile": {
    "bio": "Pet lover",
    "avatar": "https://s3.../avatar.jpg"
  },
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784,
    "city": "Istanbul",
    "district": "Kadıköy"
  }
}
```

#### PUT /users/me
Profil güncelleme

**Request Body:**
```json
{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "bio": "Updated bio"
}
```

#### POST /users/me/location
Konum güncelleme

**Request Body:**
```json
{
  "latitude": 41.0082,
  "longitude": 28.9784,
  "city": "Istanbul",
  "district": "Kadıköy"
}
```

### Pets

#### POST /pets
Hayvan profili oluşturma

**Request Body:**
```json
{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 2,
  "gender": "male",
  "temperaments": ["playful", "energetic"],
  "isSpayed": true,
  "isVaccinated": true,
  "bio": "Very friendly dog"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 2,
  "gender": "male",
  "photos": [],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### GET /pets/:id
Hayvan detayı

**Response:**
```json
{
  "id": "uuid",
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 2,
  "gender": "male",
  "temperaments": ["playful", "energetic"],
  "photos": [
    {
      "id": "uuid",
      "url": "https://s3.../photo1.jpg",
      "isMain": true,
      "order": 1
    }
  ],
  "owner": {
    "id": "uuid",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  },
  "distance": 2.5
}
```

#### PUT /pets/:id
Hayvan güncelleme

#### DELETE /pets/:id
Hayvan silme

#### POST /pets/:id/photos
Fotoğraf yükleme

**Request:** Multipart form data
- `file`: Image file
- `isMain`: boolean (optional)
- `order`: number (optional)

**Response:**
```json
{
  "id": "uuid",
  "url": "https://s3.../photo.jpg",
  "isMain": false,
  "order": 1
}
```

#### DELETE /pets/:id/photos/:photoId
Fotoğraf silme

### Matches

#### GET /matches/discover
Keşfet (swipe için hayvanlar)

**Query Parameters:**
- `latitude`: number
- `longitude`: number
- `radius`: number (km, default: 50)
- `species`: string (optional)
- `minAge`: number (optional)
- `maxAge`: number (optional)
- `gender`: string (optional)

**Response:**
```json
{
  "pets": [
    {
      "id": "uuid",
      "name": "Buddy",
      "photos": [...],
      "distance": 2.5,
      "matchScore": 98
    }
  ],
  "hasMore": true
}
```

#### POST /matches/:petId/like
Beğen

**Response:**
```json
{
  "isMatch": true,
  "matchId": "uuid",
  "conversationId": "uuid"
}
```

#### POST /matches/:petId/dislike
Beğenme

**Response:**
```json
{
  "success": true
}
```

#### GET /matches
Eşleşmelerim

**Response:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "pet": {
        "id": "uuid",
        "name": "Buddy",
        "photos": [...]
      },
      "matchedAt": "2024-01-01T00:00:00Z",
      "conversationId": "uuid"
    }
  ]
}
```

#### GET /matches/:matchId
Eşleşme detayı

### Conversations

#### GET /conversations
Sohbet listesi

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "pet": {
        "id": "uuid",
        "name": "Buddy",
        "photos": [...]
      },
      "lastMessage": {
        "content": "Merhaba!",
        "sentAt": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### GET /conversations/:id
Sohbet detayı

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response:**
```json
{
  "id": "uuid",
  "pet": {
    "id": "uuid",
    "name": "Buddy",
    "photos": [...]
  },
  "messages": [
    {
      "id": "uuid",
      "content": "Merhaba!",
      "senderId": "uuid",
      "sentAt": "2024-01-01T00:00:00Z",
      "isRead": false
    }
  ],
  "hasMore": false
}
```

#### POST /conversations/:id/messages
Mesaj gönder

**Request Body:**
```json
{
  "content": "Merhaba!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Merhaba!",
  "senderId": "uuid",
  "sentAt": "2024-01-01T00:00:00Z",
  "isRead": false
}
```

#### GET /conversations/:id/messages
Mesajları getir

#### PUT /conversations/:id/read
Okundu işaretle

## Socket.IO Events

### Client Events

#### `message:send`
Mesaj gönderme
```json
{
  "conversationId": "uuid",
  "content": "Merhaba!"
}
```

#### `typing:start`
Yazmaya başlama
```json
{
  "conversationId": "uuid"
}
```

#### `typing:stop`
Yazmayı bırakma
```json
{
  "conversationId": "uuid"
}
```

### Server Events

#### `message:new`
Yeni mesaj geldi
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "content": "Merhaba!",
  "senderId": "uuid",
  "sentAt": "2024-01-01T00:00:00Z"
}
```

#### `match:new`
Yeni eşleşme
```json
{
  "matchId": "uuid",
  "pet": {
    "id": "uuid",
    "name": "Buddy",
    "photos": [...]
  },
  "conversationId": "uuid"
}
```

#### `typing:start`
Birisi yazıyor
```json
{
  "conversationId": "uuid",
  "userId": "uuid"
}
```

#### `typing:stop`
Birisi yazmayı bıraktı
```json
{
  "conversationId": "uuid",
  "userId": "uuid"
}
```

## Error Responses

Tüm hatalar aşağıdaki formatta döner:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error






