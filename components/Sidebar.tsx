'use client'

import { MessageSquarePlus, Trash2, MessageSquare } from 'lucide-react'
import type { Chat } from '@/types'

export function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  collapsed,
}: {
  chats: Record<string, Chat>
  activeChatId: string | null
  onNewChat: () => void
  onSwitchChat: (id: string) => void
  onDeleteChat: (id: string) => void
  collapsed: boolean
}) {
  const chatList = Object.values(chats).sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <aside
      className={`flex flex-col h-full bg-[#141416] dark:bg-[#141416] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-[280px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          灵
        </div>
        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">灵语</span>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <MessageSquarePlus size={18} />
          <span>新对话</span>
        </button>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {chatList.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
              activeChatId === chat.id
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
            onClick={() => onSwitchChat(chat.id)}
          >
            <MessageSquare size={15} className="shrink-0 opacity-60" />
            <span className="truncate flex-1">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteChat(chat.id)
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  )
}
