'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Kanban, Table2, Menu } from 'lucide-react'
import type { CustomerLead, LeadStatus, DashboardData } from '@/lib/types/crm'
import { listLeads, createLead, updateLeadStatus } from '@/lib/repositories/leads-repository'
import { getDashboardStats } from '@/lib/repositories/orders-repository'
import { SalesMetricsCards } from '@/components/crm/SalesMetricsCards'
import { LeadForm } from '@/components/crm/LeadForm'
import { LeadTable } from '@/components/crm/LeadTable'
import { LeadKanban } from '@/components/crm/LeadKanban'
import { LeadDetailDrawer } from '@/components/crm/LeadDetailDrawer'

type ViewMode = 'kanban' | 'table'

function calculateDashboard(leads: CustomerLead[]): DashboardData {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const newLeadsToday = leads.filter(l => l.createdAt >= todayStart).length
  const convertedLeads = leads.filter(l => l.status === 'ordered').length
  const totalLeads = leads.length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  const stats = getDashboardStats()

  const pendingFollowUps = leads.filter(l => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= now).length

  const leadsBySource: Record<string, number> = {}
  const leadsByStatus: Record<string, number> = {}

  for (const l of leads) {
    leadsBySource[l.source] = (leadsBySource[l.source] || 0) + 1
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
  }

  return {
    totalLeads,
    newLeadsToday,
    convertedLeads,
    conversionRate,
    totalRevenue: stats.totalRevenue,
    averageOrderValue: stats.averageOrderValue,
    repeatCustomers: stats.repeatCustomers,
    pendingFollowUps,
    leadsBySource,
    leadsByStatus,
  }
}

export default function CrmPage() {
  const [leads, setLeads] = useState<CustomerLead[]>([])
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const refreshLeads = useCallback(() => {
    setLeads(listLeads())
  }, [])

  useEffect(() => {
    refreshLeads()
  }, [refreshLeads])

  const dashboard = useMemo(() => calculateDashboard(leads), [leads])

  const handleCreateLead = (data: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt'>) => {
    createLead(data)
    refreshLeads()
    setShowForm(false)
  }

  const handleMoveLead = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus(leadId, newStatus)
    refreshLeads()
    setSelectedLead((prev) => {
      if (prev && prev.id === leadId) {
        return { ...prev, status: newStatus }
      }
      return prev
    })
  }

  const handleSelectLead = (lead: CustomerLead) => {
    setSelectedLead(lead)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0B] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
            灵
          </div>
          <span className="font-semibold text-sm">CRM</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">销售转化与客户管理</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-700 text-orange-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="看板视图"
            >
              <Kanban size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-orange-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="表格视图"
            >
              <Table2 size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus size={14} />
            新增线索
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <SalesMetricsCards data={dashboard} />

        {/* Kanban or Table */}
        {viewMode === 'kanban' ? (
          <LeadKanban
            leads={leads}
            onSelectLead={handleSelectLead}
            onMoveLead={handleMoveLead}
          />
        ) : (
          <LeadTable
            leads={leads}
            onSelectLead={handleSelectLead}
          />
        )}
      </main>

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          onSave={handleCreateLead}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
}
