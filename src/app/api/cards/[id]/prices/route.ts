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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const source = searchParams.get('source')
    const currency = searchParams.get('currency')

    // Build where clause
    const where: Record<string, unknown> = {
      cardId: cardId,
      scrapedAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    }

    if (source) {
      where.source = { name: source }
    }

    if (currency) {
      where.currency = currency
    }

    const priceRecords = await prisma.priceRecord.findMany({
      where,
      include: {
        source: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scrapedAt: 'desc',
      },
      take: 200, // Limit to prevent too much data
    })

    return NextResponse.json(priceRecords)
  } catch (error) {
    console.error('Get price history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}