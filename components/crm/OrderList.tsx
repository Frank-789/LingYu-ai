'use client'

import { useState } from 'react'
import { Plus, X, Package } from 'lucide-react'
import type { SalesOrder } from '@/lib/types/crm'

const orderStatusLabels: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  refunded: '已退款',
}

const orderStatusColors: Record<string, string> = {
  pending: 'text-amber-500 bg-amber-500/10',
  paid: 'text-blue-500 bg-blue-500/10',
  shipped: 'text-purple-500 bg-purple-500/10',
  completed: 'text-green-500 bg-green-500/10',
  refunded: 'text-red-500 bg-red-500/10',
}

interface OrderListProps {
  orders: SalesOrder[]
  onAddOrder: (order: Omit<SalesOrder, 'id'>) => void
}

export function OrderList({ orders, onAddOrder }: OrderListProps) {
  const [showForm, setShowForm] = useState(false)
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [amount, setAmount] = useState(0)
  const [orderStatus, setOrderStatus] = useState<SalesOrder['orderStatus']>('pending')
  const [expectedRepurchaseDate, setExpectedRepurchaseDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName.trim() || amount <= 0) return

    onAddOrder({
      leadId: orders[0]?.leadId || '',
      productName: productName.trim(),
      quantity,
      amount,
      orderStatus,
      orderDate: new Date().toISOString(),
      expectedRepurchaseDate: expectedRepurchaseDate || undefined,
    })

    setProductName('')
    setQuantity(1)
    setAmount(0)
    setOrderStatus('pending')
    setExpectedRepurchaseDate('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Package size={14} className="text-orange-500" />
          订单记录
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
        >
          <Plus size={14} />
          新增订单
        </button>
      </div>

      {/* Add Order Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="产品名称"
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="数量"
              min={1}
              className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="金额"
              min={0}
              step={0.01}
              className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <div className="col-span-2">
              <input
                type="date"
                value={expectedRepurchaseDate}
                onChange={(e) => setExpectedRepurchaseDate(e.target.value)}
                placeholder="预计复购日期"
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <div className="col-span-2">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as SalesOrder['orderStatus'])}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              >
                <option value="pending">待付款</option>
                <option value="paid">已付款</option>
                <option value="shipped">已发货</option>
                <option value="completed">已完成</option>
                <option value="refunded">已退款</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 rounded-md bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* Order List */}
      {orders.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">暂无订单</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {order.productName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  x{order.quantity} · ¥{order.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${orderStatusColors[order.orderStatus] || ''}`}>
                {orderStatusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
