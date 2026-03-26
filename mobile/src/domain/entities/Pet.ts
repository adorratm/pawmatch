export interface PetPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface PetTemperament {
  id: number;
  name: string;
  emoji?: string;
}

export class Pet {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: string, // 'dog', 'cat', etc.
    public readonly breed: string,
    public readonly age: number,
    public readonly gender: 'male' | 'female',
    public readonly bio: string,
    public readonly weight?: number,
    public readonly isVaccinated: boolean = false,
    public readonly isSpayed: boolean = false,
    public readonly energyLevel?: string, // 'Low', 'Medium', 'High'
    public readonly photos: PetPhoto[] = [],
    public readonly temperaments: PetTemperament[] = [],
    public readonly ownerId?: number,
    public readonly distance?: string,
    public readonly locationName?: string,
  ) {}

  static fromJSON(json: any): Pet {
    return new Pet(
      json.id,
      json.name,
      json.type,
      json.breed,
      json.age,
      json.gender,
      json.bio,
      json.weight,
      json.isVaccinated,
      json.isSpayed,
      json.energyLevel,
      json.photos || [],
      json.temperaments || [],
      json.ownerId,
      json.distance,
      json.locationName,
    );
  }
}
