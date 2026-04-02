import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eDM 빌더",
  description: "eDM 이메일 템플릿 제작 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
