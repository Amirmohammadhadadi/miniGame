import { create } from 'zustand';

export type TabType = 'home' | 'mines' | 'crash' | 'history';

export interface UserProfile {
  telegramId: string;
  firstName: string;
  username: string;
  photoUrl?: string;
  balance: number;
  totalGames: number;
  totalWins: number;
  totalProfit: number;
  bestMultiplier: number;
}

interface GameState {
  user: UserProfile | null;
  activeTab: TabType;
  isLoadingUser: boolean;
  
  // توابع تغییر وضعیت
  setUser: (user: UserProfile) => void;
  updateBalance: (newBalance: number) => void;
  setActiveTab: (tab: TabType) => void;
  setLoadingUser: (loading: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  activeTab: 'home',
  isLoadingUser: true,

  setUser: (user) => set({ user, isLoadingUser: false }),
  
  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null,
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setLoadingUser: (loading) => set({ isLoadingUser: loading }),
}));