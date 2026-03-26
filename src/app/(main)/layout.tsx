import Link from "next/link";
import { Home, Settings } from "lucide-react";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部占位或空，由子页面决定 */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* 底部导航栏 Material Design 极简风 */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <Link href="/home" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <Home className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] tracking-widest uppercase">命运转盘</span>
          </Link>
          
          <Link href="/manage" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <Settings className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] tracking-widest uppercase">转盘管理</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
