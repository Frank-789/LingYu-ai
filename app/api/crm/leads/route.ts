import { NextRequest, NextResponse } from 'next/server'
import type { CustomerLead, LeadStatus, LeadSource } from '@/lib/types/crm'

// In a production app, this would use a database.
// The leads-repository uses localStorage which is client-only,
// so server-side API returns appropriate responses.
// The CRM page uses the client-side repository directly.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as LeadStatus | null
    const source = searchParams.get('source') as LeadSource | null
    const tag = searchParams.get('tag')
    const keyword = searchParams.get('keyword')

    // Server-side: data would come from database
    // For now, return empty list (client uses localStorage directly)
    return NextResponse.json({
      leads: [],
      filters: { status, source, tag, keyword },
    })
  } catch (error) {
    console.error('GET /api/crm/leads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, wechat, source, interestedProduct, intentionLevel, status, tags, note, nextFollowUpAt } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: '姓名不能为空' }, { status: 400 })
    }

    // In production, save to database
    const lead: CustomerLead = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone,
      wechat,
      source: source || 'other',
      interestedProduct,
      intentionLevel: intentionLevel || 3,
      status: status || 'new',
      tags: tags || [],
      note,
      nextFollowUpAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('POST /api/crm/leads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
