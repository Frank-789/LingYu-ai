'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { FruitCalendarData, FruitItem } from '@/types'

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function FruitCard({ fruit }: { fruit: FruitItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer transition-all hover:shadow-sm"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{fruit.emoji || '🍎'}</span>
          <div>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fruit.name}</span>
            <span className="text-xs text-zinc-400 ml-2">{fruit.priceRange}</span>
          </div>
        </div>

        {/* Season bar */}
        <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            style={{
              marginLeft: `${((fruit.seasonStart - 1) / 12) * 100}%`,
              width: `${((fruit.seasonEnd - fruit.seasonStart + 1) / 12) * 100}%`,
            }}
          />
        </div>
        <p className="text-[11px] text-zinc-400 mt-1">{fruit.regions.join('、')} · 旺季第{fruit.peakWeek}周</p>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-100 dark:border-zinc-800 pt-2">
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">💡 营销建议</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{fruit.marketingTip}</p>
        </div>
      )}
    </div>
  )
}

export function FruitCalendar({ data }: { data: FruitCalendarData }) {
  const [month, setMonth] = useState(data.month)

  const thisMonthFruits = data.fruits.filter(
    (f) => f.seasonStart <= month && f.seasonEnd >= month
  )

  return (
    <div className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Month Navigator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => setMonth((m) => Math.max(1, m - 1))}
          disabled={month <= 1}
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-500"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {monthNames[month - 1]} · 应季水果
        </span>
        <button
          onClick={() => setMonth((m) => Math.min(12, m + 1))}
          disabled={month >= 12}
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-500"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Fruit Grid */}
      <div className="p-3 space-y-2">
        {thisMonthFruits.length > 0 ? (
          thisMonthFruits.map((fruit, i) => (
            <FruitCard key={i} fruit={fruit} />
          ))
        ) : (
          <p className="text-xs text-zinc-400 text-center py-4">
            这个月份没有匹配的应季水果数据
          </p>
        )}
      </div>
    </div>
  )
}
