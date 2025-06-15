interface PokemonPriceTrackerCard {
  id: string
  name: string
  setName: string
  number: string
  rarity: string
  imageUrl: string
  prices: {
    tcgplayer?: {
      marketPrice: number
      lowPrice: number
      midPrice: number
      highPrice: number
      subTypeName: string
    }
    ebay?: {
      averagePrice: number
      recentSales: Array<{
        price: number
        date: string
        condition: string
      }>
    }
    cardmarket?: {
      averagePrice: number
      lowPrice: number
      trendPrice: number
    }
  }
}

interface PokemonPriceTrackerResponse {
  data: PokemonPriceTrackerCard[]
  success: boolean
  message?: string
}

interface PriceHistoryResponse {
  data: Array<{
    date: string
    price: number
    source: string
    condition: string
  }>
  success: boolean
}

export class PokemonPriceTrackerAPI {
  private baseUrl = 'https://www.pokemonpricetracker.com/api/v1'
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`Pokemon Price Tracker API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async searchPrices(query: string, options?: {
    limit?: number
  }): Promise<PokemonPriceTrackerResponse> {
    const params: Record<string, string> = {
      q: query,
      limit: (options?.limit || 20).toString(),
    }

    return this.request<PokemonPriceTrackerResponse>('/prices', params)
  }

  async getPriceHistory(cardId: string, options?: {
    days?: number
    source?: string
  }): Promise<PriceHistoryResponse> {
    const params: Record<string, string> = {
      cardId,
      days: (options?.days || 30).toString(),
    }

    if (options?.source) {
      params.source = options.source
    }

    return this.request<PriceHistoryResponse>('/prices/history', params)
  }

  async getSets(): Promise<{ data: Array<{ id: string; name: string; releaseDate: string }> }> {
    return this.request<{ data: Array<{ id: string; name: string; releaseDate: string }> }>('/sets')
  }

  // Convert Pokemon Price Tracker data to our internal format
  convertToInternalPrices(card: PokemonPriceTrackerCard): Array<{
    source: string
    price: number
    currency: string
    condition?: string
    productUrl?: string
  }> {
    const prices: Array<{
      source: string
      price: number
      currency: string
      condition?: string
      productUrl?: string
    }> = []

    // TCGPlayer prices
    if (card.prices.tcgplayer) {
      if (card.prices.tcgplayer.marketPrice > 0) {
        prices.push({
          source: 'TCGPlayer',
          price: card.prices.tcgplayer.marketPrice,
          currency: 'USD',
          condition: card.prices.tcgplayer.subTypeName || 'market'
        })
      }
      
      if (card.prices.tcgplayer.lowPrice > 0) {
        prices.push({
          source: 'TCGPlayer',
          price: card.prices.tcgplayer.lowPrice,
          currency: 'USD',
          condition: 'low'
        })
      }
    }

    // eBay prices
    if (card.prices.ebay) {
      if (card.prices.ebay.averagePrice > 0) {
        prices.push({
          source: 'eBay',
          price: card.prices.ebay.averagePrice,
          currency: 'USD',
          condition: 'average'
        })
      }

      // Recent sales
      if (card.prices.ebay.recentSales) {
        card.prices.ebay.recentSales.slice(0, 3).forEach(sale => {
          prices.push({
            source: 'eBay',
            price: sale.price,
            currency: 'USD',
            condition: sale.condition
          })
        })
      }
    }

    // CardMarket prices
    if (card.prices.cardmarket) {
      if (card.prices.cardmarket.averagePrice > 0) {
        prices.push({
          source: 'CardMarket',
          price: card.prices.cardmarket.averagePrice,
          currency: 'EUR',
          condition: 'average'
        })
      }
      
      if (card.prices.cardmarket.trendPrice > 0) {
        prices.push({
          source: 'CardMarket',
          price: card.prices.cardmarket.trendPrice,
          currency: 'EUR',
          condition: 'trend'
        })
      }
    }

    return prices
  }

  // Check if API key is configured and valid
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false
    }

    try {
      await this.request('/sets', { limit: '1' })
      return true
    } catch (error) {
      console.error('Pokemon Price Tracker API key validation failed:', error)
      return false
    }
  }
}

export const pokemonPriceTrackerAPI = new PokemonPriceTrackerAPI(process.env.POKEMON_PRICE_TRACKER_API_KEY)