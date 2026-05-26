import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ThemeProvider"
import { NavBar } from "@/components/NavBar"
import "./globals.css"

export const metadata: Metadata = {
  title: "灵语 · 果潮联盟 AI 营销助手",
  description: "果潮联盟旗下 AI 营销助手 — 帮水果商户解决内容创作、视频营销、销售转化等问题",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="h-full font-sans antialiased bg-white dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100">
        <ThemeProvider>
          <div className="h-full flex flex-col">
            <NavBar />
            <main className="flex-1 min-h-0">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
