import { NextResponse } from 'next/server'
import type { DashboardData } from '@/lib/types/crm'

export async function GET() {
  try {
    // In production, calculate from database
    // Client-side CRM uses localStorage repositories directly
    const dashboard: DashboardData = {
      totalLeads: 0,
      newLeadsToday: 0,
      convertedLeads: 0,
      conversionRate: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      repeatCustomers: 0,
      pendingFollowUps: 0,
      leadsBySource: {},
      leadsByStatus: {},
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('GET /api/crm/dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
