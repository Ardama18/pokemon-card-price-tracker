'use client'

import { CardItem } from './card-item'
import { CardWithPrices } from '@/types'

interface CardGridProps {
  cards: CardWithPrices[]
  isLoading?: boolean
}

export function CardGrid({ cards, isLoading }: CardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-96 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          カードが見つかりませんでした
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          別のキーワードで検索してみてください
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <CardItem key={card.id} {...card} />
      ))}
    </div>
  )
}