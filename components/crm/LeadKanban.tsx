'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { CustomerLead, LeadStatus } from '@/lib/types/crm'
import { LeadCard } from './LeadCard'

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new', label: '新线索', color: 'border-t-blue-500' },
  { status: 'contacted', label: '已联系', color: 'border-t-amber-500' },
  { status: 'interested', label: '有意向', color: 'border-t-green-500' },
  { status: 'ordered', label: '已下单', color: 'border-t-orange-500' },
  { status: 'repurchase_pending', label: '待复购', color: 'border-t-purple-500' },
  { status: 'lost', label: '已流失', color: 'border-t-zinc-500' },
]

// Define prior and next status for navigation
const statusFlow: LeadStatus[] = ['new', 'contacted', 'interested', 'ordered', 'repurchase_pending', 'lost']

interface LeadKanbanProps {
  leads: CustomerLead[]
  onSelectLead: (lead: CustomerLead) => void
  onMoveLead: (leadId: string, newStatus: LeadStatus) => void
}

export function LeadKanban({ leads, onSelectLead, onMoveLead }: LeadKanbanProps) {
  const groupedLeads = useMemo(() => {
    const groups: Record<string, CustomerLead[]> = {}
    for (const col of columns) {
      groups[col.status] = leads.filter((l) => l.status === col.status)
    }
    return groups
  }, [leads])

  const getPrevStatus = (current: LeadStatus): LeadStatus | null => {
    const idx = statusFlow.indexOf(current)
    return idx > 0 ? statusFlow[idx - 1] : null
  }

  const getNextStatus = (current: LeadStatus): LeadStatus | null => {
    const idx = statusFlow.indexOf(current)
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-[900px]">
        {columns.map((col) => {
          const columnLeads = groupedLeads[col.status] || []

          return (
            <div
              key={col.status}
              className={`flex-1 min-w-[140px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl border-t-2 ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {col.label}
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[100px]">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">暂无数据</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <div key={lead.id} className="relative group">
                      <LeadCard
                        lead={lead}
                        onClick={() => onSelectLead(lead)}
                      />
                      {/* Move buttons */}
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {getPrevStatus(lead.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onMoveLead(lead.id, getPrevStatus(lead.status)!)
                            }}
                            className="p-1 rounded bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                            title="移到上一阶段"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {getNextStatus(lead.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onMoveLead(lead.id, getNextStatus(lead.status)!)
                            }}
                            className="p-1 rounded bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                            title="移到下一阶段"
                          >
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
