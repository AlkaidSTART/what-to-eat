"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import GSAPRoulette from "@/components/GSAPRoulette";
import { Clock, Sparkles, Sun, Sunrise, Sunset, Moon, Coffee } from "lucide-react";

// 高级简约配色方案 - 扩展莫兰迪色系
const COLORS = [
  "#8B9A8B", // 灰绿色
  "#A5A58D", // 灰褐色
  "#B7B7A4", // 浅灰绿
  "#CB997E", // 暖灰棕
  "#DDBEA9", // 米色
  "#A8A6A1", // 灰米色
  "#9B9B7A", // 橄榄灰
  "#C9C9B6", // 浅橄榄
  "#7A8B7A", // 深灰绿
  "#B8A99A", // 暖灰色
  "#9A9A8A", // 中灰绿
  "#C4B7A6", // 浅暖灰
  "#8B8B7A", // 深橄榄
  "#D4C4B0", // 浅米色
  "#A0A090", // 中性灰
  "#B5A89A", // 暖灰棕
];

// 时间类型定义 - 使用 Lucide 图标
const TIME_SLOTS = {
  BREAKFAST: { label: "早餐", hours: [6, 9], Icon: Sunrise },
  LUNCH: { label: "午餐", hours: [11, 13], Icon: Sun },
  AFTERNOON: { label: "下午茶", hours: [14, 17], Icon: Coffee },
  DINNER: { label: "晚餐", hours: [17, 20], Icon: Sunset },
  NIGHT: { label: "夜宵", hours: [22, 2], Icon: Moon },
};

// 获取当前时间推荐类型
const getCurrentTimeSlot = (): string => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return "BREAKFAST";
  if (hour >= 11 && hour < 14) return "LUNCH";
  if (hour >= 14 && hour < 17) return "AFTERNOON";
  if (hour >= 17 && hour < 21) return "DINNER";
  if (hour >= 22 || hour < 3) return "NIGHT";

  return "NONE";
};

// 获取时间描述和图标
const getTimeInfo = (): { label: string; Icon: React.ElementType } => {
  const hour = new Date().getHours();
  const slot = getCurrentTimeSlot();
  const slotInfo = TIME_SLOTS[slot as keyof typeof TIME_SLOTS];

  if (slotInfo) {
    return { label: `现在是${slotInfo.label}时间`, Icon: slotInfo.Icon };
  }

  // 其他时间段
  if (hour >= 3 && hour < 6) return { label: "凌晨时分", Icon: Moon };
  if (hour >= 10 && hour < 11) return { label: "上午时光", Icon: Coffee };
  if (hour >= 21 && hour < 22) return { label: "晚间时刻", Icon: Sunset };

  return { label: "今天吃点什么呢？", Icon: Clock };
};

export default function HomePage() {
  const { roulettes } = useAppStore();
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string>("NONE");
  const [activeRouletteId, setActiveRouletteId] = useState<string | null>(null);

  // 初始化时根据时间设置推荐转盘
  useEffect(() => {
    const slot = getCurrentTimeSlot();
    setCurrentTimeSlot(slot);

    // 查找匹配当前时间的转盘
    const matchingRoulette = roulettes.find((r) => r.type === slot);
    const defaultRoulette = roulettes.find((r) => r.isDefault);

    // 优先使用匹配的转盘，其次是默认转盘，最后是第一个转盘
    if (matchingRoulette) {
      setActiveRouletteId(matchingRoulette.id);
    } else if (defaultRoulette) {
      setActiveRouletteId(defaultRoulette.id);
    } else if (roulettes.length > 0) {
      setActiveRouletteId(roulettes[0].id);
    }
  }, [roulettes]);

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

  // 获取推荐转盘列表（当前时间匹配的优先）
  const recommendedRoulettes = useMemo(() => {
    return [...roulettes].sort((a, b) => {
      // 当前时间匹配的排最前
      if (a.type === currentTimeSlot && b.type !== currentTimeSlot) return -1;
      if (b.type === currentTimeSlot && a.type !== currentTimeSlot) return 1;
      // 默认转盘排第二
      if (a.isDefault && !b.isDefault) return -1;
      if (b.isDefault && !a.isDefault) return 1;
      return 0;
    });
  }, [roulettes, currentTimeSlot]);

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

  // 检查当前激活的转盘是否是时间推荐
  const isTimeRecommended =
    activeRoulette?.type === currentTimeSlot && currentTimeSlot !== "NONE";

  // 获取当前时间信息
  const { label: timeLabel, Icon: TimeIcon } = getTimeInfo();

  return (
    <div className="min-h-full p-6 pb-12 flex flex-col items-center">
      {/* 顶部标题区 */}
      <div className="w-full max-w-md page-content mt-8 mb-6 text-center">
        <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
          命运转盘
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <TimeIcon className="w-4 h-4 stroke-[1.5]" />
          <span>{timeLabel}</span>
        </div>
      </div>

      {/* 时间推荐提示 */}
      {isTimeRecommended && (
        <div className="w-full max-w-md page-content mb-4">
          <div className="bg-gradient-to-r from-stone-50 to-gray-50 border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-stone-500 stroke-[1.5]" />
            <span className="text-sm text-stone-600">
              根据当前时间，为您推荐「{activeRoulette?.name}」
            </span>
          </div>
        </div>
      )}

      {/* 转盘选择区 (可横向滑动) */}
      <div className="w-full max-w-md page-content mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-2 pb-4">
          {recommendedRoulettes.map((r) => {
            const isActive = r.id === activeRouletteId;
            const isTimeMatch = r.type === currentTimeSlot && currentTimeSlot !== "NONE";
            const TimeSlotIcon = TIME_SLOTS[r.type as keyof typeof TIME_SLOTS]?.Icon;

            return (
              <button
                key={r.id}
                onClick={() => setActiveRouletteId(r.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-full text-sm tracking-wider transition-all duration-300 relative flex items-center gap-2 ${
                  isActive
                    ? "bg-black text-white shadow-md scale-105"
                    : isTimeMatch
                    ? "bg-stone-50 text-stone-700 border border-stone-300 hover:border-stone-400"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                }`}
              >
                {TimeSlotIcon && !isActive && (
                  <TimeSlotIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
                <span>{r.name}</span>
                {isTimeMatch && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-stone-400 rounded-full"></span>
                )}
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
