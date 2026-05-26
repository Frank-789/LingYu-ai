'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles, Send } from 'lucide-react'
import type { FollowUpSuggestion } from '@/lib/types/crm'

interface FollowUpSuggestionCardProps {
  suggestion: FollowUpSuggestion
  onApply?: (message: string) => void
}

export function FollowUpSuggestionCard({ suggestion, onApply }: FollowUpSuggestionCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.suggestedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = suggestion.suggestedMessage
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-orange-500" />
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
          AI 跟进建议
        </span>
      </div>

      {/* Suggested Message */}
      <div className="mb-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">建议话术：</p>
        <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {suggestion.suggestedMessage}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">跟进理由：</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{suggestion.followUpReason}</p>
      </div>

      {/* Recommended Action */}
      <div className="mb-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">建议操作：</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{suggestion.recommendedAction}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? '已复制' : '复制话术'}
        </button>
        {onApply && (
          <button
            onClick={() => onApply(suggestion.suggestedMessage)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Send size={14} />
            添加跟进
          </button>
        )}
      </div>
    </div>
  )
}
