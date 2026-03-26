"use client";

import { useState, useMemo, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import gsap from "gsap";

type RouletteItem = {
  id: string;
  name: string;
  fixedProbability: number | null; // null means auto
};

export default function EditRoulettePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [name, setName] = useState("美好下午茶");
  const [type, setType] = useState("AFTERNOON");
  const [isDefault, setIsDefault] = useState(true);
  
  const [items, setItems] = useState<RouletteItem[]>([
    { id: "1", name: "奶茶", fixedProbability: 30 },
    { id: "2", name: "咖啡", fixedProbability: null },
    { id: "3", name: "小蛋糕", fixedProbability: null },
    { id: "4", name: "水果捞", fixedProbability: null },
  ]);

  useEffect(() => {
    gsap.fromTo(".animate-item", 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  // 概率计算引擎
  const calculatedItems = useMemo(() => {
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

    return items.map(item => ({
      ...item,
      actualProb: item.fixedProbability !== null ? item.fixedProbability : autoProb,
      isError: fixedSum > 100
    }));
  }, [items]);

  const totalFixed = items.reduce((sum, item) => sum + (item.fixedProbability || 0), 0);
  const isError = totalFixed > 100;

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), name: "", fixedProbability: null }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof RouletteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = () => {
    if (isError) return alert("总固定概率不能超过 100%!");
    if (items.some(i => !i.name.trim())) return alert("选项名称不能为空!");
    
    gsap.to(".save-icon", { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
    console.log("Saved", { name, type, isDefault, items: calculatedItems });
    setTimeout(() => router.push("/manage"), 500);
  };

  return (
    <div className="min-h-full p-6 pb-24 bg-gray-50">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between animate-item">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium tracking-widest text-gray-900">
            {resolvedParams.id === "new" ? "新增转盘" : "编辑转盘"}
          </h1>
          <button onClick={handleSave} className="text-black p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
            <Save className="w-5 h-5 save-icon" />
          </button>
        </header>

        {/* Basic Info */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-item">
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
              placeholder=" "
            />
            <label className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              转盘名称
            </label>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative group pt-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
              >
                <option value="NONE">不指定</option>
                <option value="BREAKFAST">早餐 (06:00-09:30)</option>
                <option value="LUNCH">午餐 (11:00-13:30)</option>
                <option value="AFTERNOON">下午茶 (14:30-17:00)</option>
                <option value="DINNER">晚餐 (17:30-20:30)</option>
                <option value="NIGHT">夜宵 (22:00-02:00)</option>
              </select>
              <label className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-5 -z-10 origin-[0]">
                推荐时段
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isDefault" 
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">设为常驻</label>
            </div>
          </div>
        </section>

        {/* Items Management */}
        <section className="animate-item">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-sm font-medium text-gray-500 tracking-wider">转盘选项</h2>
              <p className={`text-xs mt-1 ${isError ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                当前固定概率总和: {totalFixed}% {isError && "(已超出100%)"}
              </p>
            </div>
            <button 
              onClick={handleAddItem}
              className="text-xs flex items-center gap-1 text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3" /> 添加
            </button>
          </div>

          <div className="space-y-3">
            {calculatedItems.map((item, index) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                    placeholder="选项名称"
                    className="w-full text-sm font-medium focus:outline-none border-b border-transparent focus:border-gray-300 pb-1 transition-colors"
                  />
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={item.fixedProbability === null ? "" : item.fixedProbability}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateItem(item.id, "fixedProbability", val === "" ? null : Number(val));
                    }}
                    placeholder={item.actualProb.toFixed(1)}
                    className="w-12 text-right bg-transparent text-sm focus:outline-none placeholder-gray-400 text-black"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {calculatedItems.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                暂无选项，点击右上方添加
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
