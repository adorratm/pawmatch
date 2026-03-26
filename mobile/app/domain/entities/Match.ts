import { Pet } from '@/domain/entities/Pet';

export class Match {
  constructor(
    public readonly id: number,
    public readonly pet1Id: number,
    public readonly pet2Id: number,
    public readonly matchedAt: Date,
    public readonly pet?: Pet, // The matched pet
    public readonly conversationId?: number,
  ) { }

  static fromJSON(json: any): Match {
    return new Match(
      json.id,
      json.pet1Id,
      json.pet2Id,
      new Date(json.matchedAt),
      json.pet ? Pet.fromJSON(json.pet) : undefined,
      json.conversationId,
    );
  }
}
