import { NextRequest, NextResponse } from 'next/server'
import { generateProductRecommendation } from '@/lib/services/crm-ai-service'
import type { CustomerLead } from '@/lib/types/crm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead, products } = body as {
      lead: CustomerLead
      products?: string[]
    }

    if (!lead || !lead.name) {
      return NextResponse.json({ error: '缺少客户信息' }, { status: 400 })
    }

    const recommendation = await generateProductRecommendation(lead, products)

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('POST /api/crm/product-recommendation error:', error)
    return NextResponse.json({ error: '生成产品推荐失败' }, { status: 500 })
  }
}
