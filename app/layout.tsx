import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今日、3分だけ。",
  description: "今日のニュースから、世界を見る視点を1つ増やす。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
