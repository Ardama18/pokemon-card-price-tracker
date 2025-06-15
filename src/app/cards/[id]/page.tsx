'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CardWithPrices } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PriceChart } from '@/components/charts/price-chart'
import { WatchlistManager } from '@/lib/watchlist'
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Heart, HeartOff } from 'lucide-react'

export default function CardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [card, setCard] = useState<CardWithPrices | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/cards/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCard(data)
          // Check if card is in watchlist
          setIsInWatchlist(WatchlistManager.isInWatchlist(data.id))
        } else {
          setError('カードが見つかりませんでした')
        }
      } catch (err) {
        setError('データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCard()
    }
  }, [params.id])

  const handleWatchlistToggle = () => {
    if (!card) return

    if (isInWatchlist) {
      const success = WatchlistManager.removeFromWatchlist(card.id)
      if (success) {
        setIsInWatchlist(false)
      }
    } else {
      const success = WatchlistManager.addToWatchlist({
        cardId: card.id,
        cardName: card.name,
        setName: card.setName,
        imageUrl: card.imageUrl
      })
      if (success) {
        setIsInWatchlist(true)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'カードが見つかりませんでした'}
          </h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    )
  }

  const currentPrices = card.priceRecords.slice(0, 5)
  const hasMultiplePrices = card.priceRecords.length > 1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            検索結果に戻る
          </Button>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <Card className="p-6">
                <div className="text-center">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open(card.imageUrl, '_blank')}
                    />
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:w-2/3">
              <Card className="p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {card.name}
                    </h1>
                    {card.japanName && (
                      <p className="text-xl text-gray-600">{card.japanName}</p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleWatchlistToggle}
                    variant={isInWatchlist ? "default" : "outline"}
                    className={isInWatchlist ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {isInWatchlist ? (
                      <>
                        <Heart className="mr-2 h-4 w-4 fill-current" />
                        ウォッチリストから削除
                      </>
                    ) : (
                      <>
                        <HeartOff className="mr-2 h-4 w-4" />
                        ウォッチリストに追加
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700">セット</h3>
                    <p className="text-gray-600">{card.setName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">番号</h3>
                    <p className="text-gray-600">{card.setNumber}</p>
                  </div>
                  {card.rarity && (
                    <div>
                      <h3 className="font-semibold text-gray-700">レアリティ</h3>
                      <p className="text-gray-600">{card.rarity}</p>
                    </div>
                  )}
                  {card.cardType && (
                    <div>
                      <h3 className="font-semibold text-gray-700">タイプ</h3>
                      <p className="text-gray-600">{card.cardType}</p>
                    </div>
                  )}
                </div>

                {card.series && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700">シリーズ</h3>
                    <p className="text-gray-600">{card.series}</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">現在の価格</h2>
                
                {currentPrices.length > 0 ? (
                  <div className="space-y-4">
                    {currentPrices.map((priceRecord) => (
                      <div 
                        key={priceRecord.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {priceRecord.source.name}
                            </h3>
                            {priceRecord.condition && (
                              <p className="text-sm text-gray-600">
                                {priceRecord.condition}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {priceRecord.currency === 'JPY' ? '¥' : 
                             priceRecord.currency === 'USD' ? '$' : '€'}
                            {priceRecord.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(priceRecord.scrapedAt).toLocaleDateString('ja-JP')}
                          </div>
                          {priceRecord.productUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(priceRecord.productUrl, '_blank')}
                              className="mt-1"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              購入サイトへ
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">価格情報がありません</p>
                )}
              </Card>

              {hasMultiplePrices && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">価格推移</h2>
                  <PriceChart cardId={card.id} />
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}