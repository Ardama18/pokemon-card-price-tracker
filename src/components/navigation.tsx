'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WatchlistManager } from '@/lib/watchlist'
import { Heart, Search } from 'lucide-react'

export function Navigation() {
  const [watchlistCount, setWatchlistCount] = useState(0)

  useEffect(() => {
    // Update watchlist count on mount and whenever localStorage changes
    const updateCount = () => {
      setWatchlistCount(WatchlistManager.getWatchlistCount())
    }

    updateCount()

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', updateCount)
    
    // Also check periodically for updates from the current tab
    const interval = setInterval(updateCount, 1000)

    return () => {
      window.removeEventListener('storage', updateCount)
      clearInterval(interval)
    }
  }, [])

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                ポケモンカード価格比較
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              ホーム
            </Link>
            
            <Link 
              href="/watchlist" 
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium relative"
            >
              <Heart className="h-5 w-5" />
              <span>ウォッチリスト</span>
              {watchlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {watchlistCount > 99 ? '99+' : watchlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}