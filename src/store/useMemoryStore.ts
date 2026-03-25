import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Memory } from '../types';
import { mockMemories } from '../data/mockMemories';

interface MemoryStore {
  memories: Memory[];
  addMemory: (memory: Memory) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  getMemoryBySpot: (spotId: string) => Memory | undefined;
  getPrefectureCount: () => Record<string, number>;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: mockMemories,

      addMemory: (memory) => {
        set(state => ({ memories: [memory, ...state.memories] }));
      },

      updateMemory: (id, updates) => {
        set(state => ({
          memories: state.memories.map(m => m.id === id ? { ...m, ...updates } : m),
        }));
      },

      getMemoryBySpot: (spotId) => {
        return get().memories.find(m => m.spotId === spotId);
      },

      getPrefectureCount: () => {
        const counts: Record<string, number> = {};
        get().memories.forEach(m => {
          const pref = m.spot.prefecture;
          counts[pref] = (counts[pref] || 0) + 1;
        });
        return counts;
      },
    }),
    { name: 'memory-storage' }
  )
);
