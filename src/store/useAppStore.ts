import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  user1Name: string;
  user2Name: string;
  isOnboarded: boolean;
  activeUser: 'user1' | 'user2';
  setNames: (user1: string, user2: string) => void;
  setOnboarded: () => void;
  setActiveUser: (user: 'user1' | 'user2') => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user1Name: 'あなた',
      user2Name: 'パートナー',
      isOnboarded: false,
      activeUser: 'user1',
      setNames: (user1, user2) => set({ user1Name: user1, user2Name: user2 }),
      setOnboarded: () => set({ isOnboarded: true }),
      setActiveUser: (user) => set({ activeUser: user }),
    }),
    { name: 'app-store' }
  )
);
