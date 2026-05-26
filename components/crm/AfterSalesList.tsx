'use client'

import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import type { AfterSalesRecord } from '@/lib/types/crm'

const issueTypeLabels: Record<string, string> = {
  bad_fruit: '坏果问题',
  logistics_delay: '物流延迟',
  refund: '退款',
  resend: '补发',
  complaint: '投诉',
  other: '其他',
}

const statusLabels: Record<string, string> = {
  open: '待处理',
  processing: '处理中',
  resolved: '已解决',
}

const statusColors: Record<string, string> = {
  open: 'text-red-500 bg-red-500/10',
  processing: 'text-amber-500 bg-amber-500/10',
  resolved: 'text-green-500 bg-green-500/10',
}

interface AfterSalesListProps {
  records: AfterSalesRecord[]
  onAddRecord: (record: Omit<AfterSalesRecord, 'id' | 'createdAt'>) => void
}

export function AfterSalesList({ records, onAddRecord }: AfterSalesListProps) {
  const [showForm, setShowForm] = useState(false)
  const [issueType, setIssueType] = useState<AfterSalesRecord['issueType']>('bad_fruit')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<AfterSalesRecord['status']>('open')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    onAddRecord({
      leadId: records[0]?.leadId || '',
      orderId: undefined,
      issueType,
      description: description.trim(),
      status,
    })

    setDescription('')
    setIssueType('bad_fruit')
    setStatus('open')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <AlertCircle size={14} className="text-orange-500" />
          售后记录
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
        >
          <Plus size={14} />
          新增记录
        </button>
      </div>

      {/* Add Record Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as AfterSalesRecord['issueType'])}
              className="col-span-2 w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
              {Object.entries(issueTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="问题描述..."
              rows={2}
              className="col-span-2 w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AfterSalesRecord['status'])}
              className="col-span-2 w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
              <option value="open">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 rounded-md bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">暂无售后记录</p>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {issueTypeLabels[record.issueType] || record.issueType}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[record.status] || ''}`}>
                  {statusLabels[record.status] || record.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{record.description}</p>
              <p className="text-[10px] text-zinc-400 mt-1">
                {new Date(record.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
