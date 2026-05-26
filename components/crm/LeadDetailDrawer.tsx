'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Phone, MessageCircle, MapPin, Star, Tag, Calendar, RefreshCw, Loader2 } from 'lucide-react'
import type { CustomerLead, FollowUpRecord, SalesOrder, AfterSalesRecord, FollowUpSuggestion, ProductRecommendation } from '@/lib/types/crm'
import { listByLeadId as listFollowUps, addFollowUp } from '@/lib/repositories/followups-repository'
import { listByLeadId as listOrders, createOrder } from '@/lib/repositories/orders-repository'
import { FollowUpSuggestionCard } from './FollowUpSuggestionCard'
import { OrderList } from './OrderList'
import { AfterSalesList } from './AfterSalesList'

const statusLabels: Record<string, string> = {
  new: '新线索',
  contacted: '已联系',
  interested: '有意向',
  ordered: '已下单',
  repurchase_pending: '待复购',
  lost: '已流失',
}

const sourceLabels: Record<string, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
  wechat: '微信',
  offline: '线下',
  referral: '推荐',
  video: '视频号',
  other: '其他',
}

const tagLabels: Record<string, string> = {
  high_value: '高价值客户',
  gift_customer: '送礼客户',
  wholesale: '批发客户',
  old_customer: '老客户',
  price_sensitive: '价格敏感',
  festival_buyer: '节日买家',
  after_sales_sensitive: '售后敏感',
}

interface LeadDetailDrawerProps {
  lead: CustomerLead | null
  open: boolean
  onClose: () => void
}

export function LeadDetailDrawer({ lead, open, onClose }: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'followups' | 'orders' | 'aftersales'>('info')
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([])
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [afterSales, setAfterSales] = useState<AfterSalesRecord[]>([])
  const [aiSuggestion, setAiSuggestion] = useState<FollowUpSuggestion | null>(null)
  const [productRecommendation, setProductRecommendation] = useState<ProductRecommendation | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [newFollowUpContent, setNewFollowUpContent] = useState('')
  const [newFollowUpMethod, setNewFollowUpMethod] = useState<FollowUpRecord['method']>('wechat')

  useEffect(() => {
    if (lead) {
      setFollowUps(listFollowUps(lead.id))
      setOrders(listOrders(lead.id))
      setAfterSales([])
      setAiSuggestion(null)
      setProductRecommendation(null)
      setActiveTab('info')
    }
  }, [lead])

  const loadAiSuggestion = useCallback(async () => {
    if (!lead) return
    setLoadingAi(true)
    try {
      const response = await fetch('/api/crm/follow-up-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          recentFollowUps: followUps,
          recentOrders: orders,
        }),
      })
      const data = await response.json()
      if (data.suggestion) {
        setAiSuggestion(data.suggestion)
      }
    } catch {
      // Fallback: Use the AI service client-side as fallback
      const { generateFollowUpSuggestion } = await import('@/lib/services/crm-ai-service')
      // Note: this will likely fail due to missing API key on client,
      // but rule-based fallback works client-side
      const suggestion = await generateFollowUpSuggestion(lead, followUps, orders)
      setAiSuggestion(suggestion)
    } finally {
      setLoadingAi(false)
    }
  }, [lead, followUps, orders])

  const loadProductRecommendation = useCallback(async () => {
    if (!lead) return
    setLoadingAi(true)
    try {
      const response = await fetch('/api/crm/product-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      })
      const data = await response.json()
      if (data.recommendation) {
        setProductRecommendation(data.recommendation)
      }
    } catch {
      const { generateProductRecommendation } = await import('@/lib/services/crm-ai-service')
      const rec = await generateProductRecommendation(lead)
      setProductRecommendation(rec)
    } finally {
      setLoadingAi(false)
    }
  }, [lead])

  const handleAddFollowUp = (message?: string) => {
    if (!lead) return
    const content = message || newFollowUpContent
    if (!content.trim()) return

    const record = addFollowUp({
      leadId: lead.id,
      method: newFollowUpMethod,
      content: content.trim(),
      aiSuggestion: message || undefined,
    })

    setFollowUps((prev) => [record, ...prev])
    setNewFollowUpContent('')
  }

  const handleAddOrder = (orderData: Omit<SalesOrder, 'id'>) => {
    if (!lead) return
    const order = createOrder({
      ...orderData,
      leadId: lead.id,
    })
    setOrders((prev) => [order, ...prev])
  }

  if (!open || !lead) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 truncate">
              {lead.name}
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {statusLabels[lead.status] || lead.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {([
            { key: 'info' as const, label: '基本信息' },
            { key: 'followups' as const, label: '跟进记录' },
            { key: 'orders' as const, label: '订单记录' },
            { key: 'aftersales' as const, label: '售后记录' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-orange-500'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tab: Basic Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={<Phone size={14} />} label="手机号" value={lead.phone || '-'} />
                <InfoItem icon={<MessageCircle size={14} />} label="微信" value={lead.wechat || '-'} />
                <InfoItem icon={<MapPin size={14} />} label="来源" value={sourceLabels[lead.source] || lead.source} />
                <InfoItem icon={<Star size={14} />} label="意向等级" value={`${lead.intentionLevel}/5`} />
                <InfoItem icon={<Calendar size={14} />} label="创建时间" value={new Date(lead.createdAt).toLocaleString('zh-CN')} />
                {lead.nextFollowUpAt && (
                  <InfoItem icon={<Calendar size={14} />} label="下次跟进" value={new Date(lead.nextFollowUpAt).toLocaleString('zh-CN')} />
                )}
              </div>

              {/* Interested Product */}
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">意向产品</label>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{lead.interestedProduct || '未指定'}</p>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1.5">标签</label>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.length === 0 ? (
                    <span className="text-xs text-zinc-400">无</span>
                  ) : (
                    lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                      >
                        <Tag size={10} />
                        {tagLabels[tag] || tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Note */}
              {lead.note && (
                <div>
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">备注</label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                    {lead.note}
                  </p>
                </div>
              )}

              {/* AI Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAiSuggestion}
                    disabled={loadingAi}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {loadingAi ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {loadingAi ? '生成中...' : '生成跟进建议'}
                  </button>
                  <button
                    onClick={loadProductRecommendation}
                    disabled={loadingAi}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 disabled:opacity-50 transition-colors"
                  >
                    {loadingAi ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    产品推荐
                  </button>
                </div>

                {aiSuggestion && (
                  <FollowUpSuggestionCard
                    suggestion={aiSuggestion}
                    onApply={handleAddFollowUp}
                  />
                )}

                {productRecommendation && (
                  <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-200 dark:border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCw size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        AI 产品推荐
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">推荐产品：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {productRecommendation.recommendedProducts.map((product, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">推荐理由：</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{productRecommendation.recommendationReason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">推荐话术：</p>
                      <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{productRecommendation.suggestedSalesMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Follow Ups */}
          {activeTab === 'followups' && (
            <div>
              {/* Add Follow Up */}
              <div className="mb-4 space-y-2">
                <select
                  value={newFollowUpMethod}
                  onChange={(e) => setNewFollowUpMethod(e.target.value as FollowUpRecord['method'])}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="wechat">微信</option>
                  <option value="phone">电话</option>
                  <option value="sms">短信</option>
                  <option value="offline">线下</option>
                  <option value="other">其他</option>
                </select>
                <textarea
                  value={newFollowUpContent}
                  onChange={(e) => setNewFollowUpContent(e.target.value)}
                  placeholder="录入跟进内容..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                />
                <button
                  onClick={() => handleAddFollowUp()}
                  disabled={!newFollowUpContent.trim()}
                  className="w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  添加跟进记录
                </button>
              </div>

              {/* Follow Up List */}
              {followUps.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">暂无跟进记录</p>
              ) : (
                <div className="space-y-2">
                  {followUps.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {record.method === 'wechat' ? '微信' :
                           record.method === 'phone' ? '电话' :
                           record.method === 'sms' ? '短信' :
                           record.method === 'offline' ? '线下' : '其他'}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(record.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{record.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <OrderList orders={orders} onAddOrder={handleAddOrder} />
          )}

          {/* Tab: After Sales */}
          {activeTab === 'aftersales' && (
            <AfterSalesList
              records={afterSales}
              onAddRecord={(record) => {
                const newRecord: AfterSalesRecord = {
                  ...record,
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                }
                setAfterSales((prev) => [newRecord, ...prev])
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-zinc-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{value}</p>
      </div>
    </div>
  )
}
