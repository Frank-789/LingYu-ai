import { NextRequest, NextResponse } from 'next/server'
import { generateFollowUpSuggestion } from '@/lib/services/crm-ai-service'
import type { CustomerLead, FollowUpRecord, SalesOrder } from '@/lib/types/crm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead, recentFollowUps, recentOrders } = body as {
      lead: CustomerLead
      recentFollowUps: FollowUpRecord[]
      recentOrders: SalesOrder[]
    }

    if (!lead || !lead.name) {
      return NextResponse.json({ error: '缺少客户信息' }, { status: 400 })
    }

    const suggestion = await generateFollowUpSuggestion(
      lead,
      recentFollowUps || [],
      recentOrders || []
    )

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('POST /api/crm/follow-up-suggestion error:', error)
    return NextResponse.json({ error: '生成跟进建议失败' }, { status: 500 })
  }
}
