import { Match } from '@/domain/entities/Match';

export interface IMatchRepository {
  getMatches(): Promise<Match[]>;
}
