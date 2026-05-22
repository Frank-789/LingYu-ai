import type { MessageBlock, PriceTagData, ScoreCardData, FruitCalendarData, ChecklistData } from '@/types'
import { PriceTagCard } from './PriceTagCard'
import { ScoreCard } from './ScoreCard'
import { FruitCalendar } from './FruitCalendar'
import { Checklist } from './Checklist'

export function BlockRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="space-y-4 my-3">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'priceTag':
            return <PriceTagCard key={i} data={block.data as PriceTagData} />
          case 'scoreCard':
            return <ScoreCard key={i} data={block.data as ScoreCardData} />
          case 'fruitCalendar':
            return <FruitCalendar key={i} data={block.data as FruitCalendarData} />
          case 'checklist':
            return <Checklist key={i} data={block.data as ChecklistData} />
          default:
            return null
        }
      })}
    </div>
  )
}
