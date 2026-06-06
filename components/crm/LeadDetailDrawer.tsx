'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Phone, MessageCircle, MapPin, Star, Tag, Calendar, RefreshCw, Loader2, Sparkles, Copy, Check } from 'lucide-react'
import type { CustomerLead, FollowUpRecord, SalesOrder, AfterSalesRecord, FollowUpSuggestion, ProductRecommendation } from '@/lib/types/crm'
import { listByLeadId as listFollowUps, addFollowUp } from '@/lib/repositories/followups-repository'
import { listByLeadId as listOrders, createOrder } from '@/lib/repositories/orders-repository'
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

/** Generate a tag-aware follow-up script client-side (no API call needed) */
function getTagBasedFollowUpScript(lead: CustomerLead): FollowUpSuggestion {
  const name = lead.name
  const product = lead.interestedProduct || '水果产品'

  // Price-sensitive customers
  if (lead.tags.includes('price_sensitive')) {
    return {
      suggestedMessage: `${name}您好！我们${product}现在有优惠活动，下单包邮且享受坏果包赔保障。如果您批量购买还可以额外优惠，性价比非常高！方便的话我给您发一下今日特价信息～`,
      followUpReason: '价格敏感客户，强调优惠力度和售后保障可提高转化率',
      recommendedAction: '发送优惠信息、包邮政策和坏果包赔说明',
    }
  }

  // Gift customers
  if (lead.tags.includes('gift_customer')) {
    return {
      suggestedMessage: `${name}您好！关于${product}，我们的礼盒包装非常精美，支持代写贺卡和定制礼袋，无论是送长辈、送客户还是送朋友都非常体面。现在下单还能赶在节日前到货，需要我给您发一下包装效果图吗？`,
      followUpReason: '送礼客户，重点强调包装品质和节日配送时效',
      recommendedAction: '发送礼盒包装图片，确认配送时间是否赶得上节日',
    }
  }

  // Wholesale customers
  if (lead.tags.includes('wholesale')) {
    return {
      suggestedMessage: `${name}您好！关于${product}的批量采购，我们可以提供稳定的供货和优惠的批发价格。产地直发，物流效率有保障。方便的话您告诉我大概的采购量和规格要求，我给您做一份详细报价单。`,
      followUpReason: '批发客户，重点强调稳定供货、批量价格和物流效率',
      recommendedAction: '了解采购量和规格，制作详细报价单',
    }
  }

  // Old / returning customers
  if (lead.tags.includes('old_customer') || lead.status === 'repurchase_pending') {
    return {
      suggestedMessage: `${name}您好！老客户好久不见～最近我们又到了一批新品，品质一如既往的好。作为老客户，您有专属的复购优惠价，要不要看看最近有什么感兴趣的？`,
      followUpReason: '老客户有复购潜力，强调专属优惠和新品推荐',
      recommendedAction: '发送新品推荐和老客户优惠信息',
    }
  }

  // After-sales sensitive
  if (lead.tags.includes('after_sales_sensitive')) {
    return {
      suggestedMessage: `${name}您好！关于${product}的售后保障请您放心，我们承诺坏果包赔、物流全程可追踪。如果到货有任何问题，随时联系我第一时间处理～`,
      followUpReason: '售后敏感客户，重点消除售后顾虑建立信任',
      recommendedAction: '发送售后服务说明，强调坏果包赔和物流追踪',
    }
  }

  // High-value customers
  if (lead.tags.includes('high_value')) {
    return {
      suggestedMessage: `${name}您好！了解到您对我们的${product}感兴趣，我们近期有高品质的新批次到货，口感和卖相都非常好，很多老客户都在回购。如果您有需求，我可以给您优先安排发货～`,
      followUpReason: '高价值客户，强调品质和优先服务',
      recommendedAction: '发送产品详细介绍和实拍图',
    }
  }

  // Festival buyers
  if (lead.tags.includes('festival_buyer')) {
    return {
      suggestedMessage: `${name}您好！节日将至，我们的${product}非常适合作为节日礼品，包装精美、品质上乘。现在下单可以确保节前到货，需要我帮您预留一份吗？`,
      followUpReason: '节日买家，抓住节日消费场景推动决策',
      recommendedAction: '推送节日促销信息，确认送达时间',
    }
  }

  // Default by status
  const statusScripts: Record<string, FollowUpSuggestion> = {
    new: {
      suggestedMessage: `${name}您好！我是果潮联盟的销售顾问。了解到您对我们${product}感兴趣，想跟您详细介绍一下我们的产品和优惠活动，方便聊聊吗？`,
      followUpReason: '新线索需在24小时内跟进，建立初步联系',
      recommendedAction: '微信或电话联系，了解客户具体需求',
    },
    contacted: {
      suggestedMessage: `${name}，上次跟您聊到${product}，不知道您考虑得怎么样了？现在我们有一些新品上市，品质非常好，想邀请您了解一下。`,
      followUpReason: '已联系但未成交，需进一步培养意向',
      recommendedAction: '发送产品资料或样品图片，增强客户信任',
    },
    interested: {
      suggestedMessage: `${name}您好！最近我们${product}到了最好的季节，口感最佳，价格也很有优势。要不要趁现在下单尝一尝？老客户还有额外优惠哦！`,
      followUpReason: '客户有意向但未下单，需推动决策',
      recommendedAction: '发送限时优惠信息，促成下单',
    },
    ordered: {
      suggestedMessage: `${name}，感谢您的订单！您的${product}已经开始安排发货了，到货后如果有任何问题随时联系我。期待您的反馈！`,
      followUpReason: '已下单客户需要售后关怀，维护关系',
      recommendedAction: '确认收货情况，收集使用反馈',
    },
    repurchase_pending: {
      suggestedMessage: `${name}，您好！上次购买的${product}应该吃得差不多了吧？现在我们又到了一批新品，品质一如既往的好，老客户复购有专属优惠价，要不要再来一单？`,
      followUpReason: '老客户有复购潜力，需及时触达',
      recommendedAction: '发送新品推荐和老客户优惠信息',
    },
    lost: {
      suggestedMessage: `${name}，好久不见！我们最近推出了很多新品和优惠活动，不知道您是否还有水果方面的需求？很想有机会再次为您服务！`,
      followUpReason: '挽回流失客户，了解流失原因',
      recommendedAction: '了解客户最近需求，提供专属优惠',
    },
  }

  return statusScripts[lead.status] || statusScripts.new
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

  const [copiedScript, setCopiedScript] = useState(false)

  useEffect(() => {
    if (lead) {
      const freshFollowUps = listFollowUps(lead.id)
      const freshOrders = listOrders(lead.id)
      setFollowUps(freshFollowUps)
      setOrders(freshOrders)
      setAfterSales([])
      setActiveTab('info')
      setCopiedScript(false)

      // Show tag-based follow-up script immediately (no API call needed)
      const tagScript = getTagBasedFollowUpScript(lead)
      setAiSuggestion(tagScript)

      // Also fetch AI-enhanced suggestion from API in background
      ;(async () => {
        try {
          const res = await fetch('/api/crm/follow-up-suggestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead, recentFollowUps: freshFollowUps, recentOrders: freshOrders }),
          })
          const data = await res.json()
          if (data.suggestion?.suggestedMessage) {
            setAiSuggestion(data.suggestion)
          }
        } catch {
          // Tag-based fallback already set above
        }
      })()
    }
  }, [lead?.id])

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

              {/* AI Suggestions — auto-displayed with tag-aware scripts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      AI 智能跟进建议
                    </span>
                    {loadingAi && <Loader2 size={12} className="animate-spin text-zinc-400" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={loadProductRecommendation}
                      disabled={loadingAi}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                      title="AI 产品推荐"
                    >
                      <RefreshCw size={10} />
                      产品推荐
                    </button>
                    <button
                      onClick={loadAiSuggestion}
                      disabled={loadingAi}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 disabled:opacity-50 transition-colors"
                      title="刷新AI建议"
                    >
                      <RefreshCw size={10} />
                      刷新
                    </button>
                  </div>
                </div>

                {aiSuggestion && (
                  <div className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4">
                    {/* Copyable script — the main attraction */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">📋 快捷话术（点击复制到微信）：</p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(aiSuggestion.suggestedMessage)
                          setCopiedScript(true)
                          setTimeout(() => setCopiedScript(false), 2000)
                        } catch { /* fallback handled below */ }
                      }}
                      className="w-full text-left bg-white dark:bg-zinc-900/50 rounded-lg p-3 border border-orange-200 dark:border-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
                          {aiSuggestion.suggestedMessage}
                        </p>
                        <span className={`shrink-0 mt-0.5 ${copiedScript ? 'text-green-500' : 'text-zinc-400 group-hover:text-orange-500'} transition-colors`}>
                          {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                        </span>
                      </div>
                    </button>

                    <div className="mt-3 flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">跟进理由</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{aiSuggestion.followUpReason}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">建议操作</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{aiSuggestion.recommendedAction}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(aiSuggestion.suggestedMessage)
                            setCopiedScript(true)
                            setTimeout(() => setCopiedScript(false), 2000)
                          } catch {
                            const ta = document.createElement('textarea')
                            ta.value = aiSuggestion.suggestedMessage
                            document.body.appendChild(ta)
                            ta.select()
                            document.execCommand('copy')
                            document.body.removeChild(ta)
                            setCopiedScript(true)
                            setTimeout(() => setCopiedScript(false), 2000)
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        {copiedScript ? <Check size={12} /> : <Copy size={12} />}
                        {copiedScript ? '已复制' : '复制话术到微信'}
                      </button>
                      <button
                        onClick={() => { if (aiSuggestion) handleAddFollowUp(aiSuggestion.suggestedMessage) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <MessageCircle size={12} />
                        保存为跟进记录
                      </button>
                    </div>
                  </div>
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
