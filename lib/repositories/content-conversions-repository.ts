import type { ContentConversion } from '@/lib/types/marketing'

const STORAGE_KEY = 'lingyu-conversions'

function loadAll(): ContentConversion[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(events: ContentConversion[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch { /* quota exceeded */ }
}

export function addConversion(event: Omit<ContentConversion, 'id' | 'createdAt'>): ContentConversion {
  const newEvent: ContentConversion = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const events = loadAll()
  events.push(newEvent)
  saveAll(events)
  return newEvent
}

export function getByContentId(contentId: string): ContentConversion[] {
  return loadAll()
    .filter(e => e.contentId === contentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getConversionSummary(): {
  totalViews: number
  totalConsults: number
  totalLeads: number
  totalOrders: number
  perContent: Record<string, { views: number; consults: number; leads: number; orders: number }>
  perPlatform: Record<string, { views: number; consults: number; leads: number; orders: number }>
} {
  const events = loadAll()

  const perContent: Record<string, { views: number; consults: number; leads: number; orders: number }> = {}
  const perPlatform: Record<string, { views: number; consults: number; leads: number; orders: number }> = {}

  let totalViews = 0
  let totalConsults = 0
  let totalLeads = 0
  let totalOrders = 0

  for (const e of events) {
    // Per content
    if (!perContent[e.contentId]) {
      perContent[e.contentId] = { views: 0, consults: 0, leads: 0, orders: 0 }
    }

    // We need platform info - extract from event or use contentId pattern
    // For now, we track per content and derive platform from context

    switch (e.eventType) {
      case 'view':
        totalViews++
        perContent[e.contentId].views++
        break
      case 'consult':
        totalConsults++
        perContent[e.contentId].consults++
        break
      case 'lead_created':
        totalLeads++
        perContent[e.contentId].leads++
        break
      case 'order_created':
        totalOrders++
        perContent[e.contentId].orders++
        break
    }
  }

  return {
    totalViews,
    totalConsults,
    totalLeads,
    totalOrders,
    perContent,
    perPlatform,
  }
}
