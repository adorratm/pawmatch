# Assets Kurulumu

## Gerekli Dosyalar

Uygulama icon'ları ve splash screen görsellerini eklemek için `assets` klasörüne aşağıdaki dosyaları ekleyin:

### 1. Icon Dosyaları

- **icon.png** (1024x1024 px) - Ana uygulama ikonu
- **adaptive-icon.png** (1024x1024 px) - Android adaptive icon
- **favicon.png** (48x48 px) - Web favicon

### 2. Splash Screen

- **splash.png** (1242x2436 px) - iOS splash screen

## Geçici Çözüm

Şu anda `app.json` dosyasında icon path'leri kaldırıldı, Expo varsayılan icon'ları kullanacak.

## Production İçin

Gerçek icon'ları ekledikten sonra `app.json` dosyasını güncelleyin:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6a3f2a"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6a3f2a"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Icon Oluşturma

1. 1024x1024 px boyutunda bir icon tasarlayın
2. PawMatch temasına uygun (kahverengi tonları: #6a3f2a)
3. PNG formatında kaydedin
4. `assets` klasörüne ekleyin


