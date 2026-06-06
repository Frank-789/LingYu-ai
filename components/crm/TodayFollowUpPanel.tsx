'use client'

import { Bell, ChevronRight, User, Phone, MessageCircle } from 'lucide-react'
import type { CustomerLead } from '@/lib/types/crm'

interface TodayFollowUpPanelProps {
  leads: CustomerLead[]
  onSelectLead: (lead: CustomerLead) => void
}

const statusLabels: Record<string, string> = {
  new: '新线索',
  contacted: '已联系',
  interested: '有意向',
  ordered: '已下单',
  repurchase_pending: '待复购',
  lost: '已流失',
}

const sourceLabels: Record<string, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
  wechat: '微信',
  offline: '线下',
  referral: '推荐',
  video: '视频号',
  other: '其他',
}

/** Generate a recommended action based on customer tags and status */
function getRecommendedAction(lead: CustomerLead): string {
  if (lead.tags.includes('price_sensitive')) {
    if (lead.status === 'new' || lead.status === 'contacted') return '发送优惠提醒'
    return '提醒限时优惠'
  }
  if (lead.tags.includes('gift_customer')) return '确认礼盒规格'
  if (lead.tags.includes('wholesale')) return '发送批量报价'
  if (lead.tags.includes('old_customer') || lead.status === 'repurchase_pending') return '询问复购'
  if (lead.tags.includes('high_value')) return '推送新品推荐'
  if (lead.tags.includes('after_sales_sensitive')) return '说明坏果包赔'
  if (lead.status === 'ordered') return '提醒付款'
  if (lead.status === 'interested') return '推送今日到货水果'
  return '了解客户需求'
}

export function TodayFollowUpPanel({ leads, onSelectLead }: TodayFollowUpPanelProps) {
  // Calculate "today" leads: those with nextFollowUpAt <= end of today
  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const todayLeads = leads
    .filter(l => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= todayEnd && l.status !== 'lost')
    .sort((a, b) => {
      // Overdue first, then by soonest
      const aOverdue = new Date(a.nextFollowUpAt!).getTime() < now.getTime()
      const bOverdue = new Date(b.nextFollowUpAt!).getTime() < now.getTime()
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return new Date(a.nextFollowUpAt!).getTime() - new Date(b.nextFollowUpAt!).getTime()
    })

  if (todayLeads.length === 0) return null

  const displayLeads = todayLeads.slice(0, 5)
  const overdueCount = todayLeads.filter(l => new Date(l.nextFollowUpAt!).getTime() < now.getTime()).length

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Bell size={16} className="text-orange-500" />
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">今日跟进</span>
        {overdueCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            {overdueCount} 条超时
          </span>
        )}
        <span className="text-[10px] text-zinc-400 ml-auto">
          共 {todayLeads.length} 位客户需跟进
        </span>
      </div>

      {/* Customer list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {displayLeads.map(lead => {
          const isOverdue = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).getTime() < now.getTime() : false
          const action = getRecommendedAction(lead)
          const timeStr = lead.nextFollowUpAt
            ? new Date(lead.nextFollowUpAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : ''

          return (
            <button
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar placeholder */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  isOverdue
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                }`}>
                  {lead.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{lead.name}</span>
                    <span className={`text-[10px] px-1 py-0.5 rounded ${
                      isOverdue
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {isOverdue ? '已超时' : timeStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {lead.interestedProduct || '未指定产品'}
                    </span>
                    <span className="text-[10px] text-zinc-400">·</span>
                    <span className="text-[10px] text-zinc-400">
                      {sourceLabels[lead.source] || lead.source}
                    </span>
                    <span className="text-[10px] text-zinc-400">·</span>
                    <span className="text-[10px] text-zinc-400">{statusLabels[lead.status]}</span>
                  </div>
                  {/* Recommended action pill */}
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    {action === '发送优惠提醒' || action === '确认礼盒规格' || action === '发送批量报价' || action === '询问复购' || action === '推送新品推荐' || action === '提醒限时优惠'
                      ? <MessageCircle size={8} />
                      : <Phone size={8} />
                    }
                    {action}
                  </div>
                </div>

                <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600 mt-1 group-hover:text-zinc-500 transition-colors shrink-0" />
              </div>
            </button>
          )
        })}
      </div>

      {todayLeads.length > 5 && (
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400">
            还有 {todayLeads.length - 5} 位客户待跟进
          </span>
        </div>
      )}
    </div>
  )
}
