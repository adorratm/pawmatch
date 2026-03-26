import { IMatchRepository } from '@/domain/repositories/IMatchRepository';
import { Match } from '@/domain/entities/Match';
import api from '@/infrastructure/api/api';

export class ApiMatchRepository implements IMatchRepository {
  async getMatches(): Promise<Match[]> {
    const response = await api.get('/matches');
    const matches = response.data.matches || [];
    return matches.map((json: any) => Match.fromJSON(json));
  }
}

export const matchRepository = new ApiMatchRepository();
