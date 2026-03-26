"use client";

import { useState, useEffect } from "react";
import GSAPRoulette, { RouletteItemType } from "@/components/GSAPRoulette";
import { Coffee, Sun, Moon, Utensils } from "lucide-react";
import gsap from "gsap";

// Mock data (replace with actual fetch later)
const MOCK_ROULETTES = [
  {
    id: "r1",
    name: "美好下午茶",
    type: "AFTERNOON",
    isDefault: true,
    items: [
      { id: "i1", name: "奶茶", probability: 20, color: "#1a1a1a" },
      { id: "i2", name: "咖啡", probability: 30, color: "#333333" },
      { id: "i3", name: "小蛋糕", probability: 20, color: "#4d4d4d" },
      { id: "i4", name: "水果捞", probability: 30, color: "#666666" },
    ]
  },
  {
    id: "r2",
    name: "不知道吃啥午餐",
    type: "LUNCH",
    isDefault: true,
    items: [
      { id: "i5", name: "黄焖鸡", probability: 25, color: "#000000" },
      { id: "i6", name: "麦当劳", probability: 25, color: "#222222" },
      { id: "i7", name: "兰州拉面", probability: 25, color: "#444444" },
      { id: "i8", name: "麻辣烫", probability: 25, color: "#666666" },
    ]
  }
];

export default function HomePage() {
  const [activeRouletteId, setActiveRouletteId] = useState(MOCK_ROULETTES[0].id);

  // Animation for page enter
  useEffect(() => {
    gsap.fromTo(".page-content", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }
    );
  }, []);

  const activeRoulette = MOCK_ROULETTES.find(r => r.id === activeRouletteId);

  return (
    <div className="min-h-full p-6 pb-12 flex flex-col items-center">
      {/* 顶部标题区 */}
      <div className="w-full max-w-md page-content mt-8 mb-10 text-center">
        <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">命运转盘</h1>
        <p className="text-sm text-gray-500">将选择交给上天，让这顿饭不再纠结</p>
      </div>

      {/* 转盘选择区 (可横向滑动) */}
      <div className="w-full max-w-md page-content mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-2 pb-4">
          {MOCK_ROULETTES.map((r) => {
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
        {activeRoulette ? (
          <GSAPRoulette items={activeRoulette.items} />
        ) : (
          <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <p>暂无选项，请先去配置菜单</p>
          </div>
        )}
      </div>
    </div>
  );
}
