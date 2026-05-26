export interface MarketingContent {
  id: string
  type: "copywriting" | "video" | "sales_page" | "poster"
  title: string
  platform?: string
  contentUrl?: string
  createdAt: string
}

export interface ContentConversion {
  id: string
  contentId: string
  leadId?: string
  orderId?: string
  eventType: "view" | "consult" | "lead_created" | "order_created"
  createdAt: string
}
