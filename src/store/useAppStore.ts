import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RouletteItemState = {
  id: string;
  name: string;
  fixedProbability: number | null;
  actualProb?: number;
};

export type RouletteState = {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  items: RouletteItemState[];
};

interface AppStore {
  // 用户认证状态
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;

  // 转盘数据
  roulettes: RouletteState[];
  setRoulettes: (roulettes: RouletteState[]) => void;
  activeRouletteId: string | null;
  setActiveRouletteId: (id: string) => void;
  updateRoulette: (id: string, updated: Partial<RouletteState>) => void;
}

// 默认转盘数据
const defaultRoulettes: RouletteState[] = [
  {
    id: "default-1",
    name: "今天吃什么",
    type: "NONE",
    isDefault: true,
    items: [
      { id: "1", name: "火锅", fixedProbability: null },
      { id: "2", name: "烧烤", fixedProbability: null },
      { id: "3", name: "日料", fixedProbability: null },
      { id: "4", name: "川菜", fixedProbability: null },
      { id: "5", name: "粤菜", fixedProbability: null },
      { id: "6", name: "快餐", fixedProbability: null },
    ],
  },
  {
    id: "default-2",
    name: "早餐选择",
    type: "BREAKFAST",
    isDefault: true,
    items: [
      { id: "1", name: "豆浆油条", fixedProbability: null },
      { id: "2", name: "包子", fixedProbability: null },
      { id: "3", name: "粥", fixedProbability: null },
      { id: "4", name: "三明治", fixedProbability: null },
    ],
  },
];

// 设置 cookie 的辅助函数
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // 用户认证
      isAuthenticated: false,
      username: null,
      login: (username) => {
        setCookie("auth_token", username, 7);
        set({ isAuthenticated: true, username });
      },
      logout: () => {
        removeCookie("auth_token");
        set({ isAuthenticated: false, username: null });
      },

      // 转盘数据
      roulettes: defaultRoulettes,
      setRoulettes: (roulettes) => set({ roulettes }),
      activeRouletteId: defaultRoulettes[0]?.id || null,
      setActiveRouletteId: (id) => set({ activeRouletteId: id }),
      updateRoulette: (id, updated) =>
        set((state) => ({
          roulettes: state.roulettes.map((r) =>
            r.id === id ? { ...r, ...updated } : r
          ),
        })),
    }),
    {
      name: "what-to-eat-store",
      partialize: (state) => ({
        roulettes: state.roulettes,
        activeRouletteId: state.activeRouletteId,
        isAuthenticated: state.isAuthenticated,
        username: state.username,
      }),
    }
  )
);
