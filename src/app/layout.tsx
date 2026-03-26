import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么 - 命运转盘",
  description: "让转盘帮你决定今天吃什么",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
