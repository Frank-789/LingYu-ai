'use client'

import { useState } from 'react'
import { Menu, Moon, Sun, Trash2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { useTheme } from './ThemeProvider'

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, toggle } = useTheme()
  const {
    chats,
    activeChat,
    isStreaming,
    switchChat,
    newChat,
    removeChat,
    sendMessage,
    stopGeneration,
  } = useChat()

  return (
    <div className="flex h-full bg-white dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChat?.id ?? null}
        onNewChat={newChat}
        onSwitchChat={switchChat}
        onDeleteChat={removeChat}
        collapsed={!sidebarOpen}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Chat Content */}
        <ChatArea
          activeChat={activeChat}
          isStreaming={isStreaming}
          onSend={sendMessage}
          onStop={stopGeneration}
        />
      </div>
    </div>
  )
}
