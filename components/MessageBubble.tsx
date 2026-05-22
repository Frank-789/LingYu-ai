'use client'

import { useState } from 'react'
import { Copy, Check, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      title="复制"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} group`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          isUser
            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
        }`}
      >
        {isUser ? <User size={16} /> : '灵'}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-orange-500 text-white rounded-tr-md'
              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-md border border-zinc-200/50 dark:border-zinc-700/50'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 dark:prose-pre:bg-black prose-code:text-orange-500 dark:prose-code:text-orange-400 prose-a:text-orange-500">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || '...'}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-1 px-1">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  )
}
