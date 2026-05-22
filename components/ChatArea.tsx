'use client'

import type { Chat } from '@/types'
import { WelcomeScreen } from './WelcomeScreen'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatArea({
  activeChat,
  isStreaming,
  onSend,
  onStop,
}: {
  activeChat: Chat | null
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
}) {
  if (!activeChat || activeChat.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen onSelect={onSend} />
        <ChatInput onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MessageList messages={activeChat.messages} isStreaming={isStreaming} />
      <ChatInput onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
    </div>
  )
}
