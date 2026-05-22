'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Square } from 'lucide-react'

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isStreaming])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0B]">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 focus-within:border-orange-400 dark:focus-within:border-orange-500 transition-colors shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="问关于营销、文案、直播、策略..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none leading-relaxed max-h-[200px] disabled:opacity-50"
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
              title="停止生成"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-30 flex items-center justify-center text-white dark:text-zinc-900 transition-all"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center mt-2">
          灵语 · 果潮联盟 AI 营销助手 · Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
