import type { Chat, Message } from '@/types'

const STORAGE_KEY = 'lingyu-chats'

export function loadChats(): Record<string, Chat> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveChats(chats: Record<string, Chat>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch { /* quota exceeded etc */ }
}

export function createChat(): Chat {
  return {
    id: crypto.randomUUID(),
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function addMessage(chat: Chat, role: 'user' | 'assistant', content: string): Chat {
  const message: Message = {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
  const updated = {
    ...chat,
    messages: [...chat.messages, message],
    updatedAt: Date.now(),
  }
  // Auto-generate title from first user message
  if (role === 'user' && chat.messages.length === 0) {
    updated.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
  }
  return updated
}

export function deleteChat(chats: Record<string, Chat>, id: string): Record<string, Chat> {
  const { [id]: _, ...rest } = chats
  return rest
}
