export interface PriceScraper {
  name: string
  baseUrl: string
  searchCard(query: string): Promise<SearchResult[]>
  getPrice(cardId: string): Promise<PriceData>
  isEnabled: boolean
  rateLimitMs: number
}

export interface SearchResult {
  cardId: string
  name: string
  setName: string
  setNumber: string
  imageUrl?: string
  rarity?: string
}

export interface PriceData {
  price: number
  currency: string
  condition?: string
  inStock: boolean
  productUrl?: string
  scrapedAt: Date
}

export interface CardWithPrices {
  id: number
  name: string
  japanName?: string
  setName: string
  setNumber: string
  rarity?: string
  cardType?: string
  series?: string
  imageUrl?: string
  priceRecords: PriceRecord[]
}

export interface PriceRecord {
  id: number
  price: number
  currency: string
  condition?: string
  inStock: boolean
  productUrl?: string
  scrapedAt: Date
  source: {
    id: number
    name: string
    baseUrl: string
  }
}

export interface ScraperConfig {
  enabled: boolean
  rateLimitMs: number
  baseUrl: string
  searchPath?: string
  headers?: Record<string, string>
  [key: string]: any
}