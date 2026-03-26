"use server";

import AppDataSource, { initializeDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// 定义 auth 相关 action

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "用户名或密码不能为空" };
  }

  try {
    await initializeDataSource();
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { error: "用户名或密码错误" };
    }

    // 极简假 token
    const cookieStore = await cookies();
    cookieStore.set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    redirect("/home");
  } catch (error) {
    console.error("Login error:", error);
    return { error: "登录失败，请稍后重试" };
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || password.length < 6) {
    return { error: "用户名无效或密码小于6位" };
  }

  try {
    await initializeDataSource();
    const userRepository = AppDataSource.getRepository(User);
    
    const existing = await userRepository.findOne({ where: { username } });
    if (existing) {
      return { error: "用户名已存在" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
    });
    const user = await userRepository.save(newUser);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    redirect("/home");
  } catch (error) {
    console.error("Register error:", error);
    return { error: "注册失败，请稍后重试" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
