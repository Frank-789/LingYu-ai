/**
 * Demo data service for the CRM / Sales Center.
 * Provides 24 realistic customer leads with orders and follow-ups,
 * plus daily growth simulation to make the page feel alive.
 *
 * All data is stored in the same localStorage keys as user-created data,
 * so it integrates seamlessly with existing CRUD operations.
 */

import type { CustomerLead, LeadStatus, LeadSource, CustomerTag, SalesOrder, FollowUpRecord } from '@/lib/types/crm'

const DEMO_INIT_KEY = 'lingyu-demo-initialized'
const DEMO_GROWTH_KEY = 'lingyu-demo-last-growth-date'
const LEADS_KEY = 'lingyu-leads'
const ORDERS_KEY = 'lingyu-orders'
const FOLLOWUPS_KEY = 'lingyu-followups'
const MAX_DEMO_LEADS = 80

// --- Product list ---
const PRODUCTS = [
  '丹东99草莓', '海南贵妃芒', '阳光玫瑰葡萄', '烟台红富士',
  '赣南脐橙', '荔枝礼盒', '蓝莓礼盒', '新疆小白杏',
  '云南蓝莓', '榴莲千层组合', '车厘子礼盒', '沃柑家庭装',
]

// --- Source labels ---
const SOURCE_LABELS: Record<string, string> = {
  douyin: '抖音短视频',
  xiaohongshu: '小红书',
  wechat: '微信私域',
  referral: '老客转介绍',
  offline: '线下活动',
  other: '其他',
}

// --- 24 realistic customer leads ---
function generateDemoLeads(): CustomerLead[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayMs = 86400000

  const leads: CustomerLead[] = [
    // 新线索 (5)
    { id: crypto.randomUUID(), name: '王女士', phone: '138****6789', wechat: 'wangjf89', source: 'wechat', interestedProduct: '丹东99草莓', intentionLevel: 5, status: 'new', tags: ['high_value', 'gift_customer'], note: '准备给公司下午茶采购，关注发货时效', nextFollowUpAt: new Date(today.getTime() - 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 1 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '赵小姐', phone: '158****2341', wechat: 'zhao_ml', source: 'xiaohongshu', interestedProduct: '蓝莓礼盒', intentionLevel: 4, status: 'new', tags: ['gift_customer', 'festival_buyer'], note: '送长辈，关心包装是否体面', nextFollowUpAt: new Date(today.getTime() + 2 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 2 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '刘先生', phone: '136****8901', wechat: 'liuguo', source: 'douyin', interestedProduct: '烟台红富士', intentionLevel: 3, status: 'new', tags: ['wholesale', 'price_sensitive'], note: '水果店老板，问过箱规和批发价', nextFollowUpAt: new Date(today.getTime() + 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 3 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 3 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '孙阿姨', phone: '139****4567', wechat: 'sun_ayi', source: 'wechat', interestedProduct: '沃柑家庭装', intentionLevel: 2, status: 'new', tags: ['price_sensitive'], note: '问过包邮和坏果包赔', nextFollowUpAt: new Date(today.getTime() + 3 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 4 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 4 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '马先生', phone: '152****7890', wechat: 'ma_online', source: 'douyin', interestedProduct: '阳光玫瑰葡萄', intentionLevel: 3, status: 'new', tags: ['high_value'], note: '想了解礼盒装规格和价格', nextFollowUpAt: new Date(today.getTime() - 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 2 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },

    // 已联系 (5)
    { id: crypto.randomUUID(), name: '李小姐', phone: '187****3456', wechat: 'li_xx', source: 'xiaohongshu', interestedProduct: '海南贵妃芒', intentionLevel: 4, status: 'contacted', tags: ['gift_customer'], note: '已发产品图册，说跟家人商量', nextFollowUpAt: new Date(today.getTime() - 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 3 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '吴老板', phone: '133****6789', wechat: 'wu_boss', source: 'referral', interestedProduct: '赣南脐橙', intentionLevel: 4, status: 'contacted', tags: ['wholesale', 'old_customer'], note: '水果店补货，关心批量价和物流', nextFollowUpAt: new Date(today.getTime() + 2 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 5 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '陈女士', phone: '180****9012', wechat: 'chen_nv', source: 'douyin', interestedProduct: '荔枝礼盒', intentionLevel: 3, status: 'contacted', tags: ['gift_customer', 'festival_buyer'], note: '端午送礼，问是否赶得上节前到货', nextFollowUpAt: new Date(today.getTime() - 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 4 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '郑老师', phone: '159****3456', wechat: 'zheng_laoshi', source: 'wechat', interestedProduct: '新疆小白杏', intentionLevel: 2, status: 'contacted', tags: ['price_sensitive'], note: '想买给孩子吃，关注甜度和农残', nextFollowUpAt: new Date(today.getTime() + 4 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 6 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '黄先生', phone: '186****7890', wechat: 'huang_online', source: 'other', interestedProduct: '榴莲千层组合', intentionLevel: 3, status: 'contacted', tags: ['festival_buyer'], note: '公司团建采购，问是否有批量优惠', nextFollowUpAt: new Date(today.getTime() + 2 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 3 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },

    // 有意向 (6)
    { id: crypto.randomUUID(), name: '张先生', phone: '138****1234', wechat: 'zhang_sir', source: 'douyin', interestedProduct: '阳光玫瑰葡萄', intentionLevel: 4, status: 'interested', tags: ['price_sensitive', 'high_value'], note: '问过包邮政策和坏果包赔，有意向团购', nextFollowUpAt: new Date(today.getTime() - 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 7 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '周姐', phone: '150****5678', wechat: 'zhou_jie', source: 'xiaohongshu', interestedProduct: '车厘子礼盒', intentionLevel: 5, status: 'interested', tags: ['high_value', 'gift_customer'], note: '送给客户，关心包装和物流速度', nextFollowUpAt: new Date(today.getTime() + 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 8 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '杨先生', phone: '137****8901', wechat: 'yang_boss', source: 'referral', interestedProduct: '云南蓝莓', intentionLevel: 4, status: 'interested', tags: ['wholesale', 'old_customer'], note: '精品水果店补货，要求稳定供货', nextFollowUpAt: new Date(today.getTime() + 2 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 10 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 3 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '林小姐', phone: '188****2345', wechat: 'lin_xx', source: 'douyin', interestedProduct: '丹东99草莓', intentionLevel: 4, status: 'interested', tags: ['high_value', 'gift_customer'], note: '想订草莓礼盒送闺蜜，关注精美包装', nextFollowUpAt: new Date(today.getTime() + 1 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 5 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '徐老师', phone: '135****6789', wechat: 'xu_laoshi', source: 'wechat', interestedProduct: '赣南脐橙', intentionLevel: 3, status: 'interested', tags: ['old_customer'], note: '去年买过，今年想再买，问新品种', nextFollowUpAt: new Date(today.getTime() + 3 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 14 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 4 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '何总', phone: '139****4567', wechat: 'he_zong', source: 'offline', interestedProduct: '荔枝礼盒', intentionLevel: 5, status: 'interested', tags: ['high_value', 'wholesale'], note: '公司端午福利采购800份，需要报价单', nextFollowUpAt: new Date(today.getTime() + 2 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 6 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },

    // 已下单 (5)
    { id: crypto.randomUUID(), name: '王总', phone: '136****1122', wechat: 'wang_zong', source: 'other', interestedProduct: '荔枝礼盒', intentionLevel: 5, status: 'ordered', tags: ['high_value', 'gift_customer'], note: '公司端午送礼已采购，关注配送时间', nextFollowUpAt: new Date(today.getTime() + 7 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 12 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 3 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '秦女士', phone: '185****3344', wechat: 'qin_shop', source: 'douyin', interestedProduct: '蓝莓礼盒', intentionLevel: 4, status: 'ordered', tags: ['old_customer', 'gift_customer'], note: '复购客户，上次蓝莓口感满意', nextFollowUpAt: new Date(today.getTime() + 14 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 20 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 4 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '唐先生', phone: '139****5566', wechat: 'tang_mr', source: 'referral', interestedProduct: '阳光玫瑰葡萄', intentionLevel: 4, status: 'ordered', tags: ['wholesale', 'price_sensitive'], note: '餐饮店采购，每周稳定补货', nextFollowUpAt: new Date(today.getTime() + 5 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 15 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '宋小姐', phone: '187****7788', wechat: 'song_xx', source: 'xiaohongshu', interestedProduct: '车厘子礼盒', intentionLevel: 5, status: 'ordered', tags: ['gift_customer', 'festival_buyer'], note: '父亲节礼物，要求精美包装', nextFollowUpAt: new Date(today.getTime() + 10 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 9 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 1 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '冯先生', phone: '158****9900', wechat: 'feng', source: 'wechat', interestedProduct: '榴莲千层组合', intentionLevel: 3, status: 'ordered', tags: ['price_sensitive'], note: '第一次买榴莲产品，关注售后保障', nextFollowUpAt: new Date(today.getTime() + 3 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 7 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 2 * dayMs).toISOString() },

    // 待复购 (2)
    { id: crypto.randomUUID(), name: '韩姐', phone: '136****2233', wechat: 'han_jie', source: 'xiaohongshu', interestedProduct: '海南贵妃芒', intentionLevel: 5, status: 'repurchase_pending', tags: ['old_customer', 'high_value'], note: '多次购买贵妃芒，本月应该会复购', nextFollowUpAt: new Date(today.getTime() + 5 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 45 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 5 * dayMs).toISOString() },
    { id: crypto.randomUUID(), name: '曹老师', phone: '189****6677', wechat: 'cao_edu', source: 'referral', interestedProduct: '烟台红富士', intentionLevel: 4, status: 'repurchase_pending', tags: ['old_customer', 'wholesale'], note: '学校食堂供应商，定期采购水果', nextFollowUpAt: new Date(today.getTime() + 7 * dayMs).toISOString(), createdAt: new Date(today.getTime() - 60 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 10 * dayMs).toISOString() },

    // 已流失 (1)
    { id: crypto.randomUUID(), name: '钱先生', phone: '151****4455', wechat: 'qian', source: 'douyin', interestedProduct: '沃柑家庭装', intentionLevel: 2, status: 'lost', tags: ['price_sensitive', 'after_sales_sensitive'], note: '上次物流慢了3天，坏果赔偿后不再购买', nextFollowUpAt: undefined, createdAt: new Date(today.getTime() - 90 * dayMs).toISOString(), updatedAt: new Date(today.getTime() - 30 * dayMs).toISOString() },
  ]

  return leads
}

// --- Generate demo orders ---
function generateDemoOrders(leads: CustomerLead[]): SalesOrder[] {
  const orders: SalesOrder[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayMs = 86400000

  for (const lead of leads) {
    if (lead.status === 'ordered' || lead.status === 'repurchase_pending' || lead.status === 'lost') {
      const product = lead.interestedProduct || PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]

      // First order
      orders.push({
        id: crypto.randomUUID(),
        leadId: lead.id,
        productName: product,
        quantity: 1,
        amount: getRandomPrice(product),
        orderStatus: ['paid', 'shipped', 'completed'][Math.floor(Math.random() * 3)] as SalesOrder['orderStatus'],
        orderDate: new Date(today.getTime() - Math.floor(Math.random() * 20 + 5) * dayMs).toISOString(),
      })

      // Some have a second order (for repeat customers)
      if (lead.status === 'repurchase_pending' || Math.random() > 0.6) {
        orders.push({
          id: crypto.randomUUID(),
          leadId: lead.id,
          productName: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
          quantity: Math.floor(Math.random() * 3) + 1,
          amount: getRandomPrice(product) * (Math.floor(Math.random() * 2) + 1),
          orderStatus: 'completed',
          orderDate: new Date(today.getTime() - Math.floor(Math.random() * 40 + 20) * dayMs).toISOString(),
          expectedRepurchaseDate: lead.status === 'repurchase_pending' ? new Date(today.getTime() + 14 * dayMs).toISOString() : undefined,
        })
      }
    }
  }

  return orders
}

// --- Generate initial demo follow-ups ---
function generateDemoFollowUps(leads: CustomerLead[]): FollowUpRecord[] {
  const records: FollowUpRecord[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayMs = 86400000

  const followUpTemplates = [
    '已发送产品图册和价格清单',
    '客户表示需要跟家人商量',
    '已回复客户关于包邮的疑问',
    '已发送坏果包赔说明',
    '客户询问批发价，已报价',
    '已确认礼盒规格和包装要求',
    '客户关心发货时效，已说明当天发货',
    '已发送端午礼盒促销信息',
    '回访确认收货，客户表示满意',
    '老客户询问本周新品，已推荐',
    '已发送物流单号给客户',
    '客户表示晚上付款',
    '已确认团购数量和配送地址',
    '发送了复购优惠券链接',
  ]

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i]
    const count = lead.status === 'lost' ? 2 : Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < count; j++) {
      records.push({
        id: crypto.randomUUID(),
        leadId: lead.id,
        method: (['wechat', 'phone', 'wechat', 'wechat'] as const)[Math.floor(Math.random() * 4)],
        content: followUpTemplates[Math.floor(Math.random() * followUpTemplates.length)],
        createdAt: new Date(today.getTime() - Math.floor(Math.random() * 14 + 1) * dayMs).toISOString(),
      })
    }
  }

  return records
}

// --- Helper: get realistic price for a product ---
function getRandomPrice(product: string): number {
  if (product.includes('礼盒')) return Math.floor(Math.random() * 200 + 198)
  if (product.includes('千层')) return Math.floor(Math.random() * 100 + 88)
  if (product.includes('榴莲')) return Math.floor(Math.random() * 100 + 88)
  if (product.includes('草莓')) return Math.floor(Math.random() * 80 + 59)
  if (product.includes('车厘子')) return Math.floor(Math.random() * 200 + 198)
  if (product.includes('蓝莓')) return Math.floor(Math.random() * 100 + 68)
  // Family pack
  if (product.includes('家庭装') || product.includes('沃柑')) return Math.floor(Math.random() * 60 + 39)
  return Math.floor(Math.random() * 100 + 49)
}

// --- Daily growth data generation ---
interface DailyGrowthResult {
  newLeadsCount: number
  newFollowUpsCount: number
  newOrdersCount: number
  todayRevenue: number
  recentActivities: string[]
  todayLeadsAdded: CustomerLead[]
  todayFollowUpsAdded: FollowUpRecord[]
  todayOrdersAdded: SalesOrder[]
}

function generateDailyGrowth(today: Date): DailyGrowthResult {
  const dayMs = 86400000
  const result: DailyGrowthResult = {
    newLeadsCount: 0,
    newFollowUpsCount: 0,
    newOrdersCount: 0,
    todayRevenue: 0,
    recentActivities: [],
    todayLeadsAdded: [],
    todayFollowUpsAdded: [],
    todayOrdersAdded: [],
  }

  // Add 2-5 new leads
  const newLeads = Math.floor(Math.random() * 4) + 2
  const names = ['魏女士', '蒋先生', '沈小姐', '金老板', '许老师', '苏阿姨', '潘先生', '任先生']
  const sources: LeadSource[] = ['douyin', 'xiaohongshu', 'wechat', 'referral', 'offline', 'other']
  const sourceCount: Record<string, number> = {}
  const hour = today.getHours()

  for (let i = 0; i < newLeads && i < names.length; i++) {
    const name = names[i]
    const source = sources[i % sources.length]
    sourceCount[source] = (sourceCount[source] || 0) + 1
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
    const level = (Math.floor(Math.random() * 3) + 2) as 1 | 2 | 3 | 4 | 5
    const tagsPool: CustomerTag[][] = [
      ['high_value'], ['price_sensitive'], ['gift_customer'], ['old_customer'], ['wholesale', 'price_sensitive'], ['festival_buyer'],
    ]
    const tags = tagsPool[Math.floor(Math.random() * tagsPool.length)]

    const createdAt = new Date(today.getTime() + Math.floor(Math.random() * 3600000 * 8) + 3600000 * 9)

    const lead: CustomerLead = {
      id: crypto.randomUUID(),
      name,
      phone: `${1}${Math.floor(Math.random() * 9 + 3)}****${Math.floor(Math.random() * 9000 + 1000)}`,
      source,
      interestedProduct: product,
      intentionLevel: level,
      status: 'new',
      tags,
      note: `今日新线索，通过${SOURCE_LABELS[source] || source}渠道获取`,
      nextFollowUpAt: new Date(today.getTime() + dayMs * (Math.floor(Math.random() * 3) + 1)).toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    }

    result.todayLeadsAdded.push(lead)
    result.newLeadsCount++

    // Generate activity log
    const hourStr = `${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`
    result.recentActivities.push(`${hourStr} ${SOURCE_LABELS[source] || source}新增线索：${name}咨询${product}`)
  }

  // Add 3-8 follow-up records
  const newFollowUps = Math.floor(Math.random() * 6) + 3
  const followUpTemplates = [
    '已发送今日到货提醒',
    '已确认礼盒规格',
    '客户表示晚上付款',
    '已发送坏果包赔说明',
    '老客户询问本周新品',
    '已发送促销活动信息',
    '回访确认收货情况',
    '已推送今日到货水果',
    '已回复物流追踪问题',
    '已发送复购优惠券',
    '提醒客户端午节备货',
  ]
  const followUpHour = Math.floor(Math.random() * 8) + 9
  const followUpMinute = Math.floor(Math.random() * 60)

  for (let i = 0; i < newFollowUps; i++) {
    const template = followUpTemplates[Math.floor(Math.random() * followUpTemplates.length)]
    const ft = new Date(today.getTime() + (followUpHour + i) * 3600000 + followUpMinute * 60000)
    const record: FollowUpRecord = {
      id: crypto.randomUUID(),
      leadId: crypto.randomUUID(), // Will be replaced when assigning to real leads
      method: 'wechat',
      content: template,
      createdAt: ft.toISOString(),
    }
    result.todayFollowUpsAdded.push(record)
    result.newFollowUpsCount++

    const hourStr = `${ft.getHours().toString().padStart(2, '0')}:${ft.getMinutes().toString().padStart(2, '0')}`
    result.recentActivities.push(`${hourStr} 跟进记录：${template}`)
  }

  // Add 0-2 orders
  const newOrders = Math.random() > 0.3 ? (Math.floor(Math.random() * 2) + 1) : 0
  for (let i = 0; i < newOrders; i++) {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
    const qty = Math.floor(Math.random() * 3) + 1
    const price = getRandomPrice(product) * qty
    const ot = new Date(today.getTime() + (14 + i) * 3600000 + Math.floor(Math.random() * 3600000))

    const order: SalesOrder = {
      id: crypto.randomUUID(),
      leadId: crypto.randomUUID(),
      productName: product,
      quantity: qty,
      amount: price,
      orderStatus: 'paid',
      orderDate: ot.toISOString(),
    }
    result.todayOrdersAdded.push(order)
    result.newOrdersCount++
    result.todayRevenue += price

    const hourStr = `${ot.getHours().toString().padStart(2, '0')}:${ot.getMinutes().toString().padStart(2, '0')}`
    result.recentActivities.push(`${hourStr} 新增订单：${product} x${qty}，金额 ¥${price}`)
  }

  // Sort activities by time
  result.recentActivities.sort()

  return result
}

// --- Check if demo data has been initialized ---
export function isDemoInitialized(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(DEMO_INIT_KEY) === 'true'
  } catch { return false }
}

// --- Initialize demo data (only if no existing data) ---
export function initDemoData(): boolean {
  if (typeof window === 'undefined') return false

  try {
    // Check if there's already customer data
    const existingLeads = localStorage.getItem(LEADS_KEY)
    if (existingLeads && JSON.parse(existingLeads).length > 0) {
      return false // Don't override existing data
    }

    // Generate and save demo leads
    const leads = generateDemoLeads()
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads))

    // Generate and save demo orders
    const orders = generateDemoOrders(leads)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

    // Generate and save demo follow-ups
    const followUps = generateDemoFollowUps(leads)
    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps))

    // Mark as initialized
    localStorage.setItem(DEMO_INIT_KEY, 'true')

    return true
  } catch (e) {
    console.error('Failed to initialize demo data:', e)
    return false
  }
}

// --- Restore demo data (overwrites all existing data) ---
export function restoreDemoData(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear all existing data
    localStorage.removeItem(LEADS_KEY)
    localStorage.removeItem(ORDERS_KEY)
    localStorage.removeItem(FOLLOWUPS_KEY)
    localStorage.removeItem(DEMO_GROWTH_KEY)

    // Re-initialize
    const leads = generateDemoLeads()
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads))

    const orders = generateDemoOrders(leads)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

    const followUps = generateDemoFollowUps(leads)
    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps))

    localStorage.setItem(DEMO_INIT_KEY, 'true')
  } catch (e) {
    console.error('Failed to restore demo data:', e)
  }
}

// --- Run daily growth: adds small amounts of new data ---
export function runDailyGrowth(): DailyGrowthResult | null {
  if (typeof window === 'undefined') return null

  try {
    const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const lastGrowth = localStorage.getItem(DEMO_GROWTH_KEY)

    // Only grow once per day
    if (lastGrowth === todayStr) return null

    // Load existing data
    const leads: CustomerLead[] = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]')
    const orders: SalesOrder[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
    const followUps: FollowUpRecord[] = JSON.parse(localStorage.getItem(FOLLOWUPS_KEY) || '[]')

    if (leads.length === 0) return null // No data to grow

    const growth = generateDailyGrowth(new Date())

    // --- Add new leads ---
    for (const newLead of growth.todayLeadsAdded) {
      leads.push(newLead)
    }

    // --- Add follow-ups to random existing leads ---
    // Assign each new follow-up to a random lead
    let followUpIndex = 0
    const shuffledLeads = [...leads].sort(() => Math.random() - 0.5)
    for (const followUp of growth.todayFollowUpsAdded) {
      if (followUpIndex < shuffledLeads.length) {
        followUp.leadId = shuffledLeads[followUpIndex].id
        followUps.push(followUp)
        followUpIndex = (followUpIndex + 1) % shuffledLeads.length
      }
    }

    // --- Add orders to random "interested" or "contacted" leads ---
    let orderIndex = 0
    const promotableLeads = leads.filter(l => l.status === 'interested' || l.status === 'contacted')
    for (const order of growth.todayOrdersAdded) {
      if (orderIndex < promotableLeads.length) {
        order.leadId = promotableLeads[orderIndex].id
        orders.push(order)

        // Advance the lead's status
        const lead = leads.find(l => l.id === promotableLeads[orderIndex].id)
        if (lead) {
          lead.status = 'ordered'
          lead.updatedAt = new Date().toISOString()
        }
        orderIndex++
      }
    }

    // --- Random status advancements ---
    const advancements: { from: LeadStatus[]; to: LeadStatus }[] = [
      { from: ['new'], to: 'contacted' },
      { from: ['contacted'], to: 'interested' },
      { from: ['interested'], to: 'ordered' },
      { from: ['ordered'], to: 'repurchase_pending' },
    ]

    for (const adv of advancements) {
      const candidates = leads.filter(l => adv.from.includes(l.status) && l.createdAt < new Date(Date.now() - 2 * 86400000).toISOString())
      if (candidates.length > 0) {
        const toAdvance = candidates[Math.floor(Math.random() * candidates.length)]
        toAdvance.status = adv.to
        toAdvance.updatedAt = new Date().toISOString()
      }
    }

    // --- Cap leads at MAX_DEMO_LEADS ---
    if (leads.length > MAX_DEMO_LEADS) {
      // Keep: ordered, repurchase_pending, high_value; Remove: lost, old low-intent new/contacted
      const keep: CustomerLead[] = []
      const removeCandidates: CustomerLead[] = []

      for (const l of leads) {
        if (l.status === 'ordered' || l.status === 'repurchase_pending' || l.tags.includes('high_value') || l.intentionLevel >= 4) {
          keep.push(l)
        } else {
          removeCandidates.push(l)
        }
      }

      // Sort remove candidates: lost first, then oldest
      removeCandidates.sort((a, b) => {
        if (a.status === 'lost' && b.status !== 'lost') return -1
        if (a.status !== 'lost' && b.status === 'lost') return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      const toRemove = leads.length - MAX_DEMO_LEADS
      const removedIds = new Set(removeCandidates.slice(0, toRemove).map(l => l.id))

      // Filter leads
      const newLeads = leads.filter(l => !removedIds.has(l.id))
      localStorage.setItem(LEADS_KEY, JSON.stringify(newLeads))

      // Also remove associated orders and follow-ups
      const newOrders = orders.filter(o => !removedIds.has(o.leadId))
      localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders))

      const newFollowUps = followUps.filter(f => !removedIds.has(f.leadId))
      localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(newFollowUps))
    } else {
      // Save everything
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
      localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps))
    }

    // Mark today as growth day
    localStorage.setItem(DEMO_GROWTH_KEY, todayStr)

    return growth
  } catch (e) {
    console.error('Daily growth error:', e)
    return null
  }
}

// --- Get count of today's new leads from the data ---
export function getTodayNewLeadsCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const todayStart = new Date().toISOString().slice(0, 10)
    const leads: CustomerLead[] = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]')
    return leads.filter(l => l.createdAt && l.createdAt.startsWith(todayStart)).length
  } catch { return 0 }
}

// --- Get today's follow-ups from the data ---
export function getTodayFollowUps(): FollowUpRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const todayStart = new Date().toISOString().slice(0, 10)
    const allFollowUps: FollowUpRecord[] = JSON.parse(localStorage.getItem(FOLLOWUPS_KEY) || '[]')
    return allFollowUps.filter(f => f.createdAt && f.createdAt.startsWith(todayStart))
  } catch { return [] }
}

// --- Get today's orders from the data ---
export function getTodayOrders(): SalesOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const todayStart = new Date().toISOString().slice(0, 10)
    const allOrders: SalesOrder[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
    return allOrders.filter(o => o.orderDate && o.orderDate.startsWith(todayStart))
  } catch { return [] }
}

// --- Get leads that need follow-up today or overdue ---
export function getTodayFollowUpLeads(): CustomerLead[] {
  if (typeof window === 'undefined') return []
  try {
    const now = new Date()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const leads: CustomerLead[] = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]')
    return leads
      .filter(l => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= todayEnd && l.status !== 'lost')
      .sort((a, b) => new Date(a.nextFollowUpAt!).getTime() - new Date(b.nextFollowUpAt!).getTime())
      .slice(0, 10)
  } catch { return [] }
}

export type { DailyGrowthResult }
