'use client'

import { useState, useEffect } from 'react'
import { Activity, UserPlus, MessageCircle, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

interface DailyOperationsPanelProps {
  /** Optional growth result data to display */
  growthResult?: {
    newLeadsCount: number
    newFollowUpsCount: number
    newOrdersCount: number
    todayRevenue: number
    recentActivities: string[]
  } | null
  /** Today's calculated dashboard data (for display when no growth just happened) */
  todayNewLeads?: number
  todayFollowUpCount?: number
  todayOrderCount?: number
  todaySales?: number
  /** Whether data was just initialized (show welcome state) */
  justInitialized?: boolean
}

export function DailyOperationsPanel({
  growthResult,
  todayNewLeads = 0,
  todayFollowUpCount = 0,
  todayOrderCount = 0,
  todaySales = 0,
  justInitialized = false,
}: DailyOperationsPanelProps) {
  const [activities, setActivities] = useState<string[]>([])
  const [dataInitialized, setDataInitialized] = useState(false)

  useEffect(() => {
    if (growthResult && growthResult.recentActivities.length > 0) {
      setActivities(growthResult.recentActivities.slice(-3))
      setDataInitialized(true)
    } else if (justInitialized) {
      // If data was just initialized, show some sample activities
      setActivities([
        '系统已加载 24 条客户演示数据',
        '看板和报表数据已就绪',
        '欢迎使用灵语销售中心 — 今日开始经营！',
      ])
      setDataInitialized(true)
    } else if (todayNewLeads > 0 || todayFollowUpCount > 0 || todayOrderCount > 0) {
      // Show current state when there's activity
      const acts: string[] = []
      const now = new Date()
      const h = now.getHours().toString().padStart(2, '0')
      const m = now.getMinutes().toString().padStart(2, '0')
      if (todayNewLeads > 0) acts.push(`${h}:${m} 今日新增 ${todayNewLeads} 条客户线索`)
      if (todayFollowUpCount > 0) acts.push(`${h}:${m} 今日完成 ${todayFollowUpCount} 条跟进记录`)
      if (todayOrderCount > 0) acts.push(`${h}:${m} 今日新增 ${todayOrderCount} 笔订单，销售额 ¥${todaySales}`)
      if (acts.length > 0) {
        setActivities(acts.slice(-3))
        setDataInitialized(true)
      }
    }
  }, [growthResult, justInitialized, todayNewLeads, todayFollowUpCount, todayOrderCount, todaySales])

  const displayNewLeads = growthResult?.newLeadsCount ?? todayNewLeads
  const displayFollowUps = growthResult?.newFollowUpsCount ?? todayFollowUpCount
  const displayOrders = growthResult?.newOrdersCount ?? todayOrderCount
  const displayRevenue = growthResult?.todayRevenue ?? todaySales

  if (!dataInitialized && displayNewLeads === 0 && displayFollowUps === 0 && displayOrders === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Activity size={16} className="text-orange-500" />
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">今日经营动态</span>
        <span className="text-[10px] text-zinc-400 ml-auto">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800">
        <StatItem icon={<UserPlus size={14} />} label="今日线索" value={displayNewLeads} color="text-blue-500" />
        <StatItem icon={<MessageCircle size={14} />} label="跟进记录" value={displayFollowUps} color="text-amber-500" />
        <StatItem icon={<ShoppingCart size={14} />} label="新增订单" value={displayOrders} color="text-green-500" />
        <StatItem icon={<DollarSign size={14} />} label="销售额" value={`¥${displayRevenue.toLocaleString()}`} color="text-orange-500" />
      </div>

      {/* Recent activities */}
      {activities.length > 0 && (
        <div className="px-4 py-3 space-y-1.5">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">最近动态</p>
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
              <span>{activity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 px-3 py-2.5 flex items-center gap-2">
      <span className={`${color} shrink-0`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{label}</p>
        <p className={`text-sm font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  )
}
