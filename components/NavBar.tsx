'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Video, Users, Sparkles } from 'lucide-react'

const links = [
  { href: '/', label: 'AI 对话', icon: MessageSquare },
  { href: '/video-studio', label: '视频工厂', icon: Video },
  { href: '/crm', label: '销售中心', icon: Users },
]

export function NavBar() {
  const pathname = usePathname()

  // Don't show nav on sales-page sub-routes (they're standalone)
  if (pathname.startsWith('/sales-page/')) return null

  return (
    <nav className="flex items-center gap-1 px-4 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0B] shrink-0 overflow-x-auto">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
          灵
        </div>
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hidden sm:inline">灵语</span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-orange-500 dark:text-orange-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
