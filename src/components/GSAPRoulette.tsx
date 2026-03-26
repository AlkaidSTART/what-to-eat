"use client";

import { useRef, useState, memo } from "react";
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
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const resultTextRef = useRef<HTMLParagraphElement>(null);
  const centerDotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // SVG parameters
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  // Calculate angles based on probabilities
  let currentAngle = 0;
  const sectors = items.map((item) => {
    const angle = (item.probability / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = (cx + radius * Math.cos(startRad)).toFixed(4);
    const y1 = (cy + radius * Math.sin(startRad)).toFixed(4);
    const x2 = (cx + radius * Math.cos(endRad)).toFixed(4);
    const y2 = (cy + radius * Math.sin(endRad)).toFixed(4);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(" ");

    const midAngleNum = startAngle + angle / 2;
    const midAngle = midAngleNum.toFixed(4);

    const nameRadius = radius * 0.7;
    const nameRad = (midAngleNum - 90) * (Math.PI / 180);
    const ntx = (cx + nameRadius * Math.cos(nameRad)).toFixed(4);
    const nty = (cy + nameRadius * Math.sin(nameRad)).toFixed(4);

    const probRadius = radius * 0.5;
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
    setShowCelebration(false);

    // Ripple click effect
    gsap.fromTo(
      centerDotRef.current,
      { scale: 0.8, boxShadow: "0 0 0 0 rgba(0,0,0,0.4)" },
      {
        scale: 1,
        boxShadow: "0 0 0 20px rgba(0,0,0,0)",
        duration: 0.6,
        ease: "power2.out",
      }
    );

    // 抽奖逻辑
    const random = Math.random() * 100;
    let sum = 0;
    let winner: (typeof sectors)[0] | null = null;
    for (const sector of sectors) {
      sum += sector.probability;
      if (random <= sum) {
        winner = sector;
        break;
      }
    }

    if (!winner) winner = sectors[sectors.length - 1];

    const baseRotation = 360 * 5;
    const targetRotation = baseRotation + (360 - winner.midAngleNum);

    // GSAP Animation
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      transformOrigin: "50% 50%",
      duration: 5,
      ease: "power4.out",
      onComplete: () => {
        setIsSpinning(false);
        setResult(winner!.name);
        setShowCelebration(true);

        // Pointer bounce
        gsap.fromTo(
          pointerRef.current,
          { scale: 0.8 },
          { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        // 高级结果展示动画
        showResultAnimation(winner!.name, winner!.color);
      },
    });
  };

  const showResultAnimation = (winnerName: string, winnerColor: string) => {
    const tl = gsap.timeline();

    // 1. 容器淡入放大
    tl.fromTo(
      resultContainerRef.current,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
    );

    // 2. 光晕效果
    tl.fromTo(
      glowRef.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1.5,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3"
    );

    // 3. 文字逐字动画
    tl.add(() => {
      if (resultTextRef.current) {
        const chars = resultTextRef.current.querySelectorAll(".char");
        gsap.fromTo(
          chars,
          { opacity: 0, y: 30, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.08,
            duration: 0.5,
            ease: "back.out(2)",
          }
        );
      }
    }, "-=0.2");

    // 4. 光晕呼吸效果
    tl.to(glowRef.current, {
      opacity: 0.6,
      scale: 1.2,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // 5. 庆祝彩带效果（使用 CSS 动画）
    createConfetti();
  };

  const createConfetti = () => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
    const container = resultContainerRef.current;
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.className = "absolute w-2 h-2 rounded-full pointer-events-none";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = "50%";
      confetti.style.top = "50%";
      container.appendChild(confetti);

      const angle = (Math.random() * 360 * Math.PI) / 180;
      const distance = 100 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      gsap.to(confetti, {
        x,
        y,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 720 - 360,
        duration: 1 + Math.random() * 0.5,
        ease: "power2.out",
        onComplete: () => confetti.remove(),
      });
    }
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
                <path
                  d={sector.pathData}
                  fill={sector.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
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
        <div
          ref={centerDotRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-sm z-10 flex items-center justify-center"
        >
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      <button
        onClick={(e) => {
          gsap.to(e.currentTarget, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          });
          spin();
        }}
        disabled={isSpinning || items.length === 0}
        className="w-48 py-4 bg-black text-white rounded-full font-light tracking-widest uppercase transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]"
      >
        {isSpinning ? "命运转动中..." : "开始抽取"}
      </button>

      {/* 结果显示区域 */}
      <div className="h-24 flex items-center justify-center relative w-full">
        {showCelebration && result && (
          <div
            ref={resultContainerRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 动态光晕背景 */}
            <div
              ref={glowRef}
              className="absolute w-40 h-16 rounded-full blur-xl"
              style={{
                background: `radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)`,
              }}
            ></div>

            {/* 结果文字 - 高级简约设计 */}
            <div className="relative z-10 text-center">
              <p className="text-xs text-gray-400 tracking-[0.3em] uppercase mb-2">
                命运之选
              </p>
              <p
                ref={resultTextRef}
                className="text-3xl font-extralight tracking-[0.15em] text-gray-900"
                style={{ perspective: "1000px" }}
              >
                <span className="flex">
                  {result.split("").map((char, i) => (
                    <span
                      key={i}
                      className="char inline-block"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </p>
              <div className="mt-3 flex justify-center">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default GSAPRoulette;
