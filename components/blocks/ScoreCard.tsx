'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Target } from 'lucide-react'
import type { ScoreCardData } from '@/types'

function CircularScore({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444'

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8"
          className="text-zinc-200 dark:text-zinc-700" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-2xl font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function CategoryBar({ name, score, max, comment, suggestions }: {
  name: string; score: number; max: number; comment: string; suggestions: string[]
}) {
  const [open, setOpen] = useState(false)
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
            <span className="text-xs text-zinc-400">{score}/{max}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all duration-700`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
        {suggestions.length > 0 && (
          open ? <ChevronUp size={15} className="text-zinc-400 shrink-0" />
            : <ChevronDown size={15} className="text-zinc-400 shrink-0" />
        )}
      </button>
      {open && suggestions.length > 0 && (
        <div className="px-3 pb-3 space-y-1">
          <p className="text-xs text-zinc-400 mt-1">{comment}</p>
          {suggestions.map((s, i) => (
            <p key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
              <span className="text-orange-500 mt-0.5">→</span>
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function ScoreCard({ data }: { data: ScoreCardData }) {
  return (
    <div className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <CircularScore score={data.overall} />
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">文案评分</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {data.overall >= 80 ? '优秀 ✨' : data.overall >= 60 ? '良好 👍' : '需要优化 💪'}
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-3 space-y-2">
        {data.categories.map((cat, i) => (
          <CategoryBar key={i} {...cat} />
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={13} className="text-green-500" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">优势</span>
          </div>
          <ul className="space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={13} className="text-red-500" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">待改进</span>
          </div>
          <ul className="space-y-1">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">✗</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
