'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceRecord } from '@/types'
import { ExternalLink } from 'lucide-react'

interface CardItemProps {
  id: number
  name: string
  japanName?: string
  setName: string
  setNumber: string
  rarity?: string
  imageUrl?: string
  priceRecords: PriceRecord[]
}

export function CardItem({
  id,
  name,
  japanName,
  setName,
  setNumber,
  rarity,
  imageUrl,
  priceRecords
}: CardItemProps) {
  const lowestPrice = priceRecords.reduce((min, record) => 
    record.inStock && record.price < min ? record.price : min, 
    Infinity
  )

  const highestPrice = priceRecords.reduce((max, record) => 
    record.inStock && record.price > max ? record.price : max, 
    0
  )

  const formatPrice = (price: number) => {
    if (price === Infinity || price === 0) return '価格情報なし'
    return `¥${price.toLocaleString()}`
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          <div className="w-24 h-32 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center">
                画像なし
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-2">
              {name}
            </CardTitle>
            {japanName && (
              <p className="text-sm text-muted-foreground mb-2">{japanName}</p>
            )}
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">セット:</span> {setName}</p>
              <p><span className="font-medium">番号:</span> {setNumber}</p>
              {rarity && <p><span className="font-medium">レアリティ:</span> {rarity}</p>}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">価格帯:</span>
            <span className="text-sm">
              {formatPrice(lowestPrice)} 〜 {formatPrice(highestPrice)}
            </span>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">販売サイト別価格:</h4>
            <div className="space-y-1">
              {priceRecords.length > 0 ? (
                priceRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{record.source.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={record.inStock ? 'text-green-600' : 'text-red-500'}>
                        {record.inStock ? '在庫あり' : '在庫なし'}
                      </span>
                      <span className="font-medium">
                        {record.currency === 'JPY' ? '¥' : 
                         record.currency === 'USD' ? '$' : '€'}
                        {record.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">価格情報がありません</p>
              )}
              {priceRecords.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  他 {priceRecords.length - 3} 件
                </p>
              )}
            </div>
          </div>
          
          <div className="pt-2">
            <Link href={`/cards/${id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                詳細を見る
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}