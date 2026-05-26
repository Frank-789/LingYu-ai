'use client'

import { Star, Tag } from 'lucide-react'
import type { CustomerLead } from '@/lib/types/crm'

const statusLabels: Record<string, string> = {
  new: '新线索',
  contacted: '已联系',
  interested: '有意向',
  ordered: '已下单',
  repurchase_pending: '待复购',
  lost: '已流失',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  interested: 'bg-green-500/10 text-green-500 border-green-500/20',
  ordered: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  repurchase_pending: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  lost: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

interface LeadCardProps {
  lead: CustomerLead
  onClick?: () => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-orange-500/40 hover:shadow-sm hover:shadow-orange-500/5 transition-all"
    >
      {/* Name and Source */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {lead.name}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 ml-2">
          {lead.source}
        </span>
      </div>

      {/* Interested Product */}
      {lead.interestedProduct && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 truncate">
          {lead.interestedProduct}
        </p>
      )}

      {/* Intention Level (stars) */}
      <div className="flex items-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={10}
            className={i < lead.intentionLevel ? 'text-orange-500 fill-orange-500' : 'text-zinc-600'}
          />
        ))}
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColors[lead.status] || statusColors.new}`}>
          {statusLabels[lead.status] || '新线索'}
        </span>
      </div>
    </div>
  )
}
