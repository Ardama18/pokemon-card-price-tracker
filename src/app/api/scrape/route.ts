import { NextRequest, NextResponse } from 'next/server'
import { scraperManager } from '@/lib/scrapers/scraper-manager'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    await scraperManager.loadScrapers()
    const priceResults = await scraperManager.getAllPrices(query)

    const results = []
    for (const [scraperName, prices] of priceResults) {
      for (const priceData of prices) {
        let card = await prisma.card.findFirst({
          where: {
            OR: [
              { name: { contains: query } },
              { japanName: { contains: query } },
            ],
          },
        })

        if (!card) {
          card = await prisma.card.create({
            data: {
              name: query,
              setName: 'Unknown Set',
              setNumber: '000',
            },
          })
        }

        const source = await prisma.source.findUnique({
          where: { name: scraperName },
        })

        if (source) {
          const priceRecord = await prisma.priceRecord.create({
            data: {
              cardId: card.id,
              sourceId: source.id,
              price: priceData.price,
              currency: priceData.currency,
              condition: priceData.condition,
              inStock: priceData.inStock,
              productUrl: priceData.productUrl,
            },
          })

          results.push({
            card: card.name,
            source: source.name,
            price: priceData.price,
            currency: priceData.currency,
            inStock: priceData.inStock,
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Scraping completed',
      results,
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}