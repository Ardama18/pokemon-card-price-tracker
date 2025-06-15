import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pokemonPriceTrackerAPI } from '@/lib/pokemon-price-tracker-api'

export async function POST(_request: NextRequest) {
  try {
    // Check if API key is configured
    const isValidKey = await pokemonPriceTrackerAPI.validateApiKey()
    
    if (!isValidKey) {
      console.log('Pokemon Price Tracker API key not configured or invalid, skipping price update')
      return NextResponse.json({ 
        message: 'Pokemon Price Tracker API key not configured or invalid',
        updated: 0 
      })
    }

    // Get cards that haven't been updated in the last 6 hours
    const staleCards = await prisma.card.findMany({
      where: {
        OR: [
          {
            priceRecords: {
              none: {}
            }
          },
          {
            priceRecords: {
              every: {
                scrapedAt: {
                  lt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
                }
              }
            }
          }
        ]
      },
      take: 10, // Limit to 10 cards per run to respect rate limits
      orderBy: {
        updatedAt: 'asc'
      }
    })

    let updatedCount = 0

    for (const card of staleCards) {
      try {
        // Search for the card in Pokemon Price Tracker
        const priceResponse = await pokemonPriceTrackerAPI.searchPrices(
          `${card.name} ${card.setName}`,
          { limit: 1 }
        )

        if (priceResponse.success && priceResponse.data.length > 0) {
          const priceData = priceResponse.data[0]
          const internalPrices = pokemonPriceTrackerAPI.convertToInternalPrices(priceData)

          // Store new price records
          for (const priceInfo of internalPrices) {
            // Find or create source
            let source = await prisma.source.findFirst({
              where: { name: priceInfo.source }
            })

            if (!source) {
              const sourceUrls: Record<string, string> = {
                'TCGPlayer': 'https://www.tcgplayer.com',
                'eBay': 'https://www.ebay.com',
                'CardMarket': 'https://www.cardmarket.com'
              }

              source = await prisma.source.create({
                data: {
                  name: priceInfo.source,
                  baseUrl: sourceUrls[priceInfo.source] || '',
                  isActive: true,
                  rateLimitMs: 3000,
                }
              })
            }

            // Check if we already have a recent price record (within last hour) for this exact condition
            const recentPrice = await prisma.priceRecord.findFirst({
              where: {
                cardId: card.id,
                sourceId: source.id,
                condition: priceInfo.condition,
                scrapedAt: {
                  gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
                }
              }
            })

            // Only create new price record if we don't have a recent one
            if (!recentPrice) {
              await prisma.priceRecord.create({
                data: {
                  cardId: card.id,
                  sourceId: source.id,
                  price: priceInfo.price,
                  currency: priceInfo.currency,
                  condition: priceInfo.condition,
                  productUrl: priceInfo.productUrl,
                  inStock: true,
                }
              })
            }
          }

          // Update card timestamp
          await prisma.card.update({
            where: { id: card.id },
            data: { updatedAt: new Date() }
          })

          updatedCount++
        }

        // Rate limiting - wait 3 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error) {
        console.error(`Failed to update prices for card ${card.id}:`, error)
        continue
      }
    }

    return NextResponse.json({ 
      message: `Successfully updated prices for ${updatedCount} cards`,
      updated: updatedCount,
      total: staleCards.length
    })

  } catch (error) {
    console.error('Price update job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}