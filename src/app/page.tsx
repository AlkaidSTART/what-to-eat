"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import ReactECharts from "echarts-for-react";
import { Plus, Settings, User } from "lucide-react";

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ECharts Option
  const chartOption = {
    color: ['#000000', '#666666', '#999999', '#cccccc'],
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '餐品分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '中餐' },
          { value: 735, name: '西餐' },
          { value: 580, name: '快餐' },
          { value: 484, name: '日韩料' },
          { value: 300, name: '甜点饮品' }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" ref={containerRef}>
      {/* 极简顶栏 */}
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 animate-item">
        <h1 className="text-xl font-light tracking-widest uppercase">What To Eat</h1>
        <div className="flex gap-4">
          <Link href="/add" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 mt-8">
        {/* 看板头部 */}
        <section className="flex justify-between items-end animate-item">
          <div>
            <h2 className="text-2xl font-light">数据看板</h2>
            <p className="text-sm text-gray-500 mt-1">今天想吃点什么？</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Echarts 图表卡片 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-item h-[300px] flex flex-col">
            <h3 className="text-sm font-medium text-gray-500 mb-4 tracking-wider">餐品分类统计</h3>
            <div className="flex-1">
              <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* 快捷操作区 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-item flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4 tracking-wider">快捷操作</h3>
              <p className="text-gray-900 text-3xl font-light mb-2">添加新餐品</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                发现了一家新店？还是想自己做点好吃的？记录下来，丰富你的待选清单。
              </p>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/add" 
                className="inline-flex items-center gap-2 pb-1 border-b border-black hover:text-gray-600 hover:border-gray-600 transition-colors uppercase tracking-widest text-sm"
              >
                立即添加 <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 占位：近期添加卡片 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-item">
          <h3 className="text-sm font-medium text-gray-500 mb-6 tracking-wider">近期添加</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 group cursor-pointer hover:pl-2 transition-all">
                <span className="font-light">轻食沙拉 {i}</span>
                <span className="text-xs text-gray-400 group-hover:text-black transition-colors">今天</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
