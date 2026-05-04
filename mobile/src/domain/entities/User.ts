export interface UserProfile {
  id: number;
  bio?: string;
  photoUrl?: string;
  avatar?: string;
  birthDate?: string;
  preferences?: Record<string, unknown>;
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
    let profile = json.profile;
    if (profile && typeof profile === 'object') {
      profile = {
        ...profile,
        photoUrl: profile.photoUrl ?? profile.avatar,
      };
    }
    return new User(
      json.id,
      json.email,
      json.firstName,
      json.lastName,
      profile,
      json.isVerified,
    );
  }
}
