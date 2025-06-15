import { BaseScraper } from './base-scraper'
import { SearchResult, PriceData } from '@/types'

export default class SampleScraper extends BaseScraper {
  name = 'sample'
  baseUrl = 'https://example.com'

  async searchCard(query: string): Promise<SearchResult[]> {
    const normalizedQuery = this.normalizeCardName(query)
    
    return [
      {
        cardId: 'sample-1',
        name: normalizedQuery,
        setName: 'Sample Set',
        setNumber: '001',
        imageUrl: 'https://example.com/card1.jpg',
        rarity: 'Rare'
      },
      {
        cardId: 'sample-2', 
        name: normalizedQuery + ' Alt',
        setName: 'Sample Set',
        setNumber: '002',
        imageUrl: 'https://example.com/card2.jpg',
        rarity: 'Ultra Rare'
      }
    ]
  }

  async getPrice(cardId: string): Promise<PriceData> {
    const basePrice = Math.floor(Math.random() * 10000) + 1000
    
    return {
      price: basePrice,
      currency: 'JPY',
      condition: 'mint',
      inStock: Math.random() > 0.3,
      productUrl: `${this.baseUrl}/card/${cardId}`,
      scrapedAt: new Date()
    }
  }
}