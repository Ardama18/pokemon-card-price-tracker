import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pokemonTCGAPI } from '@/lib/pokemon-tcg-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Search Pokemon TCG API for cards
    const tcgResponse = await pokemonTCGAPI.searchCards(query, {
      pageSize: 20,
      orderBy: '-set.releaseDate'
    })

    // Convert TCG API results to our format and store in database if needed
    const cardsWithPrices = await Promise.all(
      tcgResponse.data.map(async (tcgCard) => {
        const convertedCard = pokemonTCGAPI.convertToInternalCard(tcgCard)
        
        // Check if card exists in our database, if not create it
        let dbCard = await prisma.card.findFirst({
          where: {
            AND: [
              { setName: convertedCard.setName },
              { setNumber: convertedCard.setNumber }
            ]
          },
          include: {
            priceRecords: {
              include: {
                source: {
                  select: {
                    id: true,
                    name: true,
                    baseUrl: true,
                  },
                },
              },
              orderBy: {
                scrapedAt: 'desc',
              },
              take: 10,
            },
          },
        })

        // If card doesn't exist, create it
        if (!dbCard) {
          dbCard = await prisma.card.create({
            data: {
              name: convertedCard.name,
              setName: convertedCard.setName,
              setNumber: convertedCard.setNumber,
              rarity: convertedCard.rarity,
              cardType: convertedCard.cardType,
              series: convertedCard.series,
              imageUrl: convertedCard.imageUrl,
            },
            include: {
              priceRecords: {
                include: {
                  source: {
                    select: {
                      id: true,
                      name: true,
                      baseUrl: true,
                    },
                  },
                },
                orderBy: {
                  scrapedAt: 'desc',
                },
                take: 10,
              },
            },
          })
        }

        // Extract and store current prices from Pokemon TCG API
        const currentPrices = pokemonTCGAPI.extractPrices(tcgCard)
        
        for (const priceData of currentPrices) {
          // Find or create source
          let source = await prisma.source.findFirst({
            where: { name: priceData.source }
          })

          if (!source) {
            try {
              source = await prisma.source.create({
                data: {
                  name: priceData.source,
                  baseUrl: priceData.source === 'TCGPlayer' ? 'https://www.tcgplayer.com' : 'https://www.cardmarket.com',
                  isActive: true,
                  rateLimitMs: 3000,
                }
              })
            } catch (error) {
              // If unique constraint fails, try to find again (race condition)
              source = await prisma.source.findFirst({
                where: { name: priceData.source }
              })
              if (!source) {
                throw error
              }
            }
          }

          // Check if we already have a recent price record (within last hour)
          const recentPrice = await prisma.priceRecord.findFirst({
            where: {
              cardId: dbCard.id,
              sourceId: source.id,
              condition: priceData.condition,
              scrapedAt: {
                gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
              }
            }
          })

          // Only create new price record if we don't have a recent one
          if (!recentPrice) {
            await prisma.priceRecord.create({
              data: {
                cardId: dbCard.id,
                sourceId: source.id,
                price: priceData.price,
                currency: priceData.currency,
                condition: priceData.condition,
                productUrl: priceData.productUrl,
                inStock: true,
              }
            })
          }
        }

        // Refresh the card data with updated price records
        const updatedCard = await prisma.card.findUnique({
          where: { id: dbCard.id },
          include: {
            priceRecords: {
              include: {
                source: {
                  select: {
                    id: true,
                    name: true,
                    baseUrl: true,
                  },
                },
              },
              orderBy: {
                scrapedAt: 'desc',
              },
              take: 10,
            },
          },
        })

        return updatedCard
      })
    )

    return NextResponse.json(cardsWithPrices.filter(Boolean))
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}