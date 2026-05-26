import type { CustomerLead, LeadStatus, LeadSource } from '@/lib/types/crm'

const STORAGE_KEY = 'lingyu-leads'

function loadAll(): CustomerLead[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(leads: CustomerLead[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  } catch { /* quota exceeded */ }
}

export function listLeads(filters?: {
  status?: LeadStatus
  source?: LeadSource
  tag?: string
  keyword?: string
}): CustomerLead[] {
  let leads = loadAll()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (filters) {
    if (filters.status) {
      leads = leads.filter(l => l.status === filters.status)
    }
    if (filters.source) {
      leads = leads.filter(l => l.source === filters.source)
    }
    if (filters.tag) {
      leads = leads.filter(l => l.tags.includes(filters.tag as any))
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      leads = leads.filter(l =>
        l.name.toLowerCase().includes(kw) ||
        (l.interestedProduct && l.interestedProduct.toLowerCase().includes(kw)) ||
        (l.phone && l.phone.includes(kw))
      )
    }
  }

  return leads
}

export function getLead(id: string): CustomerLead | undefined {
  return loadAll().find(l => l.id === id)
}

export function saveLead(lead: CustomerLead): CustomerLead {
  const leads = loadAll()
  const index = leads.findIndex(l => l.id === lead.id)
  if (index >= 0) {
    leads[index] = { ...lead, updatedAt: new Date().toISOString() }
  } else {
    leads.push({
      ...lead,
      id: lead.id || crypto.randomUUID(),
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  saveAll(leads)
  return lead
}

export function createLead(data: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt'>): CustomerLead {
  const now = new Date().toISOString()
  const lead: CustomerLead = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  const leads = loadAll()
  leads.push(lead)
  saveAll(leads)
  return lead
}

export function deleteLead(id: string): void {
  const leads = loadAll().filter(l => l.id !== id)
  saveAll(leads)
}

export function updateLeadStatus(leadId: string, newStatus: LeadStatus): CustomerLead | undefined {
  const leads = loadAll()
  const index = leads.findIndex(l => l.id === leadId)
  if (index < 0) return undefined
  leads[index] = { ...leads[index], status: newStatus, updatedAt: new Date().toISOString() }
  saveAll(leads)
  return leads[index]
}
