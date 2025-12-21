import { Pet, User, Match, Conversation, PetPhoto } from '../types';

// Fake pet photos
const petPhotos: { [key: string]: string[] } = {
  barney: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    'https://images.unsplash.com/photo-1534361960057-19889dbdf1bb?w=800',
  ],
  luna: [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
    'https://images.unsplash.com/photo-1517849845537-4d58cd0e669e?w=800',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
  ],
  max: [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    'https://images.unsplash.com/photo-1601758227534-35f812db2f97?w=800',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
  ],
  charlie: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    'https://images.unsplash.com/photo-1583336663277-620dc1996580?w=800',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
  ],
  bella: [
    'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
  ],
  rocky: [
    'https://images.unsplash.com/photo-1534361960057-19889dbdf1bb?w=800',
    'https://images.unsplash.com/photo-1583336663277-620dc1996580?w=800',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
  ],
};

function createPetPhotos(urls: string[]): PetPhoto[] {
  return urls.map((url, index) => ({
    id: `photo-${Math.random().toString(36).substr(2, 9)}`,
    url,
    isMain: index === 0,
    order: index,
  }));
}

export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Barney',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'male',
    bio: 'Çok oyuncu ve enerjik bir köpek. Parkta oynamayı çok sever!',
    photos: createPetPhotos(petPhotos.barney),
    temperaments: [
      { id: '1', name: 'Playful' },
      { id: '2', name: 'Energetic' },
    ],
    isSpayed: true,
    isVaccinated: true,
    distance: 2.0,
    matchScore: 98,
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age: 3,
    gender: 'female',
    bio: 'Sakin ve sevgi dolu bir kedi. Kucakta oturmayı çok sever.',
    photos: createPetPhotos(petPhotos.luna),
    temperaments: [
      { id: '3', name: 'Calm' },
      { id: '4', name: 'Cuddly' },
    ],
    isSpayed: true,
    isVaccinated: true,
    distance: 1.5,
    matchScore: 87,
  },
  {
    id: '3',
    name: 'Max',
    species: 'dog',
    breed: 'Labrador',
    age: 4,
    gender: 'male',
    bio: 'Sosyal ve arkadaş canlısı. Diğer köpeklerle oynamayı sever.',
    photos: createPetPhotos(petPhotos.max),
    temperaments: [
      { id: '1', name: 'Playful' },
      { id: '5', name: 'Social' },
    ],
    isSpayed: true,
    isVaccinated: true,
    distance: 3.2,
    matchScore: 92,
  },
  {
    id: '4',
    name: 'Charlie',
    species: 'dog',
    breed: 'Beagle',
    age: 1,
    gender: 'male',
    bio: 'Yavru ve çok meraklı. Yeni şeyler keşfetmeyi sever.',
    photos: createPetPhotos(petPhotos.charlie),
    temperaments: [
      { id: '1', name: 'Playful' },
      { id: '6', name: 'Curious' },
    ],
    isSpayed: false,
    isVaccinated: true,
    distance: 4.5,
    matchScore: 85,
  },
  {
    id: '5',
    name: 'Bella',
    species: 'dog',
    breed: 'French Bulldog',
    age: 2,
    gender: 'female',
    bio: 'Küçük ama cesur. Evde rahat, dışarıda maceracı.',
    photos: createPetPhotos(petPhotos.bella),
    temperaments: [
      { id: '3', name: 'Calm' },
      { id: '4', name: 'Cuddly' },
    ],
    isSpayed: true,
    isVaccinated: true,
    distance: 2.8,
    matchScore: 90,
  },
  {
    id: '6',
    name: 'Rocky',
    species: 'dog',
    breed: 'German Shepherd',
    age: 5,
    gender: 'male',
    bio: 'Sadık ve koruyucu. Aile ile vakit geçirmeyi sever.',
    photos: createPetPhotos(petPhotos.rocky),
    temperaments: [
      { id: '7', name: 'Loyal' },
      { id: '3', name: 'Calm' },
    ],
    isSpayed: true,
    isVaccinated: true,
    distance: 5.1,
    matchScore: 88,
  },
];

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Emre',
  lastName: 'Yılmaz',
  phone: '+90 555 123 4567',
  profile: {
    id: 'profile-1',
    bio: 'Hayvan sever bir insan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  location: {
    id: 'loc-1',
    latitude: 41.0082,
    longitude: 28.9784,
    city: 'İstanbul',
    district: 'Kadıköy',
  },
};

export const mockMatches: Match[] = [
  {
    id: 'match-1',
    pet: mockPets[0],
    matchedAt: new Date().toISOString(),
    conversationId: 'conv-1',
  },
  {
    id: 'match-2',
    pet: mockPets[1],
    matchedAt: new Date(Date.now() - 86400000).toISOString(),
    conversationId: 'conv-2',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    pet: mockPets[0],
    lastMessage: {
      content: 'Merhaba! Barney ile tanışmak ister misin?',
      sentAt: new Date().toISOString(),
    },
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    pet: mockPets[1],
    lastMessage: {
      content: 'Luna çok tatlı! 🐱',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
    },
    unreadCount: 0,
  },
];

// Helper function to get random pet
export function getRandomPet(): Pet {
  return mockPets[Math.floor(Math.random() * mockPets.length)];
}

// Helper function to get pets with match scores
export function getPetsWithMatches(): Pet[] {
  return mockPets.map((pet) => ({
    ...pet,
    matchScore: Math.floor(Math.random() * 20) + 80, // 80-100 arası
  }));
}

