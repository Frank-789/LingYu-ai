export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  blocks?: MessageBlock[]
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ChatState {
  chats: Record<string, Chat>
  activeChatId: string | null
}

// --- Rich Block Types ---

export type BlockType = 'priceTag' | 'scoreCard' | 'fruitCalendar' | 'checklist'

export interface MessageBlock {
  type: BlockType
  data: PriceTagData | ScoreCardData | FruitCalendarData | ChecklistData
}

// Price Tag
export interface PriceTagData {
  product: string
  headline: string
  price: string
  unit: string
  origin: string
  features: string[]
  colorScheme: 'green' | 'orange' | 'red' | 'purple'
  promotionText?: string
  emoji: string
}

// Score Card
export interface ScoreCardData {
  overall: number
  categories: ScoreCategory[]
  strengths: string[]
  weaknesses: string[]
}

export interface ScoreCategory {
  name: string
  score: number
  max: number
  comment: string
  suggestions: string[]
}

// Fruit Calendar
export interface FruitCalendarData {
  month: number
  fruits: FruitItem[]
}

export interface FruitItem {
  name: string
  emoji: string
  seasonStart: number
  seasonEnd: number
  regions: string[]
  marketingTip: string
  priceRange: string
  peakWeek: number
}

// Checklist
export interface ChecklistData {
  title: string
  items: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  text: string
  category: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
}
