'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import type { ChecklistData, ChecklistItem } from '@/types'
import { loadChecklistState, saveChecklistState } from '@/lib/storage'

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export function Checklist({ data }: { data: ChecklistData }) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const initDone = useCallback(() => {}, [])
  const [initialized, setInitialized] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    const saved = loadChecklistState()
    // Use a unique key for this checklist instance
  }, [])

  // We store state by messageId - but we don't have it here directly.
  // Use a simple random id that persists per component mount
  const [storageKey] = useState(() => `cl-${crypto.randomUUID().slice(0, 8)}`)

  useEffect(() => {
    const saved = loadChecklistState()
    const stored = saved[storageKey]
    if (stored) {
      setCheckedIds(new Set(stored))
    }
    setInitialized(true)
  }, [storageKey])

  const toggle = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveChecklistState(storageKey, Array.from(next))
      return next
    })
  }

  const reset = () => {
    setCheckedIds(new Set())
    saveChecklistState(storageKey, [])
  }

  const total = data.items.length
  const done = checkedIds.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{data.title}</h4>
          <span className="text-xs text-zinc-400">{done}/{total}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="py-1">
        {data.items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={checkedIds.has(item.id)}
                onChange={() => toggle(item.id)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${checkedIds.has(item.id) ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {item.text}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[item.priority] ?? priorityColors.medium}`}>
                  {priorityLabels[item.priority] ?? item.priority}
                </span>
                <span className="text-[10px] text-zinc-400">{item.category}</span>
                <span className="text-[10px] text-zinc-400">⏱ {item.estimatedTime}</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <RotateCcw size={13} />
          重置所有
        </button>
      </div>
    </div>
  )
}
