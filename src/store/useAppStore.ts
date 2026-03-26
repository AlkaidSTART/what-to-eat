import { create } from "zustand";

export type RouletteItemState = {
  id: string;
  name: string;
  fixedProbability: number | null;
  actualProb?: number; // 计算后的概率
};

export type RouletteState = {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  items: RouletteItemState[];
};

interface AppStore {
  roulettes: RouletteState[];
  setRoulettes: (roulettes: RouletteState[]) => void;
  activeRouletteId: string | null;
  setActiveRouletteId: (id: string) => void;
  updateRoulette: (id: string, updated: Partial<RouletteState>) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  roulettes: [],
  setRoulettes: (roulettes) => set({ roulettes }),
  activeRouletteId: null,
  setActiveRouletteId: (id) => set({ activeRouletteId: id }),
  updateRoulette: (id, updated) => 
    set((state) => ({
      roulettes: state.roulettes.map(r => r.id === id ? { ...r, ...updated } : r)
    }))
}));
