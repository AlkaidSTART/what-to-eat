"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import GSAPRoulette from "@/components/GSAPRoulette";

// 高级简约配色方案 - 莫兰迪色系
const COLORS = [
  "#8B9A8B", // 灰绿色
  "#A5A58D", // 灰褐色
  "#B7B7A4", // 浅灰绿
  "#CB997E", // 暖灰棕
  "#DDBEA9", // 米色
  "#A8A6A1", // 灰米色
  "#9B9B7A", // 橄榄灰
  "#C9C9B6", // 浅橄榄
];

export default function HomePage() {
  const { roulettes } = useAppStore();
  const [activeRouletteId, setActiveRouletteId] = useState(
    roulettes[0]?.id ?? null
  );

  // 计算概率
  const processedRoulettes = useMemo(() => {
    return roulettes.map((roulette) => {
      const items = roulette.items;
      let fixedSum = 0;
      let autoCount = 0;

      items.forEach((item) => {
        if (item.fixedProbability !== null) {
          fixedSum += item.fixedProbability;
        } else {
          autoCount++;
        }
      });

      const remainingProb = Math.max(0, 100 - fixedSum);
      const autoProb = autoCount > 0 ? remainingProb / autoCount : 0;

      const processedItems = items.map((item, index) => ({
        id: item.id,
        name: item.name,
        probability:
          item.fixedProbability !== null ? item.fixedProbability : autoProb,
        color: COLORS[index % COLORS.length],
      }));

      return {
        ...roulette,
        processedItems,
      };
    });
  }, [roulettes]);

  // Animation for page enter
  useEffect(() => {
    const gsap = require("gsap").default;
    gsap.fromTo(
      ".page-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }
    );
  }, []);

  const activeRoulette = processedRoulettes.find(
    (r) => r.id === activeRouletteId
  );

  return (
    <div className="min-h-full p-6 pb-12 flex flex-col items-center">
      {/* 顶部标题区 */}
      <div className="w-full max-w-md page-content mt-8 mb-10 text-center">
        <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
          命运转盘
        </h1>
        <p className="text-sm text-gray-500">将选择交给上天，让这顿饭不再纠结</p>
      </div>

      {/* 转盘选择区 (可横向滑动) */}
      <div className="w-full max-w-md page-content mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-2 pb-4">
          {roulettes.map((r) => {
            const isActive = r.id === activeRouletteId;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRouletteId(r.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white shadow-md scale-105"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                }`}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 转盘组件 */}
      <div className="w-full max-w-md page-content flex-1 flex flex-col justify-center">
        {activeRoulette && activeRoulette.processedItems.length > 0 ? (
          <GSAPRoulette items={activeRoulette.processedItems} />
        ) : (
          <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <p>暂无选项，请先去配置菜单</p>
          </div>
        )}
      </div>
    </div>
  );
}
