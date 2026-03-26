"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { ArrowLeft, Save } from "lucide-react";

// Dnd-kit (此处仅做基础拖拽展示框架预留，完整拖拽列表可按需扩展)
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Schema
const addSchema = z.object({
  name: z.string().min(2, { message: "名称至少需要 2 个字符" }),
  category: z.string().min(1, { message: "请选择一个分类" }),
  description: z.string().optional(),
});

type AddFormValues = z.infer<typeof addSchema>;

// Dnd 拖拽组件项
function SortableItem({ id, name }: { id: string; name: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-4 mb-2 bg-white border border-gray-100 shadow-sm rounded-xl cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
    >
      <span className="font-light text-sm">{name}</span>
      <span className="text-gray-300 text-xs tracking-widest uppercase">Drag</span>
    </div>
  );
}

export default function AddPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dnd 状态预留
  const [tags, setTags] = useState([
    { id: "1", name: "低脂" },
    { id: "2", name: "微辣" },
    { id: "3", name: "高蛋白" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const onSubmit = async (data: AddFormValues) => {
    setIsLoading(true);
    // 提交动画
    gsap.to(".submit-btn", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    console.log("添加数据:", data, "标签排序:", tags);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTags((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6" ref={containerRef}>
      <div className="max-w-2xl mx-auto space-y-8 animate-item">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <h1 className="text-xl font-light tracking-widest uppercase">添加新记录</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左侧：表单 (Material Design 极简风) */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-item bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="space-y-6">
              {/* Name */}
              <div className="relative group">
                <input
                  id="name"
                  type="text"
                  className={`block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${
                    errors.name ? "border-red-500" : "focus:border-black"
                  }`}
                  placeholder=" "
                  {...register("name")}
                />
                <label
                  htmlFor="name"
                  className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  餐品名称
                </label>
                {errors.name && (
                  <p className="absolute -bottom-5 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="relative group pt-4">
                <select
                  id="category"
                  className={`block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${
                    errors.category ? "border-red-500" : "focus:border-black"
                  }`}
                  {...register("category")}
                >
                  <option value="" disabled className="text-gray-400">选择分类</option>
                  <option value="chinese">中餐</option>
                  <option value="western">西餐</option>
                  <option value="fastfood">快餐</option>
                </select>
                <label
                  htmlFor="category"
                  className="absolute text-black duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0]"
                >
                  分类
                </label>
                {errors.category && (
                  <p className="absolute -bottom-5 text-xs text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="relative group pt-4">
                <textarea
                  id="description"
                  rows={3}
                  className="block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 peer transition-colors focus:border-black resize-none"
                  placeholder=" "
                  {...register("description")}
                />
                <label
                  htmlFor="description"
                  className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  备注 (可选)
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn group relative w-full flex justify-between items-center py-4 px-2 border-b border-black text-sm font-medium text-black bg-transparent hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="tracking-widest uppercase">
                  {isLoading ? "保存中..." : "保存记录"}
                </span>
                {!isLoading && <Save className="h-4 w-4" />}
              </button>
            </div>
          </form>

          {/* 右侧：@dnd-kit 拖拽排序标签区 */}
          <div className="animate-item bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 tracking-wider">标签优先级排序</h2>
              <p className="text-xs text-gray-400 mt-1">拖拽调整标签的权重</p>
            </div>
            
            <div className="flex-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tags}
                  strategy={verticalListSortingStrategy}
                >
                  {tags.map((tag) => (
                    <SortableItem key={tag.id} id={tag.id} name={tag.name} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
