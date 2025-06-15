'use client'

import { useState, useEffect } from 'react'
import { WatchlistManager, WatchlistItem } from '@/lib/watchlist'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setWatchlist(WatchlistManager.getWatchlist())
    setIsLoading(false)
  }, [])

  const handleRemoveFromWatchlist = (cardId: number) => {
    const success = WatchlistManager.removeFromWatchlist(cardId)
    if (success) {
      setWatchlist(WatchlistManager.getWatchlist())
    }
  }

  const handleClearWatchlist = () => {
    if (confirm('ウォッチリストを全て削除しますか？')) {
      WatchlistManager.clearWatchlist()
      setWatchlist([])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ウォッチリスト
              </h1>
              <p className="text-gray-600 mt-2">
                お気に入りのカードを追跡しましょう
              </p>
            </div>
            
            {watchlist.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWatchlist}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                全て削除
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                ウォッチリストは空です
              </h2>
              <p className="text-gray-600 mb-8">
                カード詳細ページから「ウォッチリストに追加」ボタンを押してカードを追跡しましょう。
              </p>
              <Link href="/">
                <Button>
                  カードを検索する
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {watchlist.length} 枚のカードを追跡中
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlist.map((item) => (
                <Card key={item.cardId} className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.cardName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center">
                          画像なし
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2">
                        {item.cardName}
                      </h3>
                      <p className="text-gray-600 mb-2">{item.setName}</p>
                      <p className="text-sm text-gray-500">
                        追加日: {new Date(item.addedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/cards/${item.cardId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        詳細を見る
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(item.cardId)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}