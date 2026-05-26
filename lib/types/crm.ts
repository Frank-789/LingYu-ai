export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "ordered"
  | "repurchase_pending"
  | "lost"

export type LeadSource =
  | "douyin"
  | "xiaohongshu"
  | "wechat"
  | "offline"
  | "referral"
  | "video"
  | "other"

export type CustomerTag =
  | "high_value"
  | "gift_customer"
  | "wholesale"
  | "old_customer"
  | "price_sensitive"
  | "festival_buyer"
  | "after_sales_sensitive"

export interface CustomerLead {
  id: string
  name: string
  phone?: string
  wechat?: string
  source: LeadSource
  interestedProduct?: string
  intentionLevel: 1 | 2 | 3 | 4 | 5
  status: LeadStatus
  tags: CustomerTag[]
  note?: string
  nextFollowUpAt?: string
  createdAt: string
  updatedAt: string
}

export interface FollowUpRecord {
  id: string
  leadId: string
  method: "wechat" | "phone" | "sms" | "offline" | "other"
  content: string
  aiSuggestion?: string
  createdAt: string
}

export interface SalesOrder {
  id: string
  leadId: string
  productName: string
  quantity: number
  amount: number
  orderStatus: "pending" | "paid" | "shipped" | "completed" | "refunded"
  orderDate: string
  expectedRepurchaseDate?: string
}

export interface AfterSalesRecord {
  id: string
  leadId: string
  orderId?: string
  issueType: "bad_fruit" | "logistics_delay" | "refund" | "resend" | "complaint" | "other"
  description: string
  status: "open" | "processing" | "resolved"
  createdAt: string
}

export interface FollowUpSuggestion {
  suggestedMessage: string
  followUpReason: string
  recommendedAction: string
}

export interface ProductRecommendation {
  recommendedProducts: string[]
  recommendationReason: string
  suggestedSalesMessage: string
}

export interface DashboardData {
  totalLeads: number
  newLeadsToday: number
  convertedLeads: number
  conversionRate: number
  totalRevenue: number
  averageOrderValue: number
  repeatCustomers: number
  pendingFollowUps: number
  leadsBySource: Record<string, number>
  leadsByStatus: Record<string, number>
}
