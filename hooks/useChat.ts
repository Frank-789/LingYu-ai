'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Chat, Message } from '@/types'
import { loadChats, saveChats, createChat, addMessage, deleteChat } from '@/lib/storage'

export function useChat() {
  const [chats, setChats] = useState<Record<string, Chat>>({})
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const initialized = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialized.current) {
      const saved = loadChats()
      setChats(saved)
      initialized.current = true
    }
  }, [])

  // Persist to localStorage when chats change
  useEffect(() => {
    if (initialized.current) {
      saveChats(chats)
    }
  }, [chats])

  const activeChat = activeChatId ? chats[activeChatId] ?? null : null

  const getOrCreateChat = useCallback(() => {
    if (activeChatId && chats[activeChatId]) return chats[activeChatId]
    const chat = createChat()
    setChats((prev) => ({ ...prev, [chat.id]: chat }))
    setActiveChatId(chat.id)
    return chat
  }, [activeChatId, chats])

  const switchChat = useCallback((id: string) => {
    setActiveChatId(id)
  }, [])

  const newChat = useCallback(() => {
    const chat = createChat()
    setChats((prev) => ({ ...prev, [chat.id]: chat }))
    setActiveChatId(chat.id)
    return chat
  }, [])

  const removeChat = useCallback((id: string) => {
    setChats((prev) => deleteChat(prev, id))
    if (activeChatId === id) {
      setActiveChatId(null)
    }
  }, [activeChatId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const chat = getOrCreateChat()

    // Add user message
    const chatWithUser = addMessage(chat, 'user', content)
    setChats((prev) => ({ ...prev, [chatWithUser.id]: chatWithUser }))

    setIsStreaming(true)

    // Create assistant message placeholder
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }

    setChats((prev) => {
      const c = prev[chatWithUser.id]
      if (!c) return prev
      return {
        ...prev,
        [chatWithUser.id]: {
          ...c,
          messages: [...c.messages, assistantMsg],
        },
      }
    })

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const allMessages = chatWithUser.messages
        .concat({ id: '', role: 'user' as const, content, createdAt: Date.now() })
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        fullContent += text

        setChats((prev) => {
          const c = prev[chatWithUser.id]
          if (!c) return prev
          const msgs = [...c.messages]
          const lastIdx = msgs.length - 1
          if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
            msgs[lastIdx] = { ...msgs[lastIdx], content: fullContent }
          }
          return { ...prev, [chatWithUser.id]: { ...c, messages: msgs, updatedAt: Date.now() } }
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped generation - keep partial content
      } else {
        console.error('Chat error:', err)
        setChats((prev) => {
          const c = prev[chatWithUser.id]
          if (!c) return prev
          const msgs = [...c.messages]
          const lastIdx = msgs.length - 1
          if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
            msgs[lastIdx] = {
              ...msgs[lastIdx],
              content: msgs[lastIdx].content || '抱歉，我遇到了一些问题，请稍后重试。',
            }
          }
          return { ...prev, [chatWithUser.id]: { ...c, messages: msgs, updatedAt: Date.now() } }
        })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [getOrCreateChat, isStreaming])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearChats = useCallback(() => {
    setChats({})
    setActiveChatId(null)
  }, [])

  return {
    chats,
    activeChat,
    activeChatId,
    isStreaming,
    switchChat,
    newChat,
    removeChat,
    sendMessage,
    stopGeneration,
    clearChats,
  }
}
