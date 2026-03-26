"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAppStore();

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

  // 初始化 IndexedDB
  useEffect(() => {
    db.init().catch(console.error);
  }, []);

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
        setError(null);
        setSuccessMessage(null);
        reset();
        gsap.to(formRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        // 标题动画
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4 }
        );
      },
    });
  };

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 按钮点击动画反馈
    gsap.to(".submit-btn", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    try {
      if (isLogin) {
        // 登录逻辑：从 IndexedDB 验证用户
        const user = await db.validateUser(data.username, data.password);

        if (!user) {
          setError("用户名或密码不正确");
          setIsLoading(false);
          return;
        }

        // 登录成功，放行
        login(data.username);
        setIsLoading(false);
        router.push("/home");
      } else {
        // 注册逻辑：创建新用户到 IndexedDB
        try {
          await db.createUser(data.username, data.password);
          // 注册成功，显示成功消息，跳转到登录页
          setSuccessMessage("注册成功，请登录");
          setIsLoading(false);
          
          // 延迟后切换到登录模式
          setTimeout(() => {
            toggleMode();
          }, 1500);
        } catch (err) {
          if (err instanceof Error && err.message === "用户名已存在") {
            setError("该用户名已被注册");
          } else {
            setError("注册失败，请重试");
          }
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生错误");
      setIsLoading(false);
    }
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
        <form
          ref={formRef}
          className="space-y-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}
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
