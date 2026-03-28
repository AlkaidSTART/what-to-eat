"use client";
import Link from "next/link";
import { Home, Settings } from "lucide-react";
import { ReactNode, useRef, useEffect } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabList = [
    { href: "/home", label: "命运转盘", icon: Home },
    { href: "/manage", label: "转盘管理", icon: Settings },
  ];


  // GSAP滑块跟随动画
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const tabs = Array.from(navRef.current.querySelectorAll("a"));
    const activeIdx = tabList.findIndex(tab => tab.href === pathname);
    if (activeIdx === -1) return;
    const activeTab = tabs[activeIdx] as HTMLElement;
    if (!activeTab) return;
    const navRect = navRef.current.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const left = tabRect.left - navRect.left;
    const width = tabRect.width;
      // 高级GSAP切换动画：滑块收缩-移动-展开
      const indicator = indicatorRef.current;
      const prevLeft = indicator._gsap?.x || 0;
      const prevWidth = indicator.offsetWidth;
      // 顺滑的“收缩-移动-展开”动画，移动与收缩/展开部分重叠
      gsap.timeline()
        .to(indicator, {
          width: Math.max(8, prevWidth * 0.4),
          x: prevLeft + (prevWidth - Math.max(8, prevWidth * 0.4)) / 2,
          duration: 0.13,
          ease: "power2.inOut"
        })
        .to(indicator, {
          x: left + (width - Math.max(8, prevWidth * 0.4)) / 2,
          duration: 0.13,
          ease: "power1.inOut"
        }, "<")
        .to(indicator, {
          width: width,
          x: left,
          duration: 0.18,
          ease: "power3.out"
        });
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部占位或空，由子页面决定 */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* 底部导航栏 Material Design 极简风 */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-50">
        <div ref={navRef} className="max-w-md mx-auto flex justify-around items-center h-16 relative">
          {/* 滑块指示器 */}
          <div
            ref={indicatorRef}
            className="absolute left-0 top-0 h-[3px] rounded-full z-0 transition-all bg-black/80"
            style={{ width: 0, x: 0, pointerEvents: 'none' }}
          />
          {tabList.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center w-full h-full z-10 transition-colors group ${isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-black'}`}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                <span className="text-[11px] tracking-widest uppercase leading-none" style={{fontWeight: isActive ? 600 : 400}}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
