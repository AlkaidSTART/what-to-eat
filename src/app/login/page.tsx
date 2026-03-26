"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import gsap from "gsap";

// 表单验证 Schema
const authSchema = z.object({
  username: z.string().min(3, { message: "用户名长度至少为 3 个字符" }),
  password: z.string().min(6, { message: "密码长度至少为 6 个字符" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 动画 Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  // 进场动画
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      if (formRef.current) {
        gsap.from(formRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // 切换登录/注册时的模式切换动画
  const toggleMode = () => {
    gsap.to(formRef.current, {
      opacity: 0,
      x: isLogin ? -20 : 20,
      duration: 0.3,
      onComplete: () => {
        setIsLogin(!isLogin);
        reset();
        gsap.to(formRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        });
        
        // 标题动画
        gsap.fromTo(titleRef.current, 
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4 }
        );
      },
    });
  };

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    // 模拟 API 调用
    console.log(isLogin ? "登录数据:" : "注册数据:", data);
    
    // 按钮点击动画反馈
    gsap.to(".submit-btn", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12 sm:px-8">
      {/* 极简高级质感：大量留白，细边框 */}
      <div 
        ref={containerRef}
        className="w-full max-w-sm space-y-10 p-8 sm:p-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-none sm:rounded-2xl"
      >
        {/* Header */}
        <div className="space-y-3">
          <h2 
            ref={titleRef}
            className="text-3xl font-light tracking-widest text-gray-900"
          >
            {isLogin ? "登录" : "注册"}
          </h2>
          <div className="h-px w-12 bg-black"></div>
        </div>

        {/* Form */}
        <form ref={formRef} className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Username Input (Material Design: 仅下边划线，极简) */}
            <div className="relative group">
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${
                  errors.username ? "border-red-500" : "focus:border-black"
                }`}
                placeholder=" "
                {...register("username")}
              />
              <label
                htmlFor="username"
                className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                用户名
              </label>
              {errors.username && (
                <p className="absolute -bottom-5 text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative group pt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={`block w-full py-3 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 peer transition-colors pr-10 ${
                  errors.password ? "border-red-500" : "focus:border-black"
                }`}
                placeholder=" "
                {...register("password")}
              />
              <label
                htmlFor="password"
                className="absolute text-gray-400 duration-300 transform -translate-y-6 scale-75 top-5 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                密码
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pt-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-300 hover:text-black transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-300 hover:text-black transition-colors" />
                )}
              </button>
              {errors.password && (
                <p className="absolute -bottom-5 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn group relative w-full flex justify-between items-center py-4 px-2 border-b border-black text-sm font-medium text-black bg-transparent hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="tracking-widest uppercase">
                {isLoading ? "请稍候..." : isLogin ? "进入" : "创建"}
              </span>
              {!isLoading && (
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              )}
            </button>
          </div>

          <div className="mt-8 flex justify-between text-xs text-gray-500 tracking-wider">
            <button
              type="button"
              onClick={toggleMode}
              className="hover:text-black transition-colors uppercase border-b border-transparent hover:border-black pb-1"
            >
              {isLogin ? "创建新账号" : "使用已有账号登录"}
            </button>
            {isLogin && (
              <a
                href="#"
                className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
              >
                忘记密码
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
