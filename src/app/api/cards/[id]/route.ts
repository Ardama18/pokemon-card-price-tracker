import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cardId = parseInt(id)
    
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
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
          take: 50, // Get more price records for the detail page
        },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Get card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}