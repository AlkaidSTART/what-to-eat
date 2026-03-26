"use client";

import { useEffect, useRef, useState, memo } from "react";
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

const GSAPRoulette = memo(function GSAPRoulette({ items }: GSAPRouletteProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const resultTextRef = useRef<HTMLParagraphElement>(null);
  const centerDotRef = useRef<HTMLDivElement>(null);
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

    const x1 = (cx + radius * Math.cos(startRad)).toFixed(4);
    const y1 = (cy + radius * Math.sin(startRad)).toFixed(4);
    const x2 = (cx + radius * Math.cos(endRad)).toFixed(4);
    const y2 = (cy + radius * Math.sin(endRad)).toFixed(4);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // SVG Path Command for a sector
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(" ");

    // Text rotation logic
    const midAngleNum = startAngle + angle / 2;
    const midAngle = midAngleNum.toFixed(4);
    
    // position name text slightly inside
    const nameRadius = radius * 0.70;
    const nameRad = (midAngleNum - 90) * (Math.PI / 180);
    const ntx = (cx + nameRadius * Math.cos(nameRad)).toFixed(4);
    const nty = (cy + nameRadius * Math.sin(nameRad)).toFixed(4);

    // position probability text closer to center
    const probRadius = radius * 0.50;
    const probRad = (midAngleNum - 90) * (Math.PI / 180);
    const ptx = (cx + probRadius * Math.cos(probRad)).toFixed(4);
    const pty = (cy + probRadius * Math.sin(probRad)).toFixed(4);

    return {
      ...item,
      pathData,
      midAngle,
      midAngleNum,
      ntx,
      nty,
      ptx,
      pty,
    };
  });

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Ripple click effect
    gsap.fromTo(centerDotRef.current, 
      { scale: 0.8, boxShadow: "0 0 0 0 rgba(0,0,0,0.4)" },
      { scale: 1, boxShadow: "0 0 0 20px rgba(0,0,0,0)", duration: 0.6, ease: "power2.out" }
    );

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
    const targetRotation = baseRotation + (360 - winner.midAngleNum); 

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

        // Result staggered reveal
        setTimeout(() => {
          if (resultTextRef.current) {
            const chars = resultTextRef.current.querySelectorAll('.char');
            gsap.fromTo(chars, 
              { opacity: 0, y: 10, scale: 0.8 },
              { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.4, ease: "back.out(2)" }
            );
          }
        }, 50);
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
                  x={sector.ntx}
                  y={sector.nty}
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="300"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${sector.midAngle}, ${sector.ntx}, ${sector.nty})`}
                  style={{ userSelect: "none" }}
                >
                  {sector.name}
                </text>
                <text
                  x={sector.ptx}
                  y={sector.pty}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="300"
                  opacity="0.8"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${sector.midAngle}, ${sector.ptx}, ${sector.pty})`}
                  style={{ userSelect: "none" }}
                >
                  {sector.probability.toFixed(0)}%
                </text>
              </g>
            ))}
          </g>
        </svg>
        
        {/* 中心圆点 */}
        <div ref={centerDotRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-sm z-10 flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      <button
        onClick={(e) => {
          gsap.to(e.currentTarget, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
          spin();
        }}
        disabled={isSpinning || items.length === 0}
        className="w-48 py-4 bg-black text-white rounded-full font-light tracking-widest uppercase transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]"
      >
        {isSpinning ? "命运转动中..." : "开始抽取"}
      </button>

      {/* 结果显示 */}
      <div className="h-16 flex items-center justify-center relative">
        {result && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 背后光晕 */}
            <div className="absolute w-32 h-10 bg-yellow-200 opacity-20 blur-xl rounded-full"></div>
            <p ref={resultTextRef} className="text-xl font-light tracking-widest z-10 flex items-center">
              ✨ <span className="mx-2 font-medium flex">
                {result.split('').map((char, i) => (
                  <span key={i} className="char inline-block">{char}</span>
                ))}
              </span> ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default GSAPRoulette;
