import { DataSource } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { UserLocation } from '../database/entities/user-location.entity';
import { OAuthAccount } from '../database/entities/oauth-account.entity';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { PetTemperament } from '../database/entities/pet-temperament.entity';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { MessageRead } from '../database/entities/message-read.entity';
import { Notification } from '../database/entities/notification.entity';
import { Rating } from '../database/entities/rating.entity';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { VeterinarianService } from '../database/entities/veterinarian-service.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentSlot } from '../database/entities/appointment-slot.entity';
import { Shelter } from '../database/entities/shelter.entity';
import { ShelterPet } from '../database/entities/shelter-pet.entity';
import { PetFavorite } from '../database/entities/pet-favorite.entity';
import { ClinicReview } from '../database/entities/clinic-review.entity';
import { SupportTicket } from '../database/entities/support-ticket.entity';
import { UserPushToken } from '../database/entities/user-push-token.entity';
import { Gender } from '../database/entities/user-profile.entity';
import { PetSpecies, PetGender } from '../database/entities/pet.entity';
import { AppointmentStatus } from '../database/entities/appointment.entity';
import { TranslationLocale } from '../database/entities/translation-locale.entity';
import { TranslationEntry } from '../database/entities/translation-entry.entity';
import { AdPlacement } from '../database/entities/ad-placement.entity';
import { AdCreative } from '../database/entities/ad-creative.entity';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import { AppSetting } from '../database/entities/app-setting.entity';
import { CmsPage } from '../database/entities/cms-page.entity';
import { flattenObject } from '../common/i18n-flatten.util';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];
const envFile = envPaths.find((candidate) => fs.existsSync(candidate));
if (envFile) {
  dotenv.config({ path: envFile });
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'pawmatch',
  entities: [
    User,
    UserProfile,
    UserLocation,
    OAuthAccount,
    Pet,
    PetPhoto,
    Temperament,
    PetTemperament,
    Match,
    MatchLike,
    MatchDislike,
    Conversation,
    Message,
    MessageRead,
    Notification,
    Rating,
    Veterinarian,
    VeterinarianClinic,
    VeterinarianService,
    Appointment,
    AppointmentSlot,
    Shelter,
    ShelterPet,
    PetFavorite,
    ClinicReview,
    SupportTicket,
    UserPushToken,
    TranslationLocale,
    TranslationEntry,
    AdPlacement,
    AdCreative,
    SubscriptionPlan,
    AppSetting,
    CmsPage,
  ],
  synchronize: true,
  logging: true,
});

const firstNames = [
  'Ahmet', 'Mehmet', 'Ali', 'Veli', 'Can', 'Cem', 'Deniz', 'Emre', 'Fatih', 'Gökhan',
  'Hakan', 'İbrahim', 'Kemal', 'Levent', 'Murat', 'Onur', 'Özgür', 'Serkan', 'Tolga', 'Uğur',
  'Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Derya', 'Gizem', 'Hande', 'İpek',
  'Kader', 'Leyla', 'Nazlı', 'Özge', 'Pınar', 'Seda', 'Tuğba', 'Yasemin', 'Zehra', 'Büşra',
];

const lastNames = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
  'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
];

const petNames = [
  'Buddy', 'Max', 'Charlie', 'Cooper', 'Rocky', 'Duke', 'Bear', 'Tucker', 'Jack', 'Oliver',
  'Luna', 'Bella', 'Lucy', 'Daisy', 'Lily', 'Zoe', 'Chloe', 'Sophie', 'Mia', 'Stella',
  'Tarçın', 'Boncuk', 'Pamuk', 'Şeker', 'Köpük', 'Pati', 'Minnoş', 'Tatlı', 'Sevimli', 'Yaramaz',
];

const breeds = {
  dog: ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky'],
  cat: ['Persian', 'Maine Coon', 'British Shorthair', 'Siamese', 'Ragdoll', 'Bengal', 'Scottish Fold', 'Sphynx', 'Turkish Angora', 'Norwegian Forest'],
};

const temperaments = ['Playful', 'Calm', 'Energetic', 'Shy', 'Cuddly', 'Independent', 'Friendly', 'Loyal', 'Curious', 'Gentle'];

const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Kayseri', 'Mersin'];
const districts = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Kartal', 'Pendik'];

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(UserProfile);
  const locationRepo = AppDataSource.getRepository(UserLocation);
  const petRepo = AppDataSource.getRepository(Pet);
  const photoRepo = AppDataSource.getRepository(PetPhoto);
  const temperamentRepo = AppDataSource.getRepository(Temperament);
  const matchRepo = AppDataSource.getRepository(Match);
  const likeRepo = AppDataSource.getRepository(MatchLike);
  const conversationRepo = AppDataSource.getRepository(Conversation);
  const messageRepo = AppDataSource.getRepository(Message);
  const notificationRepo = AppDataSource.getRepository(Notification);
  const vetRepo = AppDataSource.getRepository(Veterinarian);
  const clinicRepo = AppDataSource.getRepository(VeterinarianClinic);
  const serviceRepo = AppDataSource.getRepository(VeterinarianService);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  // Create temperaments
  console.log('Creating temperaments...');
  // Seed is expected to be re-runnable; avoid unique constraint errors.
  const temperamentEntities = await Promise.all(
    temperaments.map(async (name) => {
      const existing = await temperamentRepo.findOne({ where: { name } });
      if (existing) return existing;
      const temp = temperamentRepo.create({ name });
      return temperamentRepo.save(temp);
    }),
  );

  // Create users
  console.log('Creating users...');
  const users = [];
  const hashedPassword123 = await bcrypt.hash('password123', 10);
  const hashedPasswordTarget = hashedPassword123;

  // Ensure a stable demo account can always login after seeding.
  const targetEmail = 'demo@pawmatch.local';
  const targetFirstName = 'Demo';
  const targetLastName = 'User';
  // Keep outside the demo range used by user1..user50 (+905550000001..+905550000050)
  const targetPhone = '+905550000099';

  const ensureUserProfileAndLocation = async (userId: number) => {
    // UserProfile
    let profile = await profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = profileRepo.create({
        userId,
        bio: 'Pet lover',
        avatar: 'https://i.pravatar.cc/150?img=20',
        dateOfBirth: new Date(1990, 4, 20),
        gender: Gender.MALE,
      });
      await profileRepo.save(profile);
    }

    // UserLocation (ensure at least one current location)
    let location = await locationRepo.findOne({ where: { userId, isCurrent: true } });
    if (!location) {
      location = locationRepo.create({
        userId,
        latitude: 41.0082,
        longitude: 28.9784,
        city: 'Istanbul',
        district: 'Kadıköy',
        isCurrent: true,
      });
      await locationRepo.save(location);
    }
  };

  let targetUser = await userRepo.findOne({ where: { email: targetEmail } });
  if (!targetUser) {
    targetUser = userRepo.create({
      email: targetEmail,
      password: hashedPasswordTarget,
      phone: targetPhone,
      firstName: targetFirstName,
      lastName: targetLastName,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    });
    targetUser = await userRepo.save(targetUser);
  } else {
    // Update password so the provided credentials always work.
    targetUser.password = hashedPasswordTarget;
    targetUser.firstName = targetFirstName;
    targetUser.lastName = targetLastName;
    if (!targetUser.phone) targetUser.phone = targetPhone;
    await userRepo.save(targetUser);
  }

  await ensureUserProfileAndLocation(targetUser.id);
  users.push(targetUser);

  // Admin account for management panel
  const adminEmail = 'admin@pawmatch.local';
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = userRepo.create({
      email: adminEmail,
      password: hashedAdmin,
      phone: '+905550000098',
      firstName: 'Admin',
      lastName: 'PawMatch',
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      role: UserRole.ADMIN,
    });
    adminUser = await userRepo.save(adminUser);
  } else {
    adminUser.password = hashedAdmin;
    adminUser.role = UserRole.ADMIN;
    adminUser.isActive = true;
    await userRepo.save(adminUser);
  }
  await ensureUserProfileAndLocation(adminUser.id);
  console.log(`Admin ready: ${adminEmail} / admin123`);

  // CMS defaults: locales, plans, ads, settings
  const localeRepo = AppDataSource.getRepository(TranslationLocale);
  const entryRepo = AppDataSource.getRepository(TranslationEntry);
  const placementRepo = AppDataSource.getRepository(AdPlacement);
  const creativeRepo = AppDataSource.getRepository(AdCreative);
  const planRepo = AppDataSource.getRepository(SubscriptionPlan);
  const settingRepo = AppDataSource.getRepository(AppSetting);

  let trLocale = await localeRepo.findOne({ where: { code: 'tr' } });
  if (!trLocale) {
    trLocale = await localeRepo.save(
      localeRepo.create({ code: 'tr', name: 'Türkçe', isDefault: true, isActive: true }),
    );
  }

  const trJsonPath = path.resolve(__dirname, '../../../mobile/src/i18n/resources/tr.json');
  if (fs.existsSync(trJsonPath)) {
    const entryCount = await entryRepo.count({ where: { localeId: trLocale.id } });
    if (entryCount === 0) {
      const raw = JSON.parse(fs.readFileSync(trJsonPath, 'utf8')) as Record<string, unknown>;
      const flat = flattenObject(raw);
      for (const [key, value] of Object.entries(flat)) {
        await entryRepo.save(entryRepo.create({ localeId: trLocale.id, key, value }));
      }
      console.log(`Imported ${Object.keys(flat).length} i18n keys for tr`);
    }
  }

  for (const plan of [
    {
      tier: 'free',
      name: 'Ücretsiz',
      description: 'Temel özellikler',
      productId: null as string | null,
      priceLabel: 'Ücretsiz',
      features: ['Keşfet', 'Eşleşme', 'Sohbet'],
      superlikesWeeklyLimit: 0,
      removesAds: false,
      sortOrder: 0,
    },
    {
      tier: 'gold',
      name: 'Pati Gold',
      description: 'Reklamsız deneyim ve süper beğeniler',
      productId: 'pati_gold_monthly',
      priceLabel: 'Aylık',
      features: ['Reklamsız', 'Haftalık süper beğeni', 'Kimler beğendi'],
      superlikesWeeklyLimit: 3,
      removesAds: true,
      sortOrder: 1,
    },
  ]) {
    const existing = await planRepo.findOne({ where: { tier: plan.tier } });
    if (!existing) {
      await planRepo.save(planRepo.create({ ...plan, isActive: true }));
    }
  }

  let discoverPlacement = await placementRepo.findOne({ where: { key: 'discover' } });
  if (!discoverPlacement) {
    discoverPlacement = await placementRepo.save(
      placementRepo.create({
        key: 'discover',
        name: 'Keşfet banner',
        description: 'Keşfet ekranı alt reklamı',
        isActive: true,
      }),
    );
  }
  const creativeCount = await creativeRepo.count({
    where: { placementId: discoverPlacement.id },
  });
  if (creativeCount === 0) {
    await creativeRepo.save(
      creativeRepo.create({
        placementId: discoverPlacement.id,
        title: 'Pati Gold ile reklamsız gez',
        body: 'Haftalık süper beğeni ve sınırsız keşfet.',
        ctaLabel: 'Gold ol',
        ctaUrl: 'pawmatch://iap',
        sortOrder: 0,
        isActive: true,
      }),
    );
  }

  for (const s of [
    { key: 'maintenance_mode', value: 'false', description: 'Bakım modu' },
    { key: 'min_app_version', value: '1.0.0', description: 'Minimum mobil sürüm' },
    { key: 'web.heroTitle', value: 'PawMatch', description: 'Tanıtım sitesi kahraman başlığı' },
    {
      key: 'web.heroSubtitle',
      value: 'Tüylü dostun için eşleşme. Sahiplen veya oyun arkadaşı bul — swipe ile.',
      description: 'Tanıtım sitesi kahraman alt metni',
    },
    { key: 'web.appStoreUrl', value: '#', description: 'App Store indirme bağlantısı' },
    { key: 'web.playStoreUrl', value: '#', description: 'Google Play indirme bağlantısı' },
    { key: 'web.heroImage', value: '', description: 'Tanıtım sitesi kahraman görseli (S3 URL)' },
  ]) {
    const existing = await settingRepo.findOne({ where: { key: s.key } });
    if (!existing) await settingRepo.save(settingRepo.create(s));
  }

  const cmsRepo = AppDataSource.getRepository(CmsPage);
  const cmsPages = [
    {
      slug: 'hakkimizda',
      title: 'Hakkımızda',
      excerpt: 'PawMatch’in hikâyesi ve amacı.',
      seoDescription: 'PawMatch hakkında: pet eşleşmesi, sahiplenme ve oyun arkadaşı.',
      sortOrder: 10,
      body: `PawMatch, tüylü dostların yeni arkadaşlar ve yuvalar bulması için kurulmuş bir eşleşme uygulamasıdır.

## Neden varız?

Profil oluştur, yakındaki patileri keşfet, karşılıklı beğenince sohbet et. Sahiplenmek isteyenlerle barınakları; oyun arkadaşı arayanları da aynı çatı altında buluşturuyoruz.

## Ne yapıyoruz?

- Konuma göre keşif ve filtre
- Karşılıklı beğeni ile güvenli sohbet
- Barınak ilanları ve veteriner randevusu
- Moderasyon ve destek ekibi

Ekibimiz hayvan refahını merkeze alır. Güvenli sohbet, şeffaf ilanlar ve yerel veteriner bağlantıları ile patilerin hayatını kolaylaştırmayı hedefliyoruz.

## Nasıl başlarız?

Uygulamayı indir, petini ekle, kaydırmaya başla. Ücretsiz plan keşfet ve eşleşme için yeterlidir; Pati Gold tempo isteyenler içindir.`,
    },
    {
      slug: 'iletisim',
      title: 'İletişim',
      excerpt: 'Bize nasıl ulaşabileceğiniz.',
      seoDescription: 'PawMatch iletişim: e-posta ve adres bilgileri.',
      sortOrder: 20,
      body: `Sorularınız, iş birliği talepleriniz veya destek için bize yazın.

## İletişim kanalları

- E-posta: hello@pawmatch.com.tr
- Adres: Levent, Beşiktaş / İstanbul
- Destek: Uygulama içi Destek ekranından ticket açabilirsiniz

## Çalışma saatleri

Hafta içi 10:00–18:00 arasında yanıtlamaya çalışırız. Acil hayvan sağlığı için lütfen en yakın veteriner kliniğine başvurun; PawMatch tıbbi acil hat değildir.

## İş birliği

Barınak, klinik veya belediye iş birlikleri için aynı e-posta üzerinden “İş birliği” konu başlığı ile yazabilirsiniz.`,
    },
    {
      slug: 'gizlilik',
      title: 'Gizlilik politikası',
      excerpt: 'Kişisel verilerin nasıl işlendiği.',
      seoDescription: 'PawMatch gizlilik politikası ve kişisel veri işleme esasları.',
      sortOrder: 30,
      body: `PawMatch; hesap, pet profili, konum (keşif için) ve cihaz bildirim jetonu gibi verileri hizmeti sunmak amacıyla işler.

## Hangi veriler?

- Kimlik ve iletişim: ad, e-posta, telefon
- Pet profili ve fotoğraflar
- Yaklaşık konum (keşif yarıçapı)
- Cihaz bildirim jetonu

## Nasıl kullanırız?

Konum izni keşif yarıçapı için kullanılır. Fotoğraflar profil görselleri için saklanır. Veriler hesabınız silindiğinde veya talebiniz üzerine silinebilir.

## Üçüncü taraflar

Analitik veya reklam SDK’ları mağaza listesinde ayrıca belirtilir. Ayrıntılar için KVKK aydınlatma metnimize bakabilirsiniz.

## Haklarınız

Erişim, düzeltme, silme ve itiraz taleplerini hello@pawmatch.com.tr adresine iletebilirsiniz.`,
    },
    {
      slug: 'kullanim-kosullari',
      title: 'Kullanım koşulları',
      excerpt: 'Hizmeti kullanırken geçerli kurallar.',
      seoDescription: 'PawMatch kullanım koşulları.',
      sortOrder: 40,
      body: `PawMatch, pet sahipleri arasında eşleşme ve iletişim sağlar. Kullanıcılar doğru bilgi vermek, diğer kullanıcılara saygılı olmak ve yasadışı içerik paylaşmamakla yükümlüdür.

## Hesap ve içerik

Yanıltıcı ilan, saldırgan mesaj veya hayvan refahına aykırı davranış hesap askısına yol açabilir.

## Abonelik

Pati Gold aboneliği uygulama içi satın alma ile yönetilir. İptal ve iade mağaza kurallarına tabidir.

## Sorumluluk

Hizmet “olduğu gibi” sunulur. Kullanıcılar buluşmaları kendi sorumluluklarında planlar. Uygulamayı kullanarak bu koşulları kabul etmiş sayılırsınız.`,
    },
    {
      slug: 'kvkk',
      title: 'KVKK aydınlatma metni',
      excerpt: '6698 sayılı Kanun kapsamında bilgilendirme.',
      seoDescription: 'PawMatch KVKK aydınlatma metni.',
      sortOrder: 50,
      body: `6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca veri sorumlusu PawMatch’tir.

## İşlenen veriler

- Kimlik (ad, e-posta)
- İletişim ve konum (keşif)
- Pet profilleri
- Kullanım kayıtları

## Amaç

Hesap yönetimi, eşleşme, bildirim ve yasal yükümlülükler.

## Haklarınız

Bilgi talep etme, düzeltme, silme ve itiraz. Taleplerinizi hello@pawmatch.com.tr adresine iletebilirsiniz.

## Saklama

Hesap aktifken veriler hizmet için tutulur. Silme talebinden sonra yasal zorunluluklar saklı kalmak kaydıyla silinir veya anonimleştirilir.`,
    },
    {
      slug: 'cerez-politikasi',
      title: 'Çerez politikası',
      excerpt: 'Sitede kullanılan çerezler.',
      seoDescription: 'PawMatch çerez politikası.',
      sortOrder: 60,
      body: `Tanıtım sitemiz oturum ve tercih çerezleri kullanabilir. Zorunlu çerezler sitenin çalışması içindir.

## Çerez türleri

- Zorunlu: oturum ve güvenlik
- Tercih: dil veya benzeri seçimler
- Analitik: performans ölçümü (kullanılırsa)

## Mobil uygulama

Mobil uygulama çerez değil, cihaz bildirim jetonu kullanır. Tarayıcı ayarlarınızdan analitik çerezleri reddedebilirsiniz.

## Güncelleme

Bu metin değişirse sitede yayın tarihi güncellenir.`,
    },
  ];
  for (const page of cmsPages) {
    const existing = await cmsRepo.findOne({ where: { slug: page.slug } });
    if (!existing) {
      await cmsRepo.save(cmsRepo.create({ ...page, isPublished: true }));
    } else if ((existing.body?.length ?? 0) < 600) {
      existing.title = page.title;
      existing.excerpt = page.excerpt;
      existing.body = page.body;
      existing.seoDescription = page.seoDescription;
      await cmsRepo.save(existing);
    }
  }

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `user${i + 1}@pawmatch.com.tr`;
    const phone = `+90555${String(i + 1).padStart(7, '0')}`;

    let user = await userRepo.findOne({ where: { email } });

    if (!user) {
      user = userRepo.create({
        email,
        password: hashedPassword123,
        phone,
        firstName,
        lastName,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      });
      user = await userRepo.save(user);

      const profile = profileRepo.create({
        userId: user.id,
        bio: `Pet lover from ${cities[Math.floor(Math.random() * cities.length)]}`,
        avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
        dateOfBirth: new Date(
          1990 + Math.floor(Math.random() * 30),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28),
        ),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
      });
      await profileRepo.save(profile);

      const location = locationRepo.create({
        userId: user.id,
        latitude: 41.0082 + (Math.random() - 0.5) * 0.1,
        longitude: 28.9784 + (Math.random() - 0.5) * 0.1,
        city: cities[Math.floor(Math.random() * cities.length)],
        district: districts[Math.floor(Math.random() * districts.length)],
        isCurrent: true,
      });
      await locationRepo.save(location);
    } else {
      // Ensure demo password works and there is at least a profile/location.
      user.password = hashedPassword123;
      await userRepo.save(user);

      let profile = await profileRepo.findOne({ where: { userId: user.id } });
      if (!profile) {
        profile = profileRepo.create({
          userId: user.id,
          bio: `Pet lover from ${cities[Math.floor(Math.random() * cities.length)]}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
          dateOfBirth: new Date(
            1990 + Math.floor(Math.random() * 30),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28),
          ),
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        });
        await profileRepo.save(profile);
      }

      let location = await locationRepo.findOne({ where: { userId: user.id, isCurrent: true } });
      if (!location) {
        location = locationRepo.create({
          userId: user.id,
          latitude: 41.0082 + (Math.random() - 0.5) * 0.1,
          longitude: 28.9784 + (Math.random() - 0.5) * 0.1,
          city: cities[Math.floor(Math.random() * cities.length)],
          district: districts[Math.floor(Math.random() * districts.length)],
          isCurrent: true,
        });
        await locationRepo.save(location);
      }
    }

    users.push(user);
  }

  // Create pets
  console.log('Creating pets...');
  const pets = [];
  for (let i = 0; i < 100; i++) {
    const owner = users[Math.floor(Math.random() * users.length)];
    const species = i % 3 === 0 ? 'cat' : 'dog';
    const breedList = breeds[species];
    const breed = breedList[Math.floor(Math.random() * breedList.length)];
    const name = petNames[Math.floor(Math.random() * petNames.length)];

    const pet = petRepo.create({
      ownerId: owner.id,
      name,
      species: species === 'cat' ? PetSpecies.CAT : PetSpecies.DOG,
      breed,
      age: Math.floor(Math.random() * 15) + 1,
      gender: Math.random() > 0.5 ? PetGender.MALE : PetGender.FEMALE,
      bio: `Very friendly ${breed.toLowerCase()}. Loves to play and cuddle!`,
      isSpayed: Math.random() > 0.3,
      isVaccinated: Math.random() > 0.2,
      isActive: true,
      isAdopted: false,
    });
    const savedPet = await petRepo.save(pet);

    // Add photos
    const photoCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < photoCount; j++) {
      const photo = photoRepo.create({
        petId: savedPet.id,
        url: `https://picsum.photos/400/600?random=${i * 10 + j}`,
        isMain: j === 0,
        order: j,
      });
      await photoRepo.save(photo);
    }

    // Add temperaments
    const petTemperaments = temperamentEntities.slice(0, Math.floor(Math.random() * 3) + 1);
    savedPet.temperaments = petTemperaments;
    await petRepo.save(savedPet);

    pets.push(savedPet);
  }

  // Demo giriş hesabının keşfet/beğeni akışı için en az bir aktif pet'i garanti et
  const targetPetCount = await petRepo.count({ where: { ownerId: targetUser.id } });
  if (targetPetCount === 0) {
    const demoPet = petRepo.create({
      ownerId: targetUser.id,
      name: 'Pati',
      species: PetSpecies.DOG,
      breed: 'Golden Retriever',
      age: 3,
      gender: PetGender.MALE,
      bio: 'Demo profil — keşfet ve eşleşme için oluşturuldu.',
      isSpayed: true,
      isVaccinated: true,
      isActive: true,
      isAdopted: false,
    });
    const savedDemoPet = await petRepo.save(demoPet);
    const demoPhoto = photoRepo.create({
      petId: savedDemoPet.id,
      url: 'https://picsum.photos/400/600?random=demo-pati',
      isMain: true,
      order: 0,
    });
    await photoRepo.save(demoPhoto);
    savedDemoPet.temperaments = temperamentEntities.slice(0, 1);
    await petRepo.save(savedDemoPet);
    pets.push(savedDemoPet);
    console.log('Added demo pet for target user (was missing).');
  }

  // Create matches and likes
  console.log('Creating matches...');
  const matches = [];
  for (let i = 0; i < 30; i++) {
    const pet1 = pets[Math.floor(Math.random() * pets.length)];
    let pet2 = pets[Math.floor(Math.random() * pets.length)];
    while (pet2.id === pet1.id || pet2.ownerId === pet1.ownerId) {
      pet2 = pets[Math.floor(Math.random() * pets.length)];
    }

    // Create mutual likes
    const like1 = likeRepo.create({
      likerPetId: pet1.id,
      likedPetId: pet2.id,
    });
    await likeRepo.save(like1);

    const like2 = likeRepo.create({
      likerPetId: pet2.id,
      likedPetId: pet1.id,
    });
    await likeRepo.save(like2);

    // Create match
    const match = matchRepo.create({
      pet1Id: pet1.id,
      pet2Id: pet2.id,
      matchedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    const savedMatch = await matchRepo.save(match);

    // Create conversation
    const conversation = conversationRepo.create({
      matchId: savedMatch.id,
      pet1Id: pet1.id,
      pet2Id: pet2.id,
      lastMessageAt: new Date(),
      isActive: true,
    });
    const savedConversation = await conversationRepo.save(conversation);

    // Create messages
    const messageCount = Math.floor(Math.random() * 10) + 1;
    for (let j = 0; j < messageCount; j++) {
      const sender = j % 2 === 0 ? pet1.ownerId : pet2.ownerId;
      const messages = [
        'Merhaba!',
        'Nasılsın?',
        'Çok sevimli görünüyorsun!',
        'Buluşalım mı?',
        'Tabii ki!',
        'Harika!',
      ];
      const message = messageRepo.create({
        conversationId: savedConversation.id,
        senderId: sender,
        content: messages[j % messages.length],
        isRead: j < messageCount - 1,
      });
      await messageRepo.save(message);
    }

    matches.push(savedMatch);
  }

  // Create notifications
  console.log('Creating notifications...');
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const types = ['match', 'message', 'like'];
    const type = types[Math.floor(Math.random() * types.length)];

    const notification = notificationRepo.create({
      userId: user.id,
      type,
      title: type === 'match' ? 'Yeni Eşleşme!' : type === 'message' ? 'Yeni Mesaj' : 'Yeni Beğeni',
      body: type === 'match' ? 'Yeni bir eşleşmeniz var!' : type === 'message' ? 'Size yeni bir mesaj geldi' : 'Profiliniz beğenildi',
      isRead: Math.random() > 0.5,
    });
    await notificationRepo.save(notification);
  }

  // Create veterinarians
  console.log('Creating veterinarians...');
  const veterinarians = [];
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const vet = vetRepo.create({
      userId: user.id,
      licenseNumber: `VET-${String(i + 1).padStart(6, '0')}`,
      specialization: ['General', 'Surgery', 'Dermatology', 'Cardiology'][Math.floor(Math.random() * 4)],
      experienceYears: Math.floor(Math.random() * 20) + 5,
      bio: 'Experienced veterinarian with a passion for animal care.',
      isVerified: true,
      isActive: true,
    });
    const savedVet = await vetRepo.save(vet);

    const clinic = clinicRepo.create({
      veterinarianId: savedVet.id,
      name: `${user.firstName} ${user.lastName} Veterinary Clinic`,
      address: `${districts[Math.floor(Math.random() * districts.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
      latitude: 41.0082 + (Math.random() - 0.5) * 0.1,
      longitude: 28.9784 + (Math.random() - 0.5) * 0.1,
      city: cities[Math.floor(Math.random() * cities.length)],
      district: districts[Math.floor(Math.random() * districts.length)],
      phone: `+90555${String(i + 100).padStart(7, '0')}`,
      email: `clinic${i + 1}@vet.com`,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 100),
      isActive: true,
    });
    const savedClinic = await clinicRepo.save(clinic);

    // Create services
    const services = ['General Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Emergency'];
    for (const serviceName of services) {
      const service = serviceRepo.create({
        clinicId: savedClinic.id,
        name: serviceName,
        description: `${serviceName} service`,
        price: Math.floor(Math.random() * 500) + 100,
        duration: Math.floor(Math.random() * 60) + 30,
        isActive: true,
      });
      await serviceRepo.save(service);
    }

    veterinarians.push(savedVet);
  }

  // Create appointments
  console.log('Creating appointments...');
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const userPets = pets.filter((p) => p.ownerId === user.id);
    if (userPets.length === 0) continue;

    const pet = userPets[Math.floor(Math.random() * userPets.length)];
    const clinic = await clinicRepo.findOne({
      where: { isActive: true },
    });
    if (!clinic) continue;

    const statuses = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED];
    const appointment = appointmentRepo.create({
      clinicId: clinic.id,
      petId: pet.id,
      userId: user.id,
      appointmentDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: 'Regular checkup',
    });
    await appointmentRepo.save(appointment);
  }

  console.log('Seeding completed!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

