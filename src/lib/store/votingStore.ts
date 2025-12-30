import { create } from 'zustand';
import { VotingSession, VoterVerification } from '@/lib/types';

interface VotingState {
  session: VotingSession | null;
  verification: VoterVerification | null;
  selectedCandidates: Map<number, number>; // positionId -> candidateId
  isVerifying: boolean;
  isVoting: boolean;

  // Actions
  setSession: (session: VotingSession | null) => void;
  setVerification: (verification: VoterVerification | null) => void;
  selectCandidate: (positionId: number, candidateId: number) => void;
  clearSelection: (positionId: number) => void;
  clearAllSelections: () => void;
  resetVoting: () => void;
}

export const useVotingStore = create<VotingState>((set) => ({
  session: null,
  verification: null,
  selectedCandidates: new Map(),
  isVerifying: false,
  isVoting: false,

  setSession: (session) => set({ session }),

  setVerification: (verification) => set({ verification }),

  selectCandidate: (positionId, candidateId) =>
    set((state) => {
      const newSelections = new Map(state.selectedCandidates);
      newSelections.set(positionId, candidateId);
      return { selectedCandidates: newSelections };
    }),

  clearSelection: (positionId) =>
    set((state) => {
      const newSelections = new Map(state.selectedCandidates);
      newSelections.delete(positionId);
      return { selectedCandidates: newSelections };
    }),

  clearAllSelections: () => set({ selectedCandidates: new Map() }),

  resetVoting: () =>
    set({
      session: null,
      verification: null,
      selectedCandidates: new Map(),
      isVerifying: false,
      isVoting: false,
    }),
}));