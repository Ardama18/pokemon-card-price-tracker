'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { CardGrid } from '@/components/cards/card-grid'
import { CardWithPrices } from '@/types'

export default function Home() {
  const [cards, setCards] = useState<CardWithPrices[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/cards/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      } else {
        console.error('Search failed')
        setCards([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ポケモンカード価格比較
            </h1>
            <p className="text-lg text-gray-600">
              複数のサイトからポケモンカードの価格を比較検索
            </p>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasSearched ? (
          <CardGrid cards={cards} isLoading={isLoading} />
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                カードを検索してみましょう
              </h2>
              <p className="text-gray-600 mb-8">
                カード名、セット名、または日本語名で検索できます。
                複数のサイトから最新の価格情報を取得します。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">検索例:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• ピカチュウ</li>
                  <li>• リザードン</li>
                  <li>• ポケモンカード151</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 ポケモンカード価格比較サイト. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}