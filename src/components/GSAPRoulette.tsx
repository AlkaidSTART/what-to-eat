"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export type RouletteItemType = {
  id: string;
  name: string;
  probability: number; // 0-100
  color: string;
};

interface GSAPRouletteProps {
  items: RouletteItemType[];
}

export default function GSAPRoulette({ items }: GSAPRouletteProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // SVG parameters
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  // Calculate angles based on probabilities
  let currentAngle = 0;
  const sectors = items.map((item) => {
    // Math: probability / 100 * 360
    const angle = (item.probability / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert angles to SVG coordinates
    // SVG coordinate system starts from 3 o'clock (0 degrees), we shift it by -90 to start from top
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // SVG Path Command for a sector
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(" ");

    // Text rotation logic
    const midAngle = startAngle + angle / 2;
    // position text slightly inside
    const textRadius = radius * 0.65;
    const textRad = (midAngle - 90) * (Math.PI / 180);
    const tx = cx + textRadius * Math.cos(textRad);
    const ty = cy + textRadius * Math.sin(textRad);

    return {
      ...item,
      pathData,
      midAngle,
      tx,
      ty,
    };
  });

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // 抽奖逻辑：根据概率计算落在哪个扇区
    const random = Math.random() * 100;
    let sum = 0;
    let winner: typeof sectors[0] | null = null;
    for (const sector of sectors) {
      sum += sector.probability;
      if (random <= sum) {
        winner = sector;
        break;
      }
    }

    if (!winner) winner = sectors[sectors.length - 1]; // fallback

    // 目标扇区的中心角度 (我们要让这个角度对准指针，假设指针在上方也就是 270度 / -90度 位置)
    // SVG的初始状态，顶部是 -90度，对应我们要转到的角度是 360 - midAngle
    const baseRotation = 360 * 5; // 转5圈
    const targetRotation = baseRotation + (360 - winner.midAngle); 

    // GSAP Animation
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      transformOrigin: "50% 50%",
      duration: 5,
      ease: "power4.out", // 类似物理阻尼的缓动
      onComplete: () => {
        setIsSpinning(false);
        setResult(winner!.name);
        
        // Pointer bounce
        gsap.fromTo(pointerRef.current, 
          { scale: 0.8 },
          { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="relative w-full max-w-[300px] aspect-square mx-auto">
        {/* 指针 */}
        <div 
          ref={pointerRef}
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 flex items-center justify-center filter drop-shadow-md"
        >
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-black"></div>
        </div>

        {/* 转盘 */}
        <svg 
          ref={wheelRef}
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${size} ${size}`} 
          className="rounded-full shadow-lg border-4 border-white"
        >
          <g>
            {sectors.map((sector) => (
              <g key={sector.id}>
                <path d={sector.pathData} fill={sector.color} stroke="#ffffff" strokeWidth="2" />
                <text
                  x={sector.tx}
                  y={sector.ty}
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="300"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${sector.midAngle}, ${sector.tx}, ${sector.ty})`}
                  style={{ userSelect: "none" }}
                >
                  {sector.name}
                </text>
              </g>
            ))}
          </g>
        </svg>
        
        {/* 中心圆点 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-sm z-10 flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || items.length === 0}
        className="w-48 py-4 bg-black text-white rounded-full font-light tracking-widest uppercase transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] active:scale-95"
      >
        {isSpinning ? "命运转动中..." : "开始抽取"}
      </button>

      {/* 结果显示 */}
      <div className="h-12 flex items-center justify-center">
        {result && (
          <p className="text-xl font-medium tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-500">
            今天就吃: <span className="font-bold border-b-2 border-black pb-1 ml-2">{result}</span>
          </p>
        )}
      </div>
    </div>
  );
}
