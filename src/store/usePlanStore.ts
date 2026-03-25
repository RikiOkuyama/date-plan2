import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanCondition, SwipeResult, MatchedSpot, DatePlan, Spot, PlanScheduleItem } from '../types';
import { getSpotsByArea } from '../data/mockSpots';
import { generateDatePlan } from '../utils/aiPlanGenerator';

interface PlanStore {
  condition: PlanCondition | null;
  availableSpots: Spot[];
  swipeResults: SwipeResult[];
  currentPlan: DatePlan | null;
  savedPlans: DatePlan[];
  isGenerating: boolean;

  setCondition: (condition: PlanCondition) => void;
  loadSpots: (area: string) => void;
  addSwipeResult: (result: SwipeResult) => void;
  generatePlan: () => Promise<void>;
  setCurrentPlan: (plan: DatePlan) => void;
  updateSchedule: (schedule: PlanScheduleItem[], aiSummary?: string) => void;
  updateMissionCompleted: (missionId: string, photoUrl?: string) => void;
  resetPlanFlow: () => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      condition: null,
      availableSpots: [],
      swipeResults: [],
      currentPlan: null,
      savedPlans: [],
      isGenerating: false,

      setCondition: (condition) => {
        set({ condition });
        get().loadSpots(condition.area);
      },

      loadSpots: (area) => {
        set({ availableSpots: getSpotsByArea(area) });
      },

      addSwipeResult: (result) => {
        set(state => ({ swipeResults: [...state.swipeResults, result] }));
      },

      generatePlan: async () => {
        const { condition, swipeResults, availableSpots } = get();
        if (!condition) return;

        set({ isGenerating: true });

        const user1Results = swipeResults.filter(r => r.userId === 'user1');
        const user2Results = swipeResults.filter(r => r.userId === 'user2');

        const matchedSpots: MatchedSpot[] = [];

        for (const spotId of new Set(swipeResults.map(r => r.spotId))) {
          const u1 = user1Results.find(r => r.spotId === spotId);
          const u2 = user2Results.find(r => r.spotId === spotId);

          if (!u1 || !u2) continue;
          if (u1.direction === 'left' || u2.direction === 'left') continue;

          const spot = availableSpots.find(s => s.id === spotId);
          if (!spot) continue;

          const priority = (u1.direction === 'up' || u2.direction === 'up') ? 'high' : 'normal';
          matchedSpots.push({ spot, priority });
        }

        if (matchedSpots.length === 0 && availableSpots.length > 0) {
          const fallback = availableSpots.slice(0, 3).map(spot => ({ spot, priority: 'normal' as const }));
          matchedSpots.push(...fallback);
        }

        try {
          const plan = await generateDatePlan(condition, matchedSpots);
          set(state => ({
            currentPlan: plan,
            savedPlans: [plan, ...state.savedPlans],
            isGenerating: false,
          }));
        } catch {
          set({ isGenerating: false });
        }
      },

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      updateSchedule: (schedule, aiSummary) => {
        set(state => {
          if (!state.currentPlan) return state;
          const updatedPlan = {
            ...state.currentPlan,
            schedule,
            ...(aiSummary ? { aiSummary } : {}),
          };
          return {
            currentPlan: updatedPlan,
            savedPlans: state.savedPlans.map(p =>
              p.id === updatedPlan.id ? updatedPlan : p
            ),
          };
        });
      },

      updateMissionCompleted: (missionId, photoUrl) => {
        set(state => {
          if (!state.currentPlan) return state;
          return {
            currentPlan: {
              ...state.currentPlan,
              missions: state.currentPlan.missions.map(m =>
                m.id === missionId ? { ...m, completed: true, photoUrl } : m
              ),
            },
          };
        });
      },

      resetPlanFlow: () => {
        set({ condition: null, availableSpots: [], swipeResults: [], currentPlan: null });
      },
    }),
    {
      name: 'date-plan-storage',
      partialize: (state) => ({ savedPlans: state.savedPlans }),
    }
  )
);
