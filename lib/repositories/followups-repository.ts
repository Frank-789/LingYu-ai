import type { FollowUpRecord } from '@/lib/types/crm'

const STORAGE_KEY = 'lingyu-followups'

function loadAll(): FollowUpRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(records: FollowUpRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* quota exceeded */ }
}

export function listByLeadId(leadId: string): FollowUpRecord[] {
  return loadAll()
    .filter(r => r.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addFollowUp(record: Omit<FollowUpRecord, 'id' | 'createdAt'>): FollowUpRecord {
  const newRecord: FollowUpRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const records = loadAll()
  records.push(newRecord)
  saveAll(records)
  return newRecord
}

export function listAllFollowUps(): FollowUpRecord[] {
  return loadAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
