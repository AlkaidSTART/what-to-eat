"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// 定义 auth 相关 action

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "用户名或密码不能为空" };
  }

  const user = await prisma.user.findUnique({
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
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || password.length < 6) {
    return { error: "用户名无效或密码小于6位" };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "用户名已存在" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/home");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
