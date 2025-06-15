import { PriceScraper, SearchResult, PriceData, ScraperConfig } from '@/types'

export abstract class BaseScraper implements PriceScraper {
  abstract name: string
  abstract baseUrl: string
  
  protected config: ScraperConfig
  public isEnabled: boolean
  public rateLimitMs: number

  constructor(config: ScraperConfig) {
    this.config = config
    this.isEnabled = config.enabled
    this.rateLimitMs = config.rateLimitMs
  }

  abstract searchCard(query: string): Promise<SearchResult[]>
  abstract getPrice(cardId: string): Promise<PriceData>

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    await this.delay(this.rateLimitMs)
    
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ...this.config.headers
    }

    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers
      }
    })
  }

  protected normalizeCardName(name: string): string {
    return name
      .trim()
      .replace(/[【】\[\]]/g, '')
      .replace(/\s+/g, ' ')
  }
}