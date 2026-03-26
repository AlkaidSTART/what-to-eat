"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Clock, Star, Trash2, X, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import gsap from "gsap";

export default function ManagePage() {
  const { roulettes, deleteRoulette } = useAppStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    gsap.fromTo(
      ".page-content",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteRoulette(deletingId);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10 page-content">
          <div>
            <h1 className="text-2xl font-light tracking-widest text-gray-900">
              转盘管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">配置你的专属菜单</p>
          </div>
          <Link
            href="/manage/new"
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>

        <div className="space-y-4 page-content">
          {roulettes.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              暂无转盘，点击右上方添加
            </div>
          ) : (
            roulettes.map((roulette) => (
              <div
                key={roulette.id}
                className="group relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <Link
                  href={`/manage/${roulette.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-black transition-colors">
                      {roulette.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {roulette.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <UtensilsIcon className="w-3 h-3" />
                      {roulette.items?.length ?? 0} 个选项
                    </span>
                    {roulette.isDefault && (
                      <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        常驻
                      </span>
                    )}
                  </div>
                </Link>
                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDelete(roulette.id, e)}
                  className="absolute top-5 right-14 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                  title="删除转盘"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">确认删除</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              确定要删除这个转盘吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Utensils Icon since I didn't import it at the top
function UtensilsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
