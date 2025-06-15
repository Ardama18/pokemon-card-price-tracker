'use client'

export interface WatchlistItem {
  cardId: number
  cardName: string
  setName: string
  imageUrl?: string
  addedAt: string
}

const WATCHLIST_KEY = 'pokemon-watchlist'

export class WatchlistManager {
  // Get all watchlist items
  static getWatchlist(): WatchlistItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading watchlist:', error)
      return []
    }
  }

  // Add card to watchlist
  static addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const watchlist = this.getWatchlist()
      
      // Check if already in watchlist
      if (watchlist.some(w => w.cardId === item.cardId)) {
        return false // Already in watchlist
      }

      const newItem: WatchlistItem = {
        ...item,
        addedAt: new Date().toISOString()
      }

      watchlist.push(newItem)
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
      return true
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      return false
    }
  }

  // Remove card from watchlist
  static removeFromWatchlist(cardId: number): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const watchlist = this.getWatchlist()
      const filtered = watchlist.filter(item => item.cardId !== cardId)
      
      if (filtered.length === watchlist.length) {
        return false // Item not found
      }

      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      return false
    }
  }

  // Check if card is in watchlist
  static isInWatchlist(cardId: number): boolean {
    if (typeof window === 'undefined') return false
    
    const watchlist = this.getWatchlist()
    return watchlist.some(item => item.cardId === cardId)
  }

  // Clear entire watchlist
  static clearWatchlist(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.removeItem(WATCHLIST_KEY)
      return true
    } catch (error) {
      console.error('Error clearing watchlist:', error)
      return false
    }
  }

  // Get watchlist count
  static getWatchlistCount(): number {
    return this.getWatchlist().length
  }
}