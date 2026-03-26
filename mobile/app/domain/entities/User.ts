export interface UserProfile {
  id: number;
  bio?: string;
  photoUrl?: string;
  birthDate?: string;
}

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly profile?: UserProfile,
    public readonly isVerified: boolean = false,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  static fromJSON(json: any): User {
    return new User(
      json.id,
      json.email,
      json.firstName,
      json.lastName,
      json.profile,
      json.isVerified,
    );
  }
}
