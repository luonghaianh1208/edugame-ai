import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduGame AI Agent – Tạo Game Học Tập",
  description: "AI Agent giúp giáo viên tạo trò chơi học tập HTML chạy offline chỉ bằng mô tả ngôn ngữ tự nhiên",
  keywords: "game học tập, giáo dục, AI, HTML game, offline, quiz, matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ height: '100vh', overflow: 'hidden', background: '#0d1117' }}>
        {children}
      </body>
    </html>
  );
}
