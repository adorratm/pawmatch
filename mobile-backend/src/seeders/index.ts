import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { UserLocation } from '../database/entities/user-location.entity';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { PetTemperament } from '../database/entities/pet-temperament.entity';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { Notification } from '../database/entities/notification.entity';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { VeterinarianService } from '../database/entities/veterinarian-service.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { Gender } from '../database/entities/user-profile.entity';
import { PetSpecies, PetGender } from '../database/entities/pet.entity';
import { AppointmentStatus } from '../database/entities/appointment.entity';
import * as bcrypt from 'bcrypt';

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
    Pet,
    PetPhoto,
    Temperament,
    PetTemperament,
    Match,
    MatchLike,
    Conversation,
    Message,
    Notification,
    Veterinarian,
    VeterinarianClinic,
    VeterinarianService,
    Appointment,
  ],
  synchronize: false,
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
  const hashedPasswordTarget = await bcrypt.hash('password123', 10);

  // Ensure the provided demo email can always login.
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

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `user${i + 1}@pawmatch.com`;
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

