import { create } from 'zustand';
import { matchesService } from '../services/matches.service';

interface Match {
  id: number;
  pet: {
    id: number;
    name: string;
    photos?: any[];
  };
  matchedAt: string;
  conversationId?: number;
}

interface MatchState {
  matches: Match[];
  newMatches: Match[];
  loading: boolean;
  loadMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  newMatches: [],
  loading: false,

  loadMatches: async () => {
    set({ loading: true });
    try {
      const data = await matchesService.getMatches();
      const allMatches = data.matches || [];
      const newMatches = allMatches.filter((m: Match) => {
        const matchDate = new Date(m.matchedAt);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return matchDate > dayAgo;
      });
      set({ matches: allMatches, newMatches, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));


