'use client'

import { Users, UserPlus, TrendingUp, DollarSign, Target, Repeat } from 'lucide-react'
import type { DashboardData } from '@/lib/types/crm'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  accent?: string
}

function MetricCard({ title, value, icon, accent = 'text-orange-500' }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4 transition-colors">
      <div className={`w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{title}</p>
        <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
      </div>
    </div>
  )
}

export function SalesMetricsCards({ data }: { data: DashboardData }) {
  const metrics = [
    {
      title: '今日新增线索',
      value: data.newLeadsToday,
      icon: <UserPlus size={18} />,
    },
    {
      title: '待跟进客户',
      value: data.pendingFollowUps,
      icon: <Users size={18} />,
    },
    {
      title: '本月成交',
      value: data.convertedLeads,
      icon: <TrendingUp size={18} />,
    },
    {
      title: '本月销售额',
      value: `¥${data.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={18} />,
    },
    {
      title: '转化率',
      value: `${data.conversionRate}%`,
      icon: <Target size={18} />,
    },
    {
      title: '复购客户',
      value: data.repeatCustomers,
      icon: <Repeat size={18} />,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  )
}
