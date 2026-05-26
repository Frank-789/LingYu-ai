import type {
  CustomerLead,
  FollowUpRecord,
  SalesOrder,
  FollowUpSuggestion,
  ProductRecommendation,
} from '@/lib/types/crm'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

const FOLLOW_UP_PROMPT = `你是一位资深的水果行业销售顾问。根据客户信息和跟进记录，生成一条专业的跟进建议。

客户信息包含：姓名、来源渠道、意向产品、意向等级、标签、当前状态。

请以JSON格式返回：
{
  "suggestedMessage": "建议发送给客户的跟进消息（200字以内）",
  "followUpReason": "为什么现在跟进以及跟进重点",
  "recommendedAction": "建议执行的操作（如：电话沟通、发送产品资料、邀约到店等）"
}`

const PRODUCT_RECOMMEND_PROMPT = `你是一位专业的水果产品推荐专家。根据客户信息和已有产品列表，推荐最适合该客户的水果产品。

客户信息包含：姓名、来源渠道、意向产品、意向等级、标签。

请以JSON格式返回：
{
  "recommendedProducts": ["推荐的产品名称1", "推荐的产品名称2", "推荐的产品名称3"],
  "recommendationReason": "推荐这些产品的原因分析",
  "suggestedSalesMessage": "给客户的推荐话术"
}`

async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

function parseJSON<T>(text: string): T | null {
  // Try direct parse first
  try {
    return JSON.parse(text) as T
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try {
        return JSON.parse(match[1]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

function getLeadSummary(lead: CustomerLead): string {
  const tags = lead.tags.length > 0 ? lead.tags.join(', ') : '无'
  return `姓名：${lead.name}
来源：${lead.source}
意向产品：${lead.interestedProduct || '未指定'}
意向等级：${lead.intentionLevel}/5
标签：${tags}
当前状态：${lead.status}
备注：${lead.note || '无'}`
}

function getRecentFollowUpsSummary(followUps: FollowUpRecord[]): string {
  if (followUps.length === 0) return '暂无跟进记录'
  return followUps
    .slice(0, 5)
    .map(f => `[${new Date(f.createdAt).toLocaleDateString('zh-CN')}] ${f.method}: ${f.content.slice(0, 100)}`)
    .join('\n')
}

function getRecentOrdersSummary(orders: SalesOrder[]): string {
  if (orders.length === 0) return '暂无订单记录'
  return orders
    .slice(0, 5)
    .map(o => `[${new Date(o.orderDate).toLocaleDateString('zh-CN')}] ${o.productName} x${o.quantity} = ¥${o.amount} (${o.orderStatus})`)
    .join('\n')
}

// Rule-based fallback suggestions
function generateFallbackFollowUpSuggestion(lead: CustomerLead, recentFollowUps: FollowUpRecord[]): FollowUpSuggestion {
  const statusMessages: Record<string, FollowUpSuggestion> = {
    new: {
      suggestedMessage: `您好，${lead.name}！我是果潮联盟的销售顾问。了解到您对我们${lead.interestedProduct || '水果产品'}感兴趣，想跟您详细介绍一下我们的产品和优惠活动，方便聊聊吗？`,
      followUpReason: '新线索需要在24小时内快速跟进，建立初步联系',
      recommendedAction: '微信或电话联系，了解客户具体需求',
    },
    contacted: {
      suggestedMessage: `${lead.name}，上次跟您聊到${lead.interestedProduct || '我们的产品'}，不知道您考虑得怎么样了？现在我们有一些新品上市，品质非常好，想邀请您了解一下。`,
      followUpReason: '已联系过但未成交，需要进一步培养意向',
      recommendedAction: '发送产品资料或样品图片，增强客户信任',
    },
    interested: {
      suggestedMessage: `${lead.name}您好！最近我们${lead.interestedProduct || '应季水果'}到了最好的季节，口感最佳，价格也很有优势。要不要趁现在下单尝一尝？老客户还有额外优惠哦！`,
      followUpReason: '客户有意向但未下单，需要推动决策',
      recommendedAction: '发送限时优惠信息，促成下单',
    },
    ordered: {
      suggestedMessage: `${lead.name}，感谢您的订单！您的${lead.interestedProduct || '商品'}已经开始安排发货了，到货后如果有任何问题随时联系我。期待您的反馈！`,
      followUpReason: '已下单客户需要售后关怀，维护关系',
      recommendedAction: '确认收货情况，收集使用反馈',
    },
    repurchase_pending: {
      suggestedMessage: `${lead.name}，您好！上次购买的${lead.interestedProduct || '水果'}应该吃得差不多了吧？现在我们又到了一批新品，品质一如既往的好，老客户复购有专属优惠价，要不要再来一单？`,
      followUpReason: '老客户有复购潜力，需及时触达',
      recommendedAction: '发送新品推荐和老客户优惠信息',
    },
    lost: {
      suggestedMessage: `${lead.name}，好久不见！我们最近推出了很多新品和优惠活动，不知道您是否还有水果方面的需求？很想有机会再次为您服务！`,
      followUpReason: '挽回流失客户，了解流失原因',
      recommendedAction: '了解客户最近需求，提供专属优惠',
    },
  }

  return statusMessages[lead.status] || statusMessages.new
}

function generateFallbackProductRecommendation(lead: CustomerLead): ProductRecommendation {
  const baseProducts = ['丹东99草莓', '新疆阿克苏苹果', '广西沃柑', '海南金钻凤梨', '四川爱媛果冻橙']

  return {
    recommendedProducts: baseProducts.slice(0, 3),
    recommendationReason: `根据客户${lead.name}的标签(${lead.tags.join('、') || '无'})和意向等级(${lead.intentionLevel}/5)，推荐当前应季热销水果`,
    suggestedSalesMessage: `${lead.name}，给您推荐几款我们最近卖得最好的水果：${baseProducts.slice(0, 3).join('、')}，现在正是最佳品尝季节，很多老客户都在回购！`,
  }
}

export async function generateFollowUpSuggestion(
  lead: CustomerLead,
  recentFollowUps: FollowUpRecord[],
  recentOrders: SalesOrder[]
): Promise<FollowUpSuggestion> {
  try {
    const userMessage = `客户信息：
${getLeadSummary(lead)}

近期跟进：
${getRecentFollowUpsSummary(recentFollowUps)}

近期订单：
${getRecentOrdersSummary(recentOrders)}`

    const content = await callDeepSeek([
      { role: 'system', content: FOLLOW_UP_PROMPT },
      { role: 'user', content: userMessage },
    ])

    const suggestion = parseJSON<FollowUpSuggestion>(content)
    if (suggestion && suggestion.suggestedMessage && suggestion.followUpReason) {
      return suggestion
    }

    return generateFallbackFollowUpSuggestion(lead, recentFollowUps)
  } catch (error) {
    console.error('AI follow-up suggestion error:', error)
    return generateFallbackFollowUpSuggestion(lead, recentFollowUps)
  }
}

export async function generateProductRecommendation(
  lead: CustomerLead,
  products?: string[]
): Promise<ProductRecommendation> {
  try {
    const productList = products && products.length > 0
      ? `可选产品列表：${products.join('、')}`
      : '无特定产品限制，请根据客户情况推荐合适的水果产品'

    const userMessage = `客户信息：
${getLeadSummary(lead)}

${productList}`

    const content = await callDeepSeek([
      { role: 'system', content: PRODUCT_RECOMMEND_PROMPT },
      { role: 'user', content: userMessage },
    ])

    const recommendation = parseJSON<ProductRecommendation>(content)
    if (recommendation && recommendation.recommendedProducts && recommendation.recommendedProducts.length > 0) {
      return recommendation
    }

    return generateFallbackProductRecommendation(lead)
  } catch (error) {
    console.error('AI product recommendation error:', error)
    return generateFallbackProductRecommendation(lead)
  }
}
