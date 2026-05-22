'use client'

import { Download } from 'lucide-react'
import { useRef, useCallback } from 'react'
import type { PriceTagData } from '@/types'

const colorSchemes = {
  green: { from: 'from-emerald-500', to: 'to-green-600', accent: 'bg-emerald-100 text-emerald-800' },
  orange: { from: 'from-orange-500', to: 'to-amber-600', accent: 'bg-orange-100 text-orange-800' },
  red: { from: 'from-rose-500', to: 'to-red-600', accent: 'bg-rose-100 text-rose-800' },
  purple: { from: 'from-violet-500', to: 'to-purple-600', accent: 'bg-violet-100 text-violet-800' },
}

export function PriceTagCard({ data }: { data: PriceTagData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const scheme = colorSchemes[data.colorScheme] ?? colorSchemes.orange

  const handleDownload = useCallback(() => {
    // Trigger browser save by capturing card as image via canvas
    const card = cardRef.current
    if (!card) return
    import('html-to-image').then(({ toPng }) => {
      toPng(card, { backgroundColor: '#fff' }).then((url) => {
        const link = document.createElement('a')
        link.download = `${data.product}-价签.png`
        link.href = url
        link.click()
      })
    }).catch(() => {
      // Fallback: just inform user to screenshot
      alert('请截屏保存此价签')
    })
  }, [data.product])

  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700">
      {/* Card */}
      <div
        ref={cardRef}
        className={`bg-gradient-to-br ${scheme.from} ${scheme.to} p-5 text-white`}
      >
        {/* Emoji */}
        <div className="text-4xl mb-2">{data.emoji || '🍎'}</div>

        {/* Product Name */}
        <h3 className="text-xl font-bold mb-1">{data.product}</h3>

        {/* Headline */}
        <p className="text-sm text-white/80 mb-3">{data.headline}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-sm">¥</span>
          <span className="text-5xl font-extrabold tracking-tight">{data.price}</span>
          <span className="text-sm text-white/70">/{data.unit}</span>
        </div>

        {/* Origin Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs mb-4">
          📍 {data.origin}
        </div>

        {/* Features */}
        <ul className="space-y-1 mb-4">
          {data.features.map((f, i) => (
            <li key={i} className="text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Promotion Tag */}
        {data.promotionText && (
          <div className="bg-white/20 rounded-lg px-3 py-2 text-sm text-center font-medium">
            🏷️ {data.promotionText}
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download size={15} />
          下载价签
        </button>
      </div>
    </div>
  )
}
