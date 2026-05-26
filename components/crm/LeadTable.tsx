'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import type { CustomerLead, LeadStatus, LeadSource } from '@/lib/types/crm'

const statusLabels: Record<string, string> = {
  new: '新线索',
  contacted: '已联系',
  interested: '有意向',
  ordered: '已下单',
  repurchase_pending: '待复购',
  lost: '已流失',
}

const statusColors: Record<string, string> = {
  new: 'text-blue-500 bg-blue-500/10',
  contacted: 'text-amber-500 bg-amber-500/10',
  interested: 'text-green-500 bg-green-500/10',
  ordered: 'text-orange-500 bg-orange-500/10',
  repurchase_pending: 'text-purple-500 bg-purple-500/10',
  lost: 'text-zinc-500 bg-zinc-500/10',
}

interface LeadTableProps {
  leads: CustomerLead[]
  onSelectLead: (lead: CustomerLead) => void
}

export function LeadTable({ leads, onSelectLead }: LeadTableProps) {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('')
  const [sortAsc, setSortAsc] = useState(false)

  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // Keyword filter
    if (keyword.trim()) {
      const kw = keyword.toLowerCase()
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(kw) ||
          (l.interestedProduct && l.interestedProduct.toLowerCase().includes(kw)) ||
          (l.phone && l.phone.includes(kw))
      )
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter)
    }

    // Source filter
    if (sourceFilter) {
      result = result.filter((l) => l.source === sourceFilter)
    }

    // Sort
    result.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortAsc ? diff : -diff
    })

    return result
  }, [leads, keyword, statusFilter, sourceFilter, sortAsc])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      {/* Filters */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索姓名、产品、手机号..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          >
            <option value="">全部状态</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          >
            <option value="">全部来源</option>
            <option value="douyin">抖音</option>
            <option value="xiaohongshu">小红书</option>
            <option value="wechat">微信</option>
            <option value="offline">线下</option>
            <option value="referral">推荐</option>
            <option value="video">视频号</option>
            <option value="other">其他</option>
          </select>

          {/* Result count */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
            共 {filteredLeads.length} 条
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">姓名</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">来源</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">意向产品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">意向等级</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="inline-flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  创建时间
                  <ArrowUpDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {lead.source}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {lead.interestedProduct || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < lead.intentionLevel ? 'text-orange-500' : 'text-zinc-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[lead.status] || statusColors.new}`}>
                      {statusLabels[lead.status] || '新线索'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(lead.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
