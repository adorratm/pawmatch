export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profile?: UserProfile;
  location?: UserLocation;
}

export interface UserProfile {
  id: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UserLocation {
  id: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  address?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: number;
  gender?: 'male' | 'female';
  bio?: string;
  photos: PetPhoto[];
  temperaments?: Temperament[];
  isSpayed: boolean;
  isVaccinated: boolean;
  owner?: User;
  distance?: number;
  matchScore?: number;
}

export interface PetPhoto {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Temperament {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  pet: Pet;
  matchedAt: string;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  pet: Pet;
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sentAt: string;
  isRead: boolean;
}


