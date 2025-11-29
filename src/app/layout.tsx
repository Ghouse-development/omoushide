import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "クレーム対応報告書作成ツール",
  description: "AIを活用してクレーム対応報告書を効率的に作成するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <noscript>
          <div style={{
            padding: '20px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            textAlign: 'center',
            fontFamily: 'sans-serif'
          }}>
            このアプリケーションを使用するにはJavaScriptを有効にしてください。
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
