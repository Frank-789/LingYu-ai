'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Plus, Kanban, Table2, Menu, RotateCcw } from 'lucide-react'
import type { CustomerLead, LeadStatus, DashboardData } from '@/lib/types/crm'
import { listLeads, createLead, updateLeadStatus } from '@/lib/repositories/leads-repository'
import { getDashboardStats } from '@/lib/repositories/orders-repository'
import { SalesMetricsCards } from '@/components/crm/SalesMetricsCards'
import { LeadForm } from '@/components/crm/LeadForm'
import { LeadTable } from '@/components/crm/LeadTable'
import { LeadKanban } from '@/components/crm/LeadKanban'
import { LeadDetailDrawer } from '@/components/crm/LeadDetailDrawer'
import { DailyOperationsPanel } from '@/components/crm/DailyOperationsPanel'
import { TodayFollowUpPanel } from '@/components/crm/TodayFollowUpPanel'
import { initDemoData, runDailyGrowth, restoreDemoData } from '@/lib/demo-data'
import type { DailyGrowthResult } from '@/lib/demo-data'

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
  const [growthResult, setGrowthResult] = useState<DailyGrowthResult | null>(null)
  const [justInitialized, setJustInitialized] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const initialized = useRef(false)

  const refreshLeads = useCallback(() => {
    setLeads(listLeads())
  }, [])

  // Initialize demo data and run daily growth on first mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Seed demo data if no data exists
    const initialized_ = initDemoData()
    if (initialized_) {
      setJustInitialized(true)
    }

    // Run daily growth (only once per day)
    const growth = runDailyGrowth()
    if (growth) {
      setGrowthResult(growth)
    }

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

  const handleRestoreDemo = () => {
    restoreDemoData()
    setShowRestoreConfirm(false)
    setGrowthResult(null)
    setJustInitialized(true)
    refreshLeads()
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
          <span className="font-semibold text-sm">销售中心</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">客户管理与销售转化</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Restore demo data button — subtle */}
          <button
            onClick={() => setShowRestoreConfirm(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="恢复演示数据"
          >
            <RotateCcw size={14} />
          </button>
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

      {/* Restore confirmation modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">恢复演示数据</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              此操作将清除所有当前客户数据，并重新填充 24 条演示数据。此操作不可撤销，确定继续吗？
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRestoreDemo}
                className="px-4 py-2 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <SalesMetricsCards data={dashboard} />

        {/* Today's Operations Panel */}
        <DailyOperationsPanel
          growthResult={growthResult}
          todayNewLeads={dashboard.newLeadsToday}
          todayFollowUpCount={dashboard.pendingFollowUps}
          todayOrderCount={dashboard.convertedLeads}
          todaySales={dashboard.totalRevenue}
          justInitialized={justInitialized}
        />

        {/* Today's Follow-up List */}
        <TodayFollowUpPanel
          leads={leads}
          onSelectLead={handleSelectLead}
        />

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
