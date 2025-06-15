import { PriceScraper, PriceData, SearchResult, ScraperConfig } from '@/types'
import { prisma } from '@/lib/prisma'

export class ScraperManager {
  private scrapers: Map<string, PriceScraper> = new Map()
  private lastRunTimes: Map<string, number> = new Map()

  async loadScrapers(): Promise<void> {
    const sources = await prisma.source.findMany({
      where: { isActive: true }
    })

    for (const source of sources) {
      try {
        const config: ScraperConfig = {
          enabled: source.isActive,
          rateLimitMs: source.rateLimitMs,
          baseUrl: source.baseUrl,
          ...(source.config ? JSON.parse(source.config) : {})
        }

        const scraperModule = await this.loadScraperModule(source.name)
        const scraper = new scraperModule.default(config)
        
        this.registerScraper(scraper)
      } catch (error) {
        console.error(`Failed to load scraper ${source.name}:`, error)
      }
    }
  }

  private async loadScraperModule(name: string) {
    const scraperMap: Record<string, () => Promise<any>> = {
      'sample': () => import('./sample-scraper'),
    }

    if (!scraperMap[name]) {
      throw new Error(`Scraper ${name} not found`)
    }

    return scraperMap[name]()
  }

  registerScraper(scraper: PriceScraper): void {
    this.scrapers.set(scraper.name, scraper)
  }

  unregisterScraper(name: string): void {
    this.scrapers.delete(name)
  }

  getActiveScraper(name: string): PriceScraper | undefined {
    const scraper = this.scrapers.get(name)
    return scraper?.isEnabled ? scraper : undefined
  }

  getActiveScrapers(): PriceScraper[] {
    return Array.from(this.scrapers.values()).filter(s => s.isEnabled)
  }

  async searchAllSources(query: string): Promise<Map<string, SearchResult[]>> {
    const results = new Map<string, SearchResult[]>()
    const activeScrapers = this.getActiveScrapers()

    const searchPromises = activeScrapers.map(async (scraper) => {
      try {
        await this.enforceRateLimit(scraper.name)
        const searchResults = await scraper.searchCard(query)
        results.set(scraper.name, searchResults)
        this.updateLastRunTime(scraper.name)
      } catch (error) {
        console.error(`Search failed for ${scraper.name}:`, error)
        results.set(scraper.name, [])
      }
    })

    await Promise.allSettled(searchPromises)
    return results
  }

  async getAllPrices(cardQuery: string): Promise<Map<string, PriceData[]>> {
    const searchResults = await this.searchAllSources(cardQuery)
    const priceResults = new Map<string, PriceData[]>()

    for (const [scraperName, results] of searchResults) {
      const scraper = this.getActiveScraper(scraperName)
      if (!scraper || results.length === 0) {
        priceResults.set(scraperName, [])
        continue
      }

      try {
        await this.enforceRateLimit(scraperName)
        const prices = await Promise.all(
          results.slice(0, 5).map(result => scraper.getPrice(result.cardId))
        )
        priceResults.set(scraperName, prices.filter(Boolean))
        this.updateLastRunTime(scraperName)
      } catch (error) {
        console.error(`Price fetch failed for ${scraperName}:`, error)
        priceResults.set(scraperName, [])
      }
    }

    return priceResults
  }

  async enableScraper(name: string): Promise<void> {
    const scraper = this.scrapers.get(name)
    if (scraper) {
      scraper.isEnabled = true
      await prisma.source.update({
        where: { name },
        data: { isActive: true }
      })
    }
  }

  async disableScraper(name: string): Promise<void> {
    const scraper = this.scrapers.get(name)
    if (scraper) {
      scraper.isEnabled = false
      await prisma.source.update({
        where: { name },
        data: { isActive: false }
      })
    }
  }

  private async enforceRateLimit(scraperName: string): Promise<void> {
    const lastRun = this.lastRunTimes.get(scraperName) || 0
    const scraper = this.scrapers.get(scraperName)
    if (!scraper) return

    const timeSinceLastRun = Date.now() - lastRun
    if (timeSinceLastRun < scraper.rateLimitMs) {
      const waitTime = scraper.rateLimitMs - timeSinceLastRun
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  private updateLastRunTime(scraperName: string): void {
    this.lastRunTimes.set(scraperName, Date.now())
  }
}

export const scraperManager = new ScraperManager()