import type { SalesOrder } from '@/lib/types/crm'

const STORAGE_KEY = 'lingyu-orders'

function loadAll(): SalesOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(orders: SalesOrder[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch { /* quota exceeded */ }
}

export function listOrders(): SalesOrder[] {
  return loadAll().sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function getOrder(id: string): SalesOrder | undefined {
  return loadAll().find(o => o.id === id)
}

export function saveOrder(order: SalesOrder): SalesOrder {
  const orders = loadAll()
  const index = orders.findIndex(o => o.id === order.id)
  if (index >= 0) {
    orders[index] = order
  } else {
    orders.push({
      ...order,
      id: order.id || crypto.randomUUID(),
    })
  }
  saveAll(orders)
  return order
}

export function createOrder(data: Omit<SalesOrder, 'id'>): SalesOrder {
  const order: SalesOrder = {
    ...data,
    id: crypto.randomUUID(),
  }
  const orders = loadAll()
  orders.push(order)
  saveAll(orders)
  return order
}

export function listByLeadId(leadId: string): SalesOrder[] {
  return loadAll()
    .filter(o => o.leadId === leadId)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function getDashboardStats(): {
  totalRevenue: number
  averageOrderValue: number
  conversionCount: number
  repeatCustomers: number
} {
  const orders = loadAll().filter(o => o.orderStatus !== 'refunded')
  if (orders.length === 0) {
    return { totalRevenue: 0, averageOrderValue: 0, conversionCount: 0, repeatCustomers: 0 }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)
  const averageOrderValue = Math.round(totalRevenue / orders.length)

  // Count customers who ordered more than once
  const orderCounts: Record<string, number> = {}
  for (const o of orders) {
    orderCounts[o.leadId] = (orderCounts[o.leadId] || 0) + 1
  }
  const repeatCustomers = Object.values(orderCounts).filter(c => c > 1).length

  return {
    totalRevenue,
    averageOrderValue,
    conversionCount: orders.length,
    repeatCustomers,
  }
}
