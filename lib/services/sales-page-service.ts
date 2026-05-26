export interface SalesPage {
  id: string
  leadId?: string
  contentId?: string
  productName: string
  price: string
  features: string[]
  origin: string
  logistics: string
  afterSalesPromise: string
  purchaseScript: string
  contactInfo?: string
  createdAt: string
}

export interface CreateSalesPageData {
  leadId?: string
  contentId?: string
  productName: string
  price: string
  features: string[]
  origin: string
  logistics: string
  afterSalesPromise: string
  purchaseScript: string
  contactInfo?: string
}

const STORAGE_KEY = 'lingyu-sales-pages'

function loadAll(): SalesPage[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(pages: SalesPage[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
  } catch { /* quota exceeded */ }
}

export function getSalesPage(id: string): SalesPage | undefined {
  return loadAll().find(p => p.id === id)
}

export function listSalesPages(): SalesPage[] {
  return loadAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createSalesPage(data: CreateSalesPageData): SalesPage {
  const page: SalesPage = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const pages = loadAll()
  pages.push(page)
  saveAll(pages)
  return page
}

export function deleteSalesPage(id: string): void {
  const pages = loadAll().filter(p => p.id !== id)
  saveAll(pages)
}

export function generateSalesPageUrl(pageId: string): string {
  return `/sales-page/${pageId}`
}
